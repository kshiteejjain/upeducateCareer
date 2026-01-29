import { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout/Layout";
import styles from "./LinkedinAnalysis.module.css";
import { useLoader } from "@/components/Loader/LoaderProvider";

type AnalysisSection = {
  title: string;
  icon: string;
  color: string;
  items: AnalysisItem[];
};

type AnalysisItem = {
  type: "positive" | "negative" | "suggestion";
  text: string;
  scoreImpact?: number;
  suggestion?: string;
};

type AnalysisResult = {
  profileScore: number;
  profileUrl: string;
  sections: AnalysisSection[];
};

const mockAnalysisData: AnalysisResult = {
  profileScore: 56.75,
  profileUrl: "https://www.linkedin.com/in/kshiteejjain/",
  sections: [
    {
      title: "Headline",
      icon: "🎯",
      color: "blue",
      items: [
        {
          type: "positive",
          text: "The headline lists multiple skills such as AI, Front End, React, and Next.js, which is good for keyword optimization.",
          scoreImpact: 3,
        },
        {
          type: "negative",
          text: "The headline is cluttered and includes too many keywords, reducing clarity and focus.",
          scoreImpact: 4,
          suggestion: "Replace with a concise, targeted headline like: 'AI & Front End Engineer | React, Next.js | Micro Frontend | Generative AI Specialist'",
        },
      ],
    },
    {
      title: "Summary / About",
      icon: "📝",
      color: "yellow",
      items: [
        {
          type: "positive",
          text: "The summary highlights extensive front-end and AI expertise, including certifications and diverse domains.",
          scoreImpact: 3,
        },
        {
          type: "negative",
          text: "The summary is lengthy and lacks clear focus on key achievements or impact metrics.",
          scoreImpact: 4,
          suggestion: "Replace with a sharper, results-oriented summary emphasizing key achievements, technologies used, and domain expertise.",
        },
      ],
    },
    {
      title: "Experience",
      icon: "💼",
      color: "blue",
      items: [
        {
          type: "positive",
          text: "The experience entries are detailed, showcasing leadership and technical roles across notable companies.",
          scoreImpact: 4,
        },
        {
          type: "negative",
          text: "The descriptions are dense and could benefit from clearer formatting and focus on quantifiable achievements.",
          scoreImpact: 4,
          suggestion: "Replace with concise, achievement-focused bullet points with metrics like project scales, technologies used, and outcomes.",
        },
      ],
    },
    {
      title: "Skills",
      icon: "⚡",
      color: "green",
      items: [
        {
          type: "positive",
          text: "The skills list is rich and comprehensive, including React, Generative AI, LangChain, and more important keywords.",
          scoreImpact: 2,
        },
        {
          type: "negative",
          text: "Lacks endorsements or prioritization to highlight key skills.",
          scoreImpact: 3,
          suggestion: "Arrange skills by relevance to your target roles, and seek endorsements for top skills. Add skill levels if possible.",
        },
      ],
    },
    {
      title: "Activity & Engagement",
      icon: "📢",
      color: "purple",
      items: [
        {
          type: "negative",
          text: "Profile shows no recent activity or posts, missing opportunity to demonstrate thought leadership.",
          scoreImpact: 4,
          suggestion: "Start sharing insights on AI, React projects, or industry trends to improve visibility. Even 1-2 posts/month can boost engagement.",
        },
      ],
    },
    {
      title: "Final Suggestions",
      icon: "🚀",
      color: "pink",
      items: [
        {
          type: "suggestion",
          text: "Refine your headline to be concise and focused; include primary keywords aligned with your target roles.",
          scoreImpact: 4,
        },
        {
          type: "suggestion",
          text: "Transform your summary into a clear, achievement-oriented narrative highlighting your impact and domain expertise.",
          scoreImpact: 4,
        },
        {
          type: "suggestion",
          text: "Enhance your experience section with quantified accomplishments and clearer formatting to showcase leadership and technical success.",
          scoreImpact: 4,
        },
        {
          type: "suggestion",
          text: "Prioritize and endorse key skills, and reorder skills for relevance to improve searchability and recruiter relevance.",
          scoreImpact: 3,
        },
        {
          type: "suggestion",
          text: "Increase activity by posting and engaging in industry discussions to build thought leadership and visibility.",
          scoreImpact: 4,
        },
      ],
    },
  ],
};

export default function LinkedinAnalysis() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { withLoader } = useLoader();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!linkedinUrl.trim()) {
      setError("Please enter a valid LinkedIn profile URL");
      return;
    }

    setIsLoading(true);

    // Simulate API call - Replace with actual API endpoint
    const analyzeProfile = async () => {
      try {
        // For now, using mock data. Replace with actual API call:
        // const response = await fetch('/api/analyzeLinkedin', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ profileUrl: linkedinUrl })
        // });
        // const data = await response.json();
        // setAnalysisResult(data);

        // Using mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAnalysisResult({
          ...mockAnalysisData,
          profileUrl: linkedinUrl,
        });
      } catch (err) {
        setError("Failed to analyze profile. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    await withLoader(analyzeProfile, "Analyzing your LinkedIn profile...");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent Profile!";
    if (score >= 60) return "Good Profile";
    return "Needs Improvement";
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1>🔗 LinkedIn Profile Analyzer</h1>
          <p>Get AI-powered insights to optimize your LinkedIn profile and boost recruiter visibility</p>
        </div>

        {/* Input Section */}
        <div className={styles.inputSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="linkedinUrl" className={styles.label}>
                Enter Your LinkedIn Profile URL
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourprofile/"
                className={styles.input}
                disabled={isLoading}
              />
              <p className={styles.hint}>Example: https://www.linkedin.com/in/williamgates/</p>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Analyze Profile"}
            </button>
          </form>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className={styles.resultsSection}>
            {/* Score Card */}
            <div className={styles.scoreCard}>
              <div className={styles.scoreDisplay}>
                <div
                  className={styles.scoreCircle}
                  style={{ borderColor: getScoreColor(analysisResult.profileScore) }}
                >
                  <span
                    className={styles.scoreValue}
                    style={{ color: getScoreColor(analysisResult.profileScore) }}
                  >
                    {analysisResult.profileScore}
                  </span>
                  <span className={styles.scoreMax}>/100</span>
                </div>
                <div className={styles.scoreInfo}>
                  <h2 style={{ color: getScoreColor(analysisResult.profileScore) }}>
                    {getScoreMessage(analysisResult.profileScore)}
                  </h2>
                  <p className={styles.scoreDescription}>
                    Your profile demonstrates strong technical expertise, but focused improvements can significantly enhance your impact and searchability.
                  </p>
                  <Link href="/ResumeBuilder" className={styles.improvementBtn}>
                    View Recommendations →
                  </Link>
                </div>
              </div>
            </div>

            {/* Analysis Sections */}
            <div className={styles.analysisGrid}>
              {analysisResult.sections.map((section, sectionIdx) => (
                <div
                  key={sectionIdx}
                  className={`${styles.section} ${styles[`section-${section.color}`]}`}
                >
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}>{section.icon}</span>
                    <h3>{section.title}</h3>
                  </div>

                  <div className={styles.sectionContent}>
                    {section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={styles.item}>
                        {item.type === "positive" && (
                          <>
                            <div className={styles.itemHeader}>
                              <span className={styles.checkmark}>✓</span>
                              <span className={styles.scoreTag}>+{item.scoreImpact}</span>
                            </div>
                            <p className={styles.itemText}>{item.text}</p>
                          </>
                        )}
                        {item.type === "negative" && (
                          <>
                            <div className={styles.itemHeader}>
                              <span className={styles.cross}>✗</span>
                              <span className={styles.scoreTag}>+{item.scoreImpact}</span>
                            </div>
                            <p className={styles.itemText}>{item.text}</p>
                            {item.suggestion && (
                              <div className={styles.suggestion}>
                                <strong>Replace with a concise, targeted</strong>
                                <p>{item.suggestion}</p>
                              </div>
                            )}
                          </>
                        )}
                        {item.type === "suggestion" && (
                          <>
                            <div className={styles.itemHeader}>
                              <span className={styles.lightBulb}>💡</span>
                              <span className={styles.scoreTag}>+{item.scoreImpact}</span>
                            </div>
                            <p className={styles.itemText}>{item.text}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Section */}
            <div className={styles.actionSection}>
              <h2>Next Steps</h2>
              <div className={styles.actionGrid}>
                <div className={styles.actionCard}>
                  <span className={styles.actionIcon}>📄</span>
                  <h4>Update Your Profile</h4>
                  <p>Implement the suggestions above to boost your profile score</p>
                  <a href={analysisResult.profileUrl} target="_blank" rel="noopener noreferrer" className={styles.actionLink}>
                    Edit on LinkedIn →
                  </a>
                </div>
                <div className={styles.actionCard}>
                  <span className={styles.actionIcon}>💼</span>
                  <h4>Build Your Resume</h4>
                  <p>Create a matching resume that aligns with your LinkedIn profile</p>
                  <Link href="/ResumeBuilder" className={styles.actionLink}>
                    Create Resume →
                  </Link>
                </div>
                <div className={styles.actionCard}>
                  <span className={styles.actionIcon}>🤖</span>
                  <h4>Interview Practice</h4>
                  <p>Prepare for interviews with AI-powered interview questions</p>
                  <Link href="/InterviewQuestions" className={styles.actionLink}>
                    Start Practice →
                  </Link>
                </div>
              </div>
            </div>

            {/* Analyze Another */}
            <div className={styles.analyzeAnother}>
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setLinkedinUrl("");
                }}
                className={styles.analyzeAnotherBtn}
              >
                ← Analyze Another Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
