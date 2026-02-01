import type { NextApiRequest, NextApiResponse } from "next";

type AnalysisItem = {
  type: "positive" | "negative" | "suggestion";
  text: string;
  scoreImpact?: number;
  suggestion?: string;
};

type AnalysisSection = {
  title: string;
  icon: string;
  color: string;
  items: AnalysisItem[];
};

type AnalysisResult = {
  profileUrl: string;
  sections: AnalysisSection[];
  profileData: ProfileInput;
};

type ProfileInput = {
  profileUrl?: string;
  headline?: string;
  summary?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  profileText?: string;
  targetKeywords?: string[];
};

type ScoreResult = {
  score: number;
  items: AnalysisItem[];
  suggestions: AnalysisItem[];
};

const WEIGHTS = {
  headline: 20,
  summary: 25,
  experience: 25,
  skills: 20,
  engagement: 10,
};

const DEFAULT_KEYWORDS = [
  "education",
  "teaching",
  "training",
  "leadership",
  "curriculum",
  "assessment",
  "learning",
  "classroom",
  "student",
  "mentoring",
];

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const normalize = (value: string) => value.trim().toLowerCase();

const wordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const hasNumbers = (text: string) => /\d+/.test(text);

const countMatches = (text: string, keywords: string[]) => {
  const normalized = normalize(text);
  return keywords.reduce((count, keyword) => {
    if (!keyword) return count;
    return normalized.includes(normalize(keyword)) ? count + 1 : count;
  }, 0);
};

const splitKeywords = (value?: string[]) =>
  Array.isArray(value)
    ? value.map((keyword) => keyword.trim()).filter(Boolean)
    : [];

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(/[,|]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const compactText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const buildProfileText = (parts: string[]) =>
  parts.map((part) => part.trim()).filter(Boolean).join("\n");

const fetchLinkedInProfile = async (linkedinUrl: string) => {
  const apiKey = process.env.RAPIDAPI_KEY ?? process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const apiHost =
    process.env.LINKEDIN_RAPIDAPI_HOST ??
    process.env.NEXT_PUBLIC_LINKEDIN_RAPIDAPI_HOST ??
    "fresh-linkedin-profile-data.p.rapidapi.com";

  if (!apiKey) {
    throw new Error("Missing RAPIDAPI_KEY");
  }

  const url = new URL(`https://${apiHost}/enrich-lead`);
  url.searchParams.set("linkedin_url", linkedinUrl);
  url.searchParams.set("include_skills", "false");
  url.searchParams.set("include_certifications", "false");
  url.searchParams.set("include_publications", "false");
  url.searchParams.set("include_honors", "false");
  url.searchParams.set("include_volunteers", "false");
  url.searchParams.set("include_projects", "false");
  url.searchParams.set("include_patents", "false");
  url.searchParams.set("include_courses", "false");
  url.searchParams.set("include_organizations", "false");
  url.searchParams.set("include_profile_status", "false");
  url.searchParams.set("include_company_public_url", "false");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": apiHost,
    },
  });

  if (!response.ok) {
    const fallbackUrl = new URL(`https://${apiHost}/get-company-by-linkedinurl`);
    fallbackUrl.searchParams.set("linkedin_url", linkedinUrl);
    const fallbackResponse = await fetch(fallbackUrl.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
      },
    });

    if (!fallbackResponse.ok) {
      const errText = await response.text();
      throw new Error(`RapidAPI error: ${response.status} - ${errText}`);
    }

    return (await fallbackResponse.json()) as Record<string, unknown>;
  }

  return (await response.json()) as Record<string, unknown>;
};

const mapLinkedInToProfileInput = (data: Record<string, unknown>): ProfileInput => {
  const payload = (data?.data as Record<string, unknown>) ?? data ?? {};
  const headline =
    compactText(payload.headline) ||
    compactText(payload.tagline) ||
    compactText(payload.title) ||
    "";
  const summary =
    compactText(payload.summary) ||
    compactText(payload.about) ||
    compactText(payload.description) ||
    "";
  const experienceItems = toArray(
    payload.experience ?? payload.positions ?? payload.experiences
  );
  const skills = toArray(payload.skills ?? payload.skill_list ?? payload.top_skills);
  const educationItems = toArray(payload.education ?? payload.education_history);
  const experienceText = experienceItems.join("\n");
  const educationText = educationItems.join("\n");

  const profileText = buildProfileText([
    headline,
    summary,
    experienceText,
    educationText,
    skills.join(", "),
  ]);

  return {
    headline,
    summary,
    experience: experienceText,
    education: educationText,
    skills,
    profileText,
  };
};

const scoreHeadline = (headline: string, keywords: string[]): ScoreResult => {
  const items: AnalysisItem[] = [];
  const suggestions: AnalysisItem[] = [];
  const length = headline.length;
  const keywordHits = countMatches(headline, keywords);

  let score = 50;
  if (length >= 20 && length <= 120) {
    score += 15;
    items.push({
      type: "positive",
      text: "Headline length is in a strong range for clarity.",
      scoreImpact: 4,
    });
  } else {
    score -= 15;
    items.push({
      type: "negative",
      text: "Headline length could be improved for readability.",
      scoreImpact: 4,
      suggestion: "Aim for 20-120 characters with a focused role and keywords.",
    });
    suggestions.push({
      type: "suggestion",
      text: "Tighten the headline to highlight your role and core strengths.",
      scoreImpact: 3,
    });
  }

  if (keywordHits >= 2) {
    score += 10;
    items.push({
      type: "positive",
      text: "Headline includes relevant keywords for search visibility.",
      scoreImpact: 3,
    });
  } else {
    score -= 8;
    items.push({
      type: "negative",
      text: "Headline has limited keyword coverage.",
      scoreImpact: 3,
      suggestion: "Add 1-2 key skills or role terms to improve search hits.",
    });
  }

  return { score: clamp(score), items, suggestions };
};

const scoreSummary = (summary: string, keywords: string[]): ScoreResult => {
  const items: AnalysisItem[] = [];
  const suggestions: AnalysisItem[] = [];
  const words = wordCount(summary);
  const keywordHits = countMatches(summary, keywords);

  let score = 50;
  if (words >= 80 && words <= 220) {
    score += 15;
    items.push({
      type: "positive",
      text: "Summary length is a good size for recruiter scanning.",
      scoreImpact: 4,
    });
  } else {
    score -= 10;
    items.push({
      type: "negative",
      text: "Summary length could be improved for impact.",
      scoreImpact: 3,
      suggestion: "Aim for 80-220 words with specific outcomes.",
    });
  }

  if (hasNumbers(summary)) {
    score += 10;
    items.push({
      type: "positive",
      text: "Summary includes quantifiable impact.",
      scoreImpact: 3,
    });
  } else {
    score -= 6;
    suggestions.push({
      type: "suggestion",
      text: "Add 1-2 metrics to show impact (results, scale, outcomes).",
      scoreImpact: 3,
    });
  }

  if (keywordHits >= 3) {
    score += 8;
  } else {
    score -= 6;
  }

  return { score: clamp(score), items, suggestions };
};

const scoreExperience = (experience: string, keywords: string[]): ScoreResult => {
  const items: AnalysisItem[] = [];
  const suggestions: AnalysisItem[] = [];
  const words = wordCount(experience);
  const keywordHits = countMatches(experience, keywords);
  const bulletCount = (experience.match(/^\s*[-*]/gm) || []).length;

  let score = 50;
  if (words >= 120 && words <= 800) {
    score += 15;
    items.push({
      type: "positive",
      text: "Experience includes meaningful detail on scope and impact.",
      scoreImpact: 4,
    });
  } else {
    score -= 10;
    items.push({
      type: "negative",
      text: "Experience section is either too brief or too long.",
      scoreImpact: 3,
      suggestion: "Use 3-6 bullets per role focused on outcomes.",
    });
  }

  if (bulletCount >= 2) {
    score += 8;
    items.push({
      type: "positive",
      text: "Bullet formatting helps readability.",
      scoreImpact: 2,
    });
  } else {
    score -= 6;
    suggestions.push({
      type: "suggestion",
      text: "Use bullet points to highlight achievements per role.",
      scoreImpact: 3,
    });
  }

  if (hasNumbers(experience)) {
    score += 10;
    items.push({
      type: "positive",
      text: "Experience includes measurable outcomes.",
      scoreImpact: 3,
    });
  } else {
    score -= 6;
    items.push({
      type: "negative",
      text: "Experience lacks quantifiable results.",
      scoreImpact: 3,
      suggestion: "Add metrics such as results, growth, or scale.",
    });
  }

  if (keywordHits >= 3) {
    score += 5;
  } else {
    score -= 5;
  }

  return { score: clamp(score), items, suggestions };
};

const scoreSkills = (skills: string[], keywords: string[]): ScoreResult => {
  const items: AnalysisItem[] = [];
  const suggestions: AnalysisItem[] = [];
  const skillCount = skills.length;
  const keywordHits = countMatches(skills.join(" "), keywords);

  let score = 50;
  if (skillCount >= 12 && skillCount <= 30) {
    score += 20;
    items.push({
      type: "positive",
      text: "Skills list is well-sized for recruiter search.",
      scoreImpact: 4,
    });
  } else {
    score -= 10;
    items.push({
      type: "negative",
      text: "Skills list could be expanded or focused.",
      scoreImpact: 3,
      suggestion: "Target 12-30 skills aligned with your goals.",
    });
  }

  if (keywordHits >= 3) {
    score += 8;
  } else {
    score -= 6;
    suggestions.push({
      type: "suggestion",
      text: "Align skills with keywords found in job descriptions.",
      scoreImpact: 3,
    });
  }

  return { score: clamp(score), items, suggestions };
};

const scoreEngagement = (profileText: string): ScoreResult => {
  const items: AnalysisItem[] = [];
  const suggestions: AnalysisItem[] = [];
  let score = 50;

  if (profileText) {
    score += 5;
    items.push({
      type: "positive",
      text: "Profile data loaded for engagement review.",
      scoreImpact: 2,
    });
  } else {
    score -= 5;
  }

  suggestions.push({
    type: "suggestion",
    text: "Stay active with monthly posts or comments to boost visibility.",
    scoreImpact: 2,
  });

  return { score: clamp(score), items, suggestions };
};

const buildBenchmarkSection = (summary: string, experience: string, skills: string[]) => {
  return {
    title: "Benchmarking",
    icon: "BM",
    color: "purple",
    items: [
      {
        type: "positive",
        text: "Headline target range: 20-120 characters.",
        scoreImpact: 2,
      },
      {
        type: wordCount(summary) >= 80 && wordCount(summary) <= 220 ? "positive" : "negative",
        text: `Summary length benchmark: 80-220 words. Current: ${wordCount(summary)}.`,
        scoreImpact: 3,
      },
      {
        type: wordCount(experience) >= 120 && wordCount(experience) <= 800 ? "positive" : "negative",
        text: `Experience benchmark: 120-800 words. Current: ${wordCount(experience)}.`,
        scoreImpact: 3,
      },
      {
        type: skills.length >= 12 && skills.length <= 30 ? "positive" : "negative",
        text: `Skills benchmark: 12-30 skills. Current: ${skills.length}.`,
        scoreImpact: 3,
      },
    ],
  } satisfies AnalysisSection;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResult | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const input = (req.body ?? {}) as ProfileInput;
  const initialHeadline = input.headline?.trim() ?? "";
  const initialSummary = input.summary?.trim() ?? "";
  const initialExperience = input.experience?.trim() ?? "";
  const initialEducation = input.education?.trim() ?? "";
  const initialProfileText = input.profileText?.trim() ?? "";
  const initialSkills = splitKeywords(input.skills);

  const hasAnyContent =
    initialHeadline ||
    initialSummary ||
    initialExperience ||
    initialEducation ||
    initialProfileText ||
    initialSkills.length > 0;

  let headline = initialHeadline;
  let summary = initialSummary;
  let experience = initialExperience;
  let education = initialEducation;
  let profileText = initialProfileText;
  let skills = initialSkills;
  let fetchedFromLinkedIn = false;

  if (!hasAnyContent && input.profileUrl) {
    try {
      const data = await fetchLinkedInProfile(input.profileUrl);
      const mapped = mapLinkedInToProfileInput(data);
      headline = mapped.headline?.trim() ?? "";
      summary = mapped.summary?.trim() ?? "";
      experience = mapped.experience?.trim() ?? "";
      education = mapped.education?.trim() ?? "";
      profileText = mapped.profileText?.trim() ?? "";
      skills = splitKeywords(mapped.skills);
      fetchedFromLinkedIn = true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch LinkedIn profile.";
      return res.status(500).json({ message });
    }
  }

  const finalHasContent =
    headline || summary || experience || education || profileText || skills.length > 0;

  if (!finalHasContent) {
    return res.status(400).json({
      message:
        "Please provide a LinkedIn URL or profile details to run analysis.",
    });
  }

  const keywords = [
    ...DEFAULT_KEYWORDS,
    ...skills,
    ...splitKeywords(input.targetKeywords),
  ].filter(Boolean);

  const headlineResult = scoreHeadline(headline || profileText, keywords);
  const summaryResult = scoreSummary(summary || profileText, keywords);
  const experienceResult = scoreExperience(experience || profileText, keywords);
  const skillsResult = scoreSkills(skills, keywords);
  const engagementResult = scoreEngagement(profileText);

  const suggestions = [
    ...headlineResult.suggestions,
    ...summaryResult.suggestions,
    ...experienceResult.suggestions,
    ...skillsResult.suggestions,
    ...engagementResult.suggestions,
  ];

  const sections: AnalysisSection[] = [
    { title: "Headline", icon: "HL", color: "blue", items: headlineResult.items },
    { title: "Summary / About", icon: "SUM", color: "yellow", items: summaryResult.items },
    { title: "Experience", icon: "EXP", color: "blue", items: experienceResult.items },
    { title: "Skills", icon: "SK", color: "green", items: skillsResult.items },
    { title: "Activity & Engagement", icon: "ENG", color: "purple", items: engagementResult.items },
    buildBenchmarkSection(summary, experience, skills),
    {
      title: "Final Suggestions",
      icon: "TIP",
      color: "pink",
      items: suggestions.length
        ? suggestions
        : [
            {
              type: "suggestion",
              text: "Great job! Keep refining your profile with recent achievements.",
              scoreImpact: 2,
            },
          ],
    },
  ];

  return res.status(200).json({
    profileUrl: input.profileUrl?.trim() || "https://www.linkedin.com/",
    sections,
    profileData: {
      profileUrl: input.profileUrl?.trim(),
      headline,
      summary,
      experience,
      education,
      profileText,
      skills,
    },
  });
}
