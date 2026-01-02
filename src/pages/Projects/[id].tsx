import Link from "next/link";
import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./ProjectDetails.module.css";
import headerStyles from "./AddProject.module.css";
import { Project, normalizeProject } from "@/utils/projectData";
import { getSession, type AuthUser } from "@/utils/authSession";
import { ParticipantsStack } from "@/components/ParticipantsStack/ParticipantsStack";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { toast } from "react-toastify";
import { useLoader } from "@/components/Loader/LoaderProvider";

const resolveProjectId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const statusOptions = ["Backlog", "In Progress", "Completed"] as const;

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

type EditFormState = {
  name: string;
  category: string;
  description: string;
  startDate: string;
  deadline: string;
  durationDays: string;
  budget: string;
  status: string;
  progress: string;
  techStack: string[];
};

const calculateDeadline = (startDate: string, durationDays: string) => {
  const duration = Number(durationDays);
  if (!startDate || !Number.isFinite(duration) || duration <= 0) return "";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "";
  const clone = new Date(start);
  clone.setDate(clone.getDate() + duration);
  return clone.toISOString().slice(0, 10);
};

const formatDateDisplay = (value: string | undefined | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};

export default function ProjectDetails() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRole, setJoinRole] = useState("");
  const [joinContribution, setJoinContribution] = useState("");
  const [editTechInput, setEditTechInput] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const { withLoader, isLoading } = useLoader();
  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    category: "",
    description: "",
    startDate: "",
    deadline: "",
    durationDays: "",
    budget: "",
    status: "",
    progress: "0",
    techStack: [],
  });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchProject = async () => {
      try {
        const projectId = resolveProjectId(router.query.id);
        if (!projectId) {
          setProject(null);
          return;
        }
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(
          `${apiBaseUrl}/api/projects?id=${encodeURIComponent(projectId)}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setProject(null);
            return;
          }
          throw new Error(`Failed to load project (${response.status})`);
        }
        const data = (await response.json()) as Project;
        setProject(normalizeProject(data, data.id));
      } catch (error) {
        console.error("Failed to load project details", error);
        toast.error("Could not load project details.");
        setProject(null);
      } finally {
        setHasLoaded(true);
      }
    };

    void withLoader(fetchProject, "Loading project details...");
  }, [router.isReady, router.query.id, withLoader]);

  useEffect(() => {
    setSessionUser(getSession());
  }, []);

  useEffect(() => {
    if (!project) return;

    const computedDeadline = calculateDeadline(
      project.startDate ?? "",
      String(project.durationDays ?? "")
    );

    setEditForm({
      name: project.name ?? "",
      category: project.category ?? "",
      description: project.description ?? "",
      startDate: project.startDate ?? "",
      deadline: computedDeadline || project.deadline || "",
      durationDays:
        project.durationDays || project.durationDays === 0
          ? String(project.durationDays)
          : "",
      budget:
        typeof project.budget === "number"
          ? String(project.budget)
          : project.budget ?? "",
      status: project.status ?? "",
      progress:
        typeof project.progress === "number"
          ? String(project.progress)
          : project.progress ?? "0",
      techStack: project.techStack ?? [],
    });
    setEditTechInput("");
  }, [project]);

  const isFaculty = sessionUser?.role === "faculty";

  const handleEditChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "startDate" || name === "durationDays") {
      setEditForm((prev) => {
        const next = { ...prev, [name]: value };
        const computedDeadline = calculateDeadline(
          next.startDate,
          next.durationDays
        );
        return { ...next, deadline: computedDeadline };
      });
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const addTechToEdit = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setEditForm((prev) => {
      if (prev.techStack.includes(normalized)) return prev;
      return { ...prev, techStack: [...prev.techStack, normalized] };
    });
    setEditTechInput("");
  };

  const removeTechFromEdit = (tech: string) => {
    setEditForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((item) => item !== tech),
    }));
  };

  const startJoinFlow = () => {
    if (!project) return;
    const latestSession = getSession();
    setSessionUser(latestSession);

    const participantName =
      latestSession?.name?.trim() || latestSession?.email?.trim();

    if (!participantName) {
      toast.error("Please login to participate.");
      return;
    }

    if (project.participants.includes(participantName)) {
      toast.info("You are already participating in this project.");
      return;
    }

    setJoinRole("");
    setJoinContribution("");
    setIsJoinModalOpen(true);
  };

  const handleJoinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project) return;
    const latestSession = getSession();
    setSessionUser(latestSession);

    const participantName =
      latestSession?.name?.trim() || latestSession?.email?.trim();

    if (!participantName) {
      toast.error("Please login to participate.");
      return;
    }

    if (project.participants.includes(participantName)) {
      toast.info("You are already participating in this project.");
      setIsJoinModalOpen(false);
      return;
    }

    if (!joinRole.trim() || !joinContribution.trim()) {
      toast.error("Please add your role and contribution to join.");
      return;
    }

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/projects`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: project.id,
            participant: participantName,
            participantRole: joinRole.trim(),
            participantContribution: joinContribution.trim(),
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            (errorBody as { message?: string }).message ??
            "Failed to join project"
          );
        }

        const updated = (await response.json()) as Project;
        setProject(normalizeProject(updated, updated.id));
      }, "Joining the project team...");
      toast.success("You're now participating in this project.");
      setIsJoinModalOpen(false);
    } catch (error) {
      console.error("Failed to join project", error);
      toast.error("Could not join the project. Please try again.");
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project) return;
    if (!isFaculty) {
      toast.error("Only faculty members can edit projects.");
      return;
    }

    const duration = Number(editForm.durationDays);
    const progressValue = Number(editForm.progress);
    const statusValueRaw =
      editForm.status.trim() || project.status || "Backlog";
    const statusValue = (() => {
      const formatted = statusValueRaw
        .split(" ")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ")
        .trim();
      return statusOptions.includes(formatted as (typeof statusOptions)[number])
        ? formatted
        : "Backlog";
    })();
    const deadlineValue =
      calculateDeadline(editForm.startDate, editForm.durationDays) ||
      editForm.deadline;

    if (
      !editForm.name.trim() ||
      !editForm.category.trim() ||
      !editForm.description.trim() ||
      !editForm.startDate ||
      !deadlineValue ||
      !editForm.budget.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("Duration must be a positive number.");
      return;
    }

    if (
      !Number.isFinite(progressValue) ||
      progressValue < 0 ||
      progressValue > 100
    ) {
      toast.error("Progress must be between 0 and 100.");
      return;
    }

    if (!editForm.techStack.length) {
      toast.error("Add at least one tech in the stack.");
      return;
    }

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/projects`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: project.id,
            name: editForm.name.trim(),
            category: editForm.category.trim(),
            description: editForm.description.trim(),
            startDate: editForm.startDate,
            deadline: deadlineValue,
            durationDays: duration,
            budget: editForm.budget.trim(),
            status: statusValue,
            progress: progressValue,
            techStack: editForm.techStack,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            (errorBody as { message?: string }).message ??
            "Failed to update project"
          );
        }

        const updated = (await response.json()) as Project;
        setProject(normalizeProject(updated, updated.id));
      }, "Saving project updates...");
      setIsEditOpen(false);
      toast.success("Project updated.");
    } catch (error) {
      console.error("Failed to update project", error);
      toast.error("Could not update the project.");
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!isFaculty) {
      toast.error("Only faculty members can delete projects.");
      return;
    }
    const confirmed = window.confirm(
      "Delete this project permanently? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(
          `${apiBaseUrl}/api/projects?id=${encodeURIComponent(project.id)}`,
          { method: "DELETE" }
        );
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            (errorBody as { message?: string }).message ??
            "Failed to delete project"
          );
        }
      }, "Deleting project...");
      toast.success("Project deleted.");
      void router.push("/Projects");
    } catch (error) {
      console.error("Failed to delete project", error);
      toast.error("Could not delete the project.");
    }
  };

  const handleRemoveParticipant = async (member: string) => {
    if (!project) return;
    if (!isFaculty) {
      toast.error("Only faculty members can manage the team.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member} from this project? This will revoke their access until they rejoin.`
    );
    if (!confirmed) return;

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/projects`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: project.id,
            participant: member,
            action: "remove",
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            (errorBody as { message?: string }).message ??
            "Failed to remove member"
          );
        }

        const updated = (await response.json()) as Project;
        setProject(normalizeProject(updated, updated.id));
      }, "Updating team roster...");
      toast.success("Team member removed.");
    } catch (error) {
      console.error("Failed to remove team member", error);
      toast.error("Could not remove that member.");
    }
  };

  const statusToken =
    project && project.status
      ? project.status
          .split(" ")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join("")
      : "";
  const statusClass = statusToken ? styles[`status${statusToken}`] : "";
  const startDisplay = project ? formatDateDisplay(project.startDate) : "-";
  const deadlineDisplay = project ? formatDateDisplay(project.deadline) : "-";

  const goToProjects = () => void router.push("/Projects");

  return (
    <Layout>
      <div className={styles.page}>
        <section className={headerStyles.header}>
          <div>
            <h2 className={headerStyles.title}>
              {project?.name ?? "Project Details"}
            </h2>
            <p className={headerStyles.subtitle}>
              Track the build, manage ownership, and collaborate with your team.
            </p>
          </div>
          <div className={headerStyles.actions}>
            {isFaculty && project ? (
              <>
                <button
                  type="button"
                  className={headerStyles.primaryAction}
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit Project
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDeleteProject}
                  disabled={isLoading}
                >
                  {isLoading ? "Working..." : "Delete Project"}
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={headerStyles.secondaryAction}
              onClick={goToProjects}
            >
              Back
            </button>
          </div>
        </section>

        {!hasLoaded ? (
          <section className={styles.emptyState}>
            <h3>Loading project details</h3>
            <p>Gathering the latest snapshot for this project.</p>
          </section>
        ) : project ? (
          <>
            <section className={styles.heroArea}>
              <div className={styles.heroCard}>
                <div className={styles.tagRow}>
                  <span className={`${styles.tag} ${styles.tagPrimary}`}>
                    {project.category || "General"}
                  </span>
                  <span className={`${styles.tag} ${styles.tagNeutral}`}>
                    {project.source === "ai" ? "AI Project" : "Custom Project"}
                  </span>
                </div>

                <div className={styles.heroHeader}>
                  <div>
                    <h1 className={styles.heroTitle}>{project.name}</h1>
                    <p className={styles.heroSubtitle}>
                      {project.description}
                    </p>
                  </div>
                  <button
                    className={styles.secondaryButton}
                    onClick={startJoinFlow}
                    disabled={isLoading}
                  >
                    Join the team
                  </button>
                </div>

                <div className={styles.heroMeta}>
                  <div className={styles.metric}>
                    <span>Duration</span>
                    <strong>{project.durationDays} days</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Budget</span>
                    <strong>${project.budget}k</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Source</span>
                    <strong>{project.source === "ai" ? "AI" : "Custom"}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.statusCard}>
                <div className={styles.statusHeader}>
                  <>
                    <p className={styles.statusLabel}>Status</p>
                    <div className={styles.statusBadgeRow}>
                      {project.status ? (
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {project.status}
                        </span>
                      ) : (
                        <span className={styles.statusBadgeMuted}>
                          No status yet
                        </span>
                      )}
                    </div>
                  </>
                </div>

                <div className={styles.progressWrap}>
                  <div className={styles.progressHeader}>
                    <span>Progress</span>
                    <strong>{project.progress}%</strong>
                  </div>
                  <ProgressBar value={project.progress} />
                </div>

                <div className={styles.metricGrid}>
                  <div className={styles.metric}>
                    <span>Start</span>
                    <strong>{startDisplay}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Deadline</span>
                    <strong>{deadlineDisplay}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Duration</span>
                    <strong>{project.durationDays} days</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Budget</span>
                    <strong>${project.budget}k</strong>
                  </div>
                </div>
              </div>
            </section>


            <section className={styles.grid}>
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.detailTitle}>Project Overview</h3>
                </div>
                <div className={styles.detailRow}>
                  <span>Project ID</span>
                  <strong>{project.id}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Category</span>
                  <strong>{project.category}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Status</span>
                  <strong>{project.status || "Backlog"}</strong>
                </div>
                <div className={styles.detailRow}>

                  <span>Tech Stack</span>
                  
                    {project.techStack.length > 0 ? (
                      project.techStack.map((tech) => (
                        <span key={tech} className={styles.chip}>
                          {tech}
                        </span>
                      ))
                      
                  ) : (
                  <span className={styles.chipMuted}>Add tech stack</span>
                    )}

                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.detailTitle}>Ownership</h3>
                </div>
                <div className={styles.detailRow}>
                  <span>Project Owner</span>
                  <strong>{project.owner}</strong>
                </div>
                <p className={styles.note}>
                  Keep stakeholders aligned with weekly delivery check-ins.
                </p>
              </div>

              <div className={`${styles.detailCard} ${styles.teamCard}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.detailTitle}>Team & Contributors</h3>
                  <button
                    className={styles.secondaryButton}
                    onClick={startJoinFlow}
                    disabled={isLoading}
                  >
                    Join the team
                  </button>
                </div>
                <div className={styles.teamLayout}>
                  <div className={styles.teamPanel}>
                    <p className={styles.panelLabel}>Team Members</p>
                    <div className={styles.avatarStackWide}>
                      {project.participants.length > 0 ? (
                        <ParticipantsStack
                          participants={project.participants}
                          maxVisible={4}
                          size="md"
                          showNames
                        />
                      ) : (
                        <span className={styles.chipMuted}>
                          No participants added
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.contributorsPanel}>
                    <div className={styles.panelHeader}>
                      <p className={styles.panelLabel}>Roles & Contributions</p>
                    </div>
                    <div className={styles.noteList}>
                      {project.participants.length === 0 ? (
                        <span className={styles.chipMuted}>
                          No notes yet. Join to add yours.
                        </span>
                      ) : (
                        project.participants.map((member) => {
                          const note = project.participantNotes?.[member]
                          return (
                            <div key={member} className={styles.noteRow}>
                              <div>
                                <p className={styles.noteAuthor}>{member}</p>
                                <p className={styles.noteRole}>
                                  {note?.role || "Team member"}
                                </p>
                              </div>
                              <div className={styles.noteActions}>
                                <p className={styles.noteText}>
                                  {note?.contribution ||
                                    "No contribution note added yet."}
                                </p>
                                {isFaculty ? (
                                  <button
                                    type="button"
                                    className={styles.teamRemove}
                                    onClick={() => void handleRemoveParticipant(member)}
                                    disabled={isLoading}
                                  >
                                    Remove
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </>
        ) : (
          <section className={styles.emptyState}>
            <h3>Project not found</h3>
            <p>We could not find a project with that id.</p>
            <Link href="/Projects">Back to Projects</Link>
          </section>
        )}
      </div>

      {isEditOpen && project ? (
        <div
          className={headerStyles.modalOverlay}
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className={headerStyles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={headerStyles.modalHeader}>
              <div>
                <p className={headerStyles.modalKicker}>Edit Project</p>
                <h3 className={headerStyles.modalTitle}>{project.name}</h3>
              </div>
              <button
                type="button"
                className={headerStyles.closeButton}
                onClick={() => setIsEditOpen(false)}
                aria-label="Close edit modal"
              >
                &times;
              </button>
            </div>

            <form className={headerStyles.form} onSubmit={handleEditSubmit}>
              <div className={styles.editGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Project Name</span>
                  <input
                    name="name"
                    className={styles.input}
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Category</span>
                  <select
                    name="category"
                    className={styles.select}
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Status</span>
                  <select
                    name="status"
                    className={styles.select}
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="">Select status</option>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Progress (%)</span>
                  <input
                    type="number"
                    name="progress"
                    className={styles.input}
                    value={editForm.progress}
                    onChange={handleEditChange}
                    min={0}
                    max={100}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Duration (days)</span>
                  <input
                    type="number"
                    name="durationDays"
                    className={styles.input}
                    value={editForm.durationDays}
                    onChange={handleEditChange}
                    min={1}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Start Date</span>
                  <input
                    type="date"
                    name="startDate"
                    className={styles.input}
                    value={editForm.startDate}
                    onChange={handleEditChange}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Deadline</span>
                  <input
                    type="date"
                    name="deadline"
                    className={styles.input}
                    value={editForm.deadline}
                    onChange={handleEditChange}
                    disabled
                    required
                  />
                  <p className={styles.helperNote}>
                    Auto-calculated from start date and duration.
                  </p>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Budget</span>
                  <input
                    name="budget"
                    className={styles.input}
                    value={editForm.budget}
                    onChange={handleEditChange}
                    placeholder="e.g. 18 for $18k"
                    required
                  />
                </label>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Project Description</span>
                <textarea
                  name="description"
                  className={styles.textarea}
                  rows={6}
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Tech Stack</span>
                <div className={styles.techInputRow}>
                  <input
                    name="techStack"
                    className={styles.input}
                    placeholder="Add a technology"
                    value={editTechInput}
                    onChange={(event) => setEditTechInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTechToEdit(editTechInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => addTechToEdit(editTechInput)}
                  >
                    Add
                  </button>
                </div>
                <div className={styles.techPills}>
                  {editForm.techStack.length > 0 ? (
                    editForm.techStack.map((tech) => (
                      <span key={tech} className={styles.techPill}>
                        {tech}
                        <button
                          type="button"
                          className={styles.pillRemove}
                          onClick={() => removeTechFromEdit(tech)}
                          aria-label={`Remove ${tech}`}
                        >
                          x
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className={styles.chipMuted}>No tech added yet</span>
                  )}
                </div>
              </div>

              <div className={headerStyles.formFooter}>
                <button
                  type="button"
                  className={headerStyles.ghostButton}
                  onClick={() => setIsEditOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={headerStyles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isJoinModalOpen && project ? (
        <div
          className={headerStyles.modalOverlay}
          onClick={() => setIsJoinModalOpen(false)}
        >
          <div
            className={headerStyles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={headerStyles.modalHeader}>
              <div>
                <p className={headerStyles.modalKicker}>Join Project</p>
                <h3 className={headerStyles.modalTitle}>{project.name}</h3>
              </div>
              <button
                type="button"
                className={headerStyles.closeButton}
                onClick={() => setIsJoinModalOpen(false)}
                aria-label="Close join modal"
              >
                &times;
              </button>
            </div>

            <form className={headerStyles.form} onSubmit={handleJoinSubmit}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Your role in this project</span>
                <input
                  className={styles.input}
                  value={joinRole}
                  onChange={(event) => setJoinRole(event.target.value)}
                  placeholder="e.g. Frontend developer"
                  required
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Planned contribution</span>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={joinContribution}
                  onChange={(event) => setJoinContribution(event.target.value)}
                  placeholder="Describe how you plan to contribute"
                  required
                />
              </div>

              <div className={styles.noticeBox}>
                Note: Once you join the team, you cannot leave without approval from the project owner and faculty.
              </div>

              <div className={headerStyles.formFooter}>
                <button
                  type="button"
                  className={headerStyles.ghostButton}
                  onClick={() => setIsJoinModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={headerStyles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Working..." : "Confirm & Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}


