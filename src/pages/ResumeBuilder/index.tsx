import { useMemo, useState, useRef } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./ResumeBuilder.module.css";

type Experience = {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
};

type Education = {
  school: string;
  degree: string;
  dates: string;
};

type ProjectItem = {
  name: string;
  dates: string;
  summary: string;
  tech: string;
};

type ResumeTemplate = {
  id: string;
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  photo?: string;
  summary: string;
  skills: string[];
  languages: string[];
  experiences: Experience[];
  education: Education[];
  projects: ProjectItem[];
};

const templates: ResumeTemplate[] = [
  {
    id: "modern",
    name: "Andree Rocher",
    title: "Data Scientist",
    location: "Philadelphia, PA",
    email: "andree@example.com",
    phone: "705.555.0121",
    summary:
      "Analytical data scientist seeking to drive insight and decision-making for customer-facing products. Comfortable with end-to-end pipelines from data prep through modeling and storytelling.",
    skills: ["Python", "Machine Learning", "SQL", "A/B Testing", "Storytelling", "Dashboards"],
    languages: ["English (Fluent)"],
    experiences: [
      {
        role: "Data Scientist",
        company: "FluoreGen",
        dates: "2021 - 2024",
        bullets: [
          "Increased retention by 20% via tailored churn models.",
          "Optimized recharge pricing and recommendations.",
        ],
      },
      {
        role: "Junior Data Scientist",
        company: "Panthera Labs",
        dates: "2019 - 2021",
        bullets: [
          "Cleaned and preprocessed sales data.",
          "Built models for decision support and demand forecasting.",
        ],
      },
    ],
    education: [
      {
        school: "Jasper University",
        degree: "MS Data Science",
        dates: "2021",
      },
      {
        school: "Bellows College",
        degree: "BS Mathematics",
        dates: "2019",
      },
    ],
    projects: [
      {
        name: "Customer Churn Predictor",
        dates: "2023",
        summary: "Built a churn prediction model using transactional and support ticket data to prioritize outreach.",
        tech: "Python, scikit-learn, SQL",
      },
      {
        name: "Product Analytics Dashboard",
        dates: "2022",
        summary: "Shipped a self-serve dashboard for product metrics with cohort analysis and retention views.",
        tech: "Tableau, SQL, Python",
      },
    ],
  },
  {
    id: "navy",
    name: "Richard Sanchez",
    title: "Marketing Manager",
    location: "123 Anywhere St, Any City",
    email: "hello@reallygreatsite.com",
    phone: "+123-456-7890",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    summary:
      "Experienced marketing manager skilled in brand strategy, multi-channel campaigns, and team leadership. Adept at driving growth through creative storytelling and datxinformed decisions.",
    skills: [
      "Project Management",
      "Public Relations",
      "Teamwork",
      "Time Management",
      "Leadership",
      "Effective Communication",
      "Critical Thinking",
    ],
    languages: ["English (Fluent)", "French (Fluent)", "German (Basics)", "Spanish (Intermediate)"],
    experiences: [
      {
        role: "Marketing Manager & Specialist",
        company: "Borcelle Studio",
        dates: "2030 - Present",
        bullets: [
          "Developed and executed comprehensive marketing strategies with a 20% lift in brand visibility.",
          "Managed multi-channel campaigns across digital, social, and PR.",
          "Mentored a high-performing team improving acquisition and retention.",
        ],
      },
      {
        role: "Marketing Manager & Specialist",
        company: "Fauget Studio",
        dates: "2025 - 2029",
        bullets: [
          "Conducted market research to identify trends and optimize positioning.",
          "Collaborated with internal and external stakeholders to deliver campaigns on schedule.",
        ],
      },
      {
        role: "Marketing Manager & Specialist",
        company: "Studio Showde",
        dates: "2024 - 2025",
        bullets: [
          "Maintained strong partner and vendor relationships to support marketing initiatives.",
        ],
      },
    ],
    education: [
      {
        school: "Wardiere University",
        degree: "Master of Business Management",
        dates: "2029 - 2030",
      },
      {
        school: "Wardiere University",
        degree: "Bachelor of Business",
        dates: "2025 - 2029",
      },
    ],
    projects: [
      {
        name: "Brand Relaunch Campaign",
        dates: "2029",
        summary: "Led a cross-channel brand relaunch increasing qualified leads by 18% over two quarters.",
        tech: "HubSpot, Google Analytics, Meta Ads",
      },
      {
        name: "Content Operations Revamp",
        dates: "2028",
        summary: "Redesigned content workflows and editorial calendar, reducing production cycle time by 25%.",
        tech: "Asana, Notion, Canva",
      },
    ],
  },
];

const emptyState = (template: ResumeTemplate): ResumeTemplate => ({
  ...template,
  summary: template.summary || "Add your professional summary here.",
});

export default function ResumeBuilder() {
  const [selectedId, setSelectedId] = useState<string>(templates[0].id);
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? templates[0],
    [selectedId]
  );
  const [form, setForm] = useState<ResumeTemplate>(() => emptyState(templates[0]));
  const [skillInput, setSkillInput] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const loadTemplate = (id: string) => {
    const tpl = templates.find((t) => t.id === id) ?? templates[0];
    setSelectedId(id);
    setForm(emptyState(tpl));
  };

  const updateField = (key: keyof ResumeTemplate, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateExperience = (index: number, key: keyof Experience, value: any) => {
    setForm((prev) => {
      const next = [...prev.experiences];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, experiences: next };
    });
  };

  const updateEducation = (index: number, key: keyof Education, value: any) => {
    setForm((prev) => {
      const next = [...prev.education];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, education: next };
    });
  };

  const updateProject = (index: number, key: keyof ProjectItem, value: any) => {
    setForm((prev) => {
      const next = [...prev.projects];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, projects: next };
    });
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    setForm((prev) =>
      prev.skills.includes(value) ? prev : { ...prev, skills: [...prev.skills, value] }
    );
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = 0;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      const nameSlug = (form.name || "resume").replace(/\s+/g, "-").toLowerCase();
      const roleSlug = (form.title || selectedTemplate.title || "role")
        .replace(/\s+/g, "-")
        .toLowerCase();
      pdf.save(`${nameSlug}-${roleSlug}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      window.alert("Could not generate PDF. Please try again.");
    }
  };

  return (
    <Layout>
      <>
        <div className={`${styles.header} ${styles.noPrint}`}>
          <div>
            <h2 className={styles.title}>AI Resume Builder</h2>
            <p className={styles.subtitle}>
              Pick a template and personalize it with your info, skills, and experience.
            </p>
          </div>
        </div>

        <div className={`${styles.templatePicker} ${styles.noPrint}`}>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              className={`${styles.chipButton} ${
                selectedId === tpl.id ? styles.chipButtonActive : ""
              }`}
              onClick={() => loadTemplate(tpl.id)}
            >
              {tpl.id === "modern" ? "Modern Minimal" : tpl.id === "navy" ? "Navy Profile" : "Elegant Split"}
            </button>
          ))}
        </div>

        <div className={styles.layout}>
          <div className={`${styles.card} ${styles.noPrint}`}>
            <div className={styles.formHeader}>
              <h3 className={styles.sectionTitle}>Fill your details</h3>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={`${styles.input}`}
                  value={form.name}
                  placeholder="Jane Doe"
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input
                  className={styles.input}
                  value={form.title}
                  placeholder="Product Manager"
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Location</label>
                <input
                  className={styles.input}
                  value={form.location}
                  placeholder="City, Country"
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  value={form.email}
                  placeholder="you@example.com"
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone</label>
                <input
                  className={styles.input}
                  value={form.phone}
                  placeholder="+1 234 567 8901"
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Photo URL (optional)</label>
                <input
                  className={styles.input}
                  value={form.photo || ""}
                  placeholder="https://example.com/photo.jpg"
                  onChange={(e) => updateField("photo", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Summary</label>
              <textarea
                className={styles.textarea}
                value={form.summary}
                placeholder="Summarize your experience and value in 3-5 sentences."
                onChange={(e) => updateField("summary", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Skills (tags)</label>
              <div className={styles.skillsRow}>
                <input
                  className={`${styles.input} ${styles.skillInput}`}
                  value={skillInput}
                  placeholder="e.g., React, SQL, Leadership"
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button type="button" className={styles.addButton} onClick={addSkill}>
                  Add
                </button>
              </div>
              <div className={styles.tagList}>
                {form.skills.map((skill) => (
                  <span key={skill} className={styles.tag}>
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Experiences</label>
              {form.experiences.map((exp, idx) => (
                <div key={idx} className={styles.card} style={{ padding: 12, marginBottom: 8 }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Role</label>
                      <input
                        className={styles.input}
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, "role", e.target.value)}
                        placeholder="Job Title"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company</label>
                      <input
                        className={styles.input}
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        placeholder="Company"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Dates</label>
                      <input
                        className={styles.input}
                        value={exp.dates}
                        onChange={(e) => updateExperience(idx, "dates", e.target.value)}
                        placeholder="2023 - Present"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Highlights (one per line)</label>
                    <textarea
                      className={styles.textarea}
                      value={exp.bullets.join("\n")}
                      onChange={(e) =>
                        updateExperience(idx, "bullets", e.target.value.split("\n").filter(Boolean))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Education</label>
              {form.education.map((edu, idx) => (
                <div key={idx} className={styles.card} style={{ padding: 12, marginBottom: 8 }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>School</label>
                      <input
                        className={styles.input}
                        value={edu.school}
                        onChange={(e) => updateEducation(idx, "school", e.target.value)}
                        placeholder="University Name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Degree</label>
                      <input
                        className={styles.input}
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                        placeholder="Degree / Major"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Dates</label>
                      <input
                        className={styles.input}
                        value={edu.dates}
                        onChange={(e) => updateEducation(idx, "dates", e.target.value)}
                        placeholder="2019 - 2023"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Projects</label>
              {form.projects.map((proj, idx) => (
                <div key={idx} className={styles.card} style={{ padding: 12, marginBottom: 8 }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Project Name</label>
                      <input
                        className={styles.input}
                        value={proj.name}
                        onChange={(e) => updateProject(idx, "name", e.target.value)}
                        placeholder="Project Name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Dates</label>
                      <input
                        className={styles.input}
                        value={proj.dates}
                        onChange={(e) => updateProject(idx, "dates", e.target.value)}
                        placeholder="2023 - Present"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Summary</label>
                    <textarea
                      className={styles.textarea}
                      value={proj.summary}
                      onChange={(e) => updateProject(idx, "summary", e.target.value)}
                      placeholder="Short project description and outcomes"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tech / Tools</label>
                    <input
                      className={styles.input}
                      value={proj.tech}
                      onChange={(e) => updateProject(idx, "tech", e.target.value)}
                      placeholder="React, Node.js, PostgreSQL"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.card} ${styles.previewCard} ${styles.printArea}`}>
            <div className={styles.previewHeader}>
              <h3 className={styles.sectionTitle}>Preview</h3>
              <button type="button" className={styles.downloadButton} onClick={downloadPdf}>
                Download PDF
              </button>
            </div>

            {selectedId === "navy" ? (
              <div ref={previewRef} className={styles.navyWrapper}>
                <div className={styles.navySidebar}>
                  {form.photo && (
                    <div className={styles.photoCircle}>
                      <img src={form.photo} alt="Profile" />
                    </div>
                  )}
                  <div className={styles.sidebarBlock}>
                    <h4>CONTACT</h4>
                    <ul>
                      <li>{form.phone}</li>
                      <li>{form.email}</li>
                      <li>{form.location}</li>
                    </ul>
                  </div>
                  <div className={styles.sidebarBlock}>
                    <h4>EDUCATION</h4>
                    <ul>
                      {form.education.map((edu, idx) => (
                        <li key={idx}>
                          <div className={styles.bold}>{edu.school}</div>
                          <div>{edu.degree}</div>
                          <div>{edu.dates}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.sidebarBlock}>
                    <h4>SKILLS</h4>
                    <ul>
                      {form.skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.sidebarBlock}>
                    <h4>LANGUAGES</h4>
                    <ul>
                      {form.languages.map((lang, idx) => (
                        <li key={idx}>{lang}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.navyMain}>
                  <div className={styles.navyHeaderText}>
                    <div className={styles.resumeName}>{form.name}</div>
                    <div className={styles.resumeTitle}>{form.title}</div>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.resumeSection}>
                    <h4>PROFILE</h4>
                    <div className={styles.resumeList} style={{ listStyle: "none", paddingLeft: 0 }}>
                      <div>{form.summary}</div>
                    </div>
                  </div>

                  <div className={styles.resumeSection}>
                    <h4>WORK EXPERIENCE</h4>
                    <ul className={styles.resumeList}>
                      {form.experiences.map((exp, idx) => (
                        <li key={idx}>
                            <div className={styles.resumeItemTitle}>{exp.company}</div>
                            <div className={styles.resumeTitleSmall}>{exp.role}</div>
                            <div className={styles.resumeMeta}>{exp.dates}</div>
                            <ul className={styles.resumeList}>
                              {exp.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.resumeSection}>
                    <h4>PROJECTS</h4>
                    <ul className={styles.resumeList}>
                      {form.projects.map((proj, idx) => (
                        <li key={idx}>
                          <div className={styles.resumeItemTitle}>{proj.name}</div>
                          <div className={styles.resumeMeta}>{proj.dates}</div>
                          <div>{proj.summary}</div>
                          <div className={styles.resumeMeta}>{proj.tech}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ) : (
              <div ref={previewRef} className={styles.preview}>
                <div className={styles.resumeHeader}>
                  <div className={styles.resumeName}>{form.name}</div>
                  <div className={styles.resumeTitle}>
                    {form.title} - {form.location}
                  </div>
                  <div className={styles.resumeTitle}>
                    {form.email} - {form.phone}
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.resumeSection}>
                  <h4>PROFILE SUMMARY</h4>
                  <div className={styles.resumeList} style={{ listStyle: "none", paddingLeft: 0 }}>
                    <div>{form.summary}</div>
                  </div>
                </div>

                <div className={styles.resumeTwoColumn}>
                  <div>
                    <div className={styles.resumeSection}>
                      <h4>EXPERIENCE</h4>
                      <ul className={styles.resumeList}>
                        {form.experiences.map((exp, idx) => (
                          <li key={idx}>
                            <div className={styles.resumeItemTitle}>
                              {exp.role} - {exp.company}
                            </div>
                            <div>{exp.dates}</div>
                            <ul className={styles.resumeList}>
                              {exp.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.resumeSection}>
                      <h4>EDUCATION</h4>
                      <ul className={styles.resumeList}>
                        {form.education.map((edu, idx) => (
                          <li key={idx}>
                            <div className={styles.resumeItemTitle}>{edu.school}</div>
                            <div>{edu.degree}</div>
                            <div>{edu.dates}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.resumeSection}>
                      <h4>PROJECTS</h4>
                      <ul className={styles.resumeList}>
                        {form.projects.map((proj, idx) => (
                          <li key={idx}>
                            <div className={styles.resumeItemTitle}>{proj.name}</div>
                            <div className={styles.resumeMeta}>{proj.dates}</div>
                            <div>{proj.summary}</div>
                            <div className={styles.resumeMeta}>{proj.tech}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <div className={styles.resumeSection}>
                      <h4>SKILLS & ABILITIES</h4>
                      <ul className={styles.resumeList}>
                        {form.skills.map((skill, idx) => (
                          <li key={idx}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.resumeSection}>
                      <h4>LANGUAGES</h4>
                      <ul className={styles.resumeList}>
                        {form.languages.map((lang, idx) => (
                          <li key={idx}>{lang}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    </Layout>
  );
}




