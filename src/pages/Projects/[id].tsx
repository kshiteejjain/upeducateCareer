import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./ProjectDetails.module.css";
import headerStyles from "./AddProject.module.css";
import { Project, normalizeProject } from "@/utils/projectData";
import { getSession, type AuthUser } from "@/utils/authSession";
import { ParticipantsStack } from "@/components/ParticipantsStack/ParticipantsStack";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { toast } from "react-toastify";

const resolveProjectId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function ProjectDetails() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchProject = async () => {
      try {
        const projectId = resolveProjectId(router.query.id);
        if (!projectId) {
          setProject(null);
          setIsLoading(false);
          return;
        }
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(
          `${apiBaseUrl}/api/projects?id=${encodeURIComponent(projectId)}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setProject(null);
            setIsLoading(false);
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
        setIsLoading(false);
      }
    };

    void fetchProject();
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    setSessionUser(getSession());
  }, []);

  const handleParticipate = async () => {
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

    try {
      setIsJoining(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      const response = await fetch(`${apiBaseUrl}/api/projects`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, participant: participantName }),
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
      toast.success("You're now participating in this project.");
    } catch (error) {
      console.error("Failed to join project", error);
      toast.error("Could not join the project. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const statusClass =
    project && project.status
      ? styles[`status${project.status.replace(" ", "")}`]
      : "";

  const goToProjects = () => void router.push("/Projects");
  const goAddProject = () => void router.push("/Projects");
  const goAiGenerate = () => void router.push("/Projects");

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
            <button
              type="button"
              className={headerStyles.primaryAction}
              onClick={goAddProject}
            >
              Add Project
            </button>
            <button
              type="button"
              className={headerStyles.secondaryAction}
              onClick={goAiGenerate}
            >
              AI Generate Project
            </button>
            <button
              type="button"
              className={headerStyles.secondaryAction}
              onClick={goToProjects}
            >
              Back
            </button>
          </div>
        </section>

        {isLoading ? (
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
                    onClick={handleParticipate}
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join the team"}
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
                  <div>
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
                  </div>
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
                    <strong>{project.startDate}</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Deadline</span>
                    <strong>{project.deadline}</strong>
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

              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.detailTitle}>Team</h3>
                </div>
                <div className={styles.avatarStackWide}>
                  {project.participants.length > 0 ? (
                    <ParticipantsStack
                      participants={project.participants}
                      maxVisible={3}
                      size="md"
                      showNames
                    />
                  ) : (
                    <span className={styles.chipMuted}>
                      No participants added
                    </span>
                  )}
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={handleParticipate}
                  disabled={isJoining}
                >
                  {isJoining ? "Adding..." : "Join the team"}
                </button>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.detailTitle}>Tech Stack</h3>
                </div>
                <div className={styles.chipGroup}>
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
    </Layout>
  );
}
