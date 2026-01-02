import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./AddProject.module.css";
import { projectFormSchema } from "@/utils/formSchemas";
import { createRecordFromSchema } from "@/utils/schemaUtils";
import { Project, aiProjectTemplates, normalizeProject } from "@/utils/projectData";
import { getSession } from "@/utils/authSession";
import { toast } from "react-toastify";
import { ParticipantsStack } from "@/components/ParticipantsStack/ParticipantsStack";
import { Tooltip } from "react-tooltip";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { useLoader } from "@/components/Loader/LoaderProvider";

type FormState = typeof projectFormSchema.columns;

const techStackOptions = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Django",
  "Flask",
  "Angular",
  "Vue",
  "Go",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "Firebase",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "GraphQL",
  "Prisma",
  "Tailwind",
  "CSS",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
];

const categoryOptions = [
  "Fintech",
  "Education",
  "Banking",
  "Social",
  "Logistics",
  "Healthcare",
  "AI/ML",
  "HR Tech",
  "Sales",
  "Security",
  "Ecommerce",
  "Gaming",
  "Productivity",
  "Others",
];

const categoryPalette = [
  "#7b4bff",
  "#ff6fba",
  "#blue",
  "#1c8c4a",
  "#f18f01",
  "#fdba13",
  "#e35f5f",
  "#3ab7bf",
];

const getCategoryColor = (name: string) => {
  if (!name) return categoryPalette[0];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return categoryPalette[hash % categoryPalette.length];
};

const normalizeDate = (value: string, fallback: Date) =>
  value ? new Date(value) : fallback;

const formatDate = (value: Date) => value.toISOString().slice(0, 10);

const formatDateDisplay = (value: string | undefined | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};

const computeDeadlineFromDuration = (
  startDate: string,
  durationDays: number
) => {
  const start = normalizeDate(startDate, new Date());
  start.setDate(start.getDate() + durationDays);
  return formatDate(start);
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiPrefill, setIsAiPrefill] = useState(false);
  const [formState, setFormState] = useState<FormState>(() =>
    createRecordFromSchema(projectFormSchema)
  );
  const [techInput, setTechInput] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const { withLoader, isLoading } = useLoader();
  const todayString = useMemo(() => formatDate(new Date()), []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/projects`);
        if (!response.ok) {
          throw new Error(`Failed to load projects (${response.status})`);
        }
        const items = (await response.json()) as Project[];
        setProjects(items.map((p) => normalizeProject(p, p.id)));
      } catch (error) {
        console.error("Failed to load projects", error);
        toast.error("Could not load projects right now.");
      } finally {
        setHasLoaded(true);
      }
    };

    void withLoader(fetchProjects, "Loading your workspace projects...");
  }, [withLoader]);

  const aiQueue = useMemo(
    () => aiProjectTemplates.map((template) => ({ ...template })),
    []
  );

  const computedDeadline = useMemo(() => {
    if (!formState.startDate) return "";
    const durationDays =
      Number(formState.durationDays) > 0 ? Number(formState.durationDays) : 0;
    if (!durationDays) return "";
    const start = normalizeDate(formState.startDate, new Date());
    start.setDate(start.getDate() + durationDays);
    return formatDate(start);
  }, [formState.startDate, formState.durationDays]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "techStack") return;
    if (name === "startDate") {
      const clamped =
        value && value < todayString ? todayString : value;
      setFormState((prev) => ({ ...prev, startDate: clamped }));
      return;
    }
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const addTech = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setFormState((prev) => {
      if (prev.techStack.includes(normalized)) return prev;
      return { ...prev, techStack: [...prev.techStack, normalized] };
    });
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setFormState((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((item) => item !== tech),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const today = new Date();
    const start = normalizeDate(formState.startDate, today);
    const duration = Number(formState.durationDays);

    const name = formState.name.trim();
    const category = formState.category.trim();
    const description = formState.description.trim();
    const budget = formState.budget.trim();
    const techStack = formState.techStack;

    if (!name || !category || !description || !budget || !formState.startDate || !duration || duration <= 0) {
      toast.error("All fields are required, including a positive duration.");
      return;
    }

    if (!techStack || techStack.length === 0) {
      toast.error("Add at least one tech in the stack.");
      return;
    }

    const deadlineDate = normalizeDate(computedDeadline, start);

    const sessionUser = getSession();
    const ownerName = sessionUser?.name || "Project Owner";

    const projectPayload = {
      name,
      category,
      description,
      startDate: formatDate(start),
      deadline: formatDate(deadlineDate),
      participants: [],
      progress: 0,
      techStack,
      status: "backlog",
      durationDays: duration,
      owner: ownerName,
      ownerId: sessionUser?.userId,
      budget,
      source: isAiPrefill ? ("ai" as const) : ("custom" as const),
      createdAt: new Date().toISOString(),
    };

    const saveProject = async () => {
      try {
        await withLoader(async () => {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
          const response = await fetch(`${apiBaseUrl}/api/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectPayload),
          });
          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(
              (errorBody as { message?: string }).message ??
              "Failed to save project"
            );
          }
          const created = (await response.json()) as Project;
          setProjects((prev) => [normalizeProject(created, created.id), ...prev]);
          setIsModalOpen(false);
          setFormState(createRecordFromSchema(projectFormSchema));
          setTechInput("");
        }, "Saving your project...");
        toast.success("Project created");
      } catch (error) {
        console.error("Failed to save project", error);
        toast.error("Could not save project right now.");
      }
    };

    void saveProject();
  };

  const handleAIGenerate = async () => {
    const recentProjects = projects.slice(0, 3).map((p) => ({
      name: p.name,
      category: p.category,
      techStack: p.techStack,
      description: p.description,
    }));

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/generateProject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recentProjects }),
        });

        if (!response.ok) {
          throw new Error(
            (await response.json().catch(() => ({}))).message ??
              "Failed to generate project"
          );
        }

        const generated = (await response.json()) as {
          name?: string;
          category?: string;
          description?: string;
          durationDays?: number;
          techStack?: string[];
          budget?: string;
        };

        const durationDays = generated.durationDays || 30;
        const start = formatDate(new Date());

        setFormState((prev) => ({
          ...prev,
          name: generated.name || prev.name,
          durationDays: String(durationDays),
          category: generated.category || prev.category,
          techStack: generated.techStack ?? [],
          description:
            generated.description ||
            "Project scope and milestones are being defined.",
          startDate: start,
          budget: generated.budget || "TBD",
        }));
        setTechInput("");
        setIsAiPrefill(true);
        setIsModalOpen(true);
      }, "Assembling an AI-powered project idea...");
    } catch (error) {
      console.error("Failed to generate AI project", error);
      toast.error(
        error instanceof Error ? error.message : "Could not generate project."
      );
    }
  };

  return (
    <Layout>
      <div className={styles.page}>
        <section className={styles.header}>
          <div>
            <h2 className={styles.title}>Track every build in one place</h2>
            <p className={styles.subtitle}>
              Add projects, see quick progress, and open a detailed view anytime.
            </p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => {
                setIsAiPrefill(false);
                setFormState(createRecordFromSchema(projectFormSchema));
                setTechInput("");
                setIsModalOpen(true);
              }}
              disabled={isLoading}
            >
              Add Project
            </button>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handleAIGenerate}
              disabled={isLoading}
            >
              {isLoading ? "Working..." : "AI Generate Project"}
            </button>
          </div>
        </section>

        {projects.length === 0 ? (
          <section className={styles.cards}>
            <article className={styles.card}>
              <p>
                {hasLoaded
                  ? "No projects yet. Add your first project."
                  : "Preparing your projects..."}
              </p>
            </article>
          </section>
        ) : (
          <section className={styles.cards}>
            {projects.map((project) => (
              <article key={project.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p
                        className={styles.cardCategory}
                        style={{
                          color: getCategoryColor(project.category || "General"),
                        }}
                      >
                        {project.category || "General"}
                      </p>

                      {project.status ? (
                        <span
                          className={`${styles.statusBadge} ${styles[`status${project.status.replace(
                            " ",
                            ""
                          )}`]}`}
                        >
                          {project.status}
                        </span>
                      ) : null}

                      <h3 className={styles.cardTitle}>{project.name}</h3>
                      {project.source === "ai" && (
                        <>
                          <span
                            className={styles.aiProject}
                            data-tooltip-id={`ai-tip-${project.id}`}
                            data-tooltip-content="AI Generated"
                            aria-label="AI Generated"
                          >
                            ✨
                          </span>
                          <Tooltip
                            id={`ai-tip-${project.id}`}
                            className={styles.aiTooltip}
                          />
                        </>
                      )}
                    </div>

                  </div>

                  <p className={styles.cardDescription}>{project.description}</p>

                  <div className={styles.cardMeta}>
                    <div>
                      <span>🗓️ Start</span>
                      <strong>{formatDateDisplay(project.startDate)}</strong>
                    </div>
                    <div>
                      <span>🗓️ Deadline</span>
                      <strong>{formatDateDisplay(project.deadline)}</strong>
                    </div>
                    <div className={styles.participantsMeta}>
                      <div className={styles.participantsLabel}>
                        <span>👥 Participants</span>
                        <strong>{project.participants.length}</strong>
                      </div>
                      <ParticipantsStack
                        participants={project.participants}
                        maxVisible={3}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className={styles.progressRow}>
                    <ProgressBar value={project.progress} />
                    <span>{project.progress}%</span>
                  </div>

                  <div className={styles.chips}>
                    {project.techStack.length > 0 ? (
                      project.techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className={styles.chip}>
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className={styles.chipMuted}>Add tech stack</span>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <Link className={styles.viewButton} href={`/Projects/${project.id}`}>
                      View Project
                    </Link>
                  </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalKicker}>New Project</p>
                <h3 className={styles.modalTitle}>Create a project brief</h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter project name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (days)</label>
                  <input
                    type="number"
                    name="durationDays"
                    className="form-control"
                    placeholder="Duration in days"
                    value={formState.durationDays}
                    onChange={handleChange}
                    min={1}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className="form-control"
                    value={formState.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={formState.startDate}
                    min={todayString}
                    onChange={handleChange}
                    required
                  />
                  {computedDeadline ? (
                    <p className={styles.helperText}>
                      Deadline will be set to {computedDeadline}
                    </p>
                  ) : (
                    <p className={styles.helperText}>
                      Set start date and duration to auto-calc deadline
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Budget</label>
                  <input
                    type="text"
                    name="budget"
                    className="form-control"
                    placeholder="e.g. $18k"
                    value={formState.budget}
                    onChange={handleChange}
                    required
                  />
                  <p className={styles.helperText}>
                     Enter numbers only - $ and k are added automatically.
                    </p>
                </div>

                <div className="form-group">
                  <label>Tech Stack</label>
                  <div className={styles.techInputRow}>
                    <input
                      type="text"
                      name="techStack"
                      className="form-control"
                      placeholder="Start typing and hit add"
                      list="tech-stack-options"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTech(techInput);
                        }
                      }}
                    />
                    <datalist id="tech-stack-options">
                      {techStackOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      className={styles.secondaryAction}
                      onClick={() => addTech(techInput)}
                    >
                      Add
                    </button>
                  </div>
                  <div className={styles.techChips}>
                    {formState.techStack.length > 0 ? (
                      formState.techStack.map((tech) => (
                        <span key={tech} className={styles.chip}>
                          {tech}
                          <button
                            type="button"
                            className={styles.chipRemove}
                            onClick={() => removeTech(tech)}
                            aria-label={`Remove ${tech}`}
                          >
                            x
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className={styles.chipMuted}>
                        No tech added yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  placeholder="Describe your project idea"
                  rows={8}
                  value={formState.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}



