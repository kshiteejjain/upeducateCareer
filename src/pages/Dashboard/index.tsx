import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import ChartCard from "@/components/ChartCard/ChartCard";
import Table from "@/components/Table/Table";
import { type Project, normalizeProject } from "@/utils/projectData";
import styles from "./Dashboard.module.css";

type StatusKey = "completed" | "active" | "Backlog" | "unknown";

const statusToKey = (status?: string): StatusKey => {
  const value = status?.toLowerCase() ?? "";
  if (value.includes("complete")) return "completed";
  if (value.includes("active") || value.includes("progress")) return "active";
  if (value.includes("bending") || value.includes("backlog")) return "Backlog";
  return "unknown";
};

export default function Dashboard() {
  const headers = ["Project", "Category", "Status", "Progress"];

  const [projects, setProjects] = useState<Project[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/projects`);
        if (!response.ok) throw new Error("Failed to load projects");
        const raw = (await response.json()) as Project[];
        const normalized = raw.map((p) => normalizeProject(p, p.id));
        setProjects(normalized);
      } catch (error) {
        console.error("Dashboard projects fetch failed", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/usersStats`);
        if (!response.ok) throw new Error("Failed to load users");
        const result = (await response.json()) as { count?: number };
        setUserCount(result.count ?? 0);
      } catch (error) {
        console.error("Dashboard users fetch failed", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    void fetchProjects();
    void fetchUsers();
  }, []);

  const completedProjects = useMemo(
    () => projects.filter((p) => statusToKey(p.status) === "completed").length,
    [projects]
  );

  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const key = p.category || "Uncategorized";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = labels.map((l) => counts[l]);
    return {
      labels,
      datasets: [
        {
          label: "Projects",
          data,
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#14b8a6",
            "#a855f7",
          ],
          borderRadius: 8,
        },
      ],
    };
  }, [projects]);

  const pieData = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      completed: 0,
      active: 0,
      backlog: 0,
      unknown: 0,
    };
    projects.forEach((p) => {
      counts[statusToKey(p.status)] += 1;
    });

    return {
      labels: ["Completed", "Active", "Backlog", "Unknown"],
      datasets: [
        {
          data: [
            counts.completed,
            counts.active,
            counts.backlog,
            counts.unknown,
          ],
          backgroundColor: ["#22c55e", "#facc15", "#ef4444", "#94a3b8"],
          borderWidth: 2,
        },
      ],
    };
  }, [projects]);

  const recentRows = useMemo(() => {
    const badgeClass = (category?: string) => {
      const value = category?.toLowerCase() ?? "";
      if (value.includes("fintech")) return `${styles.badge} ${styles.fintech}`;
      if (value.includes("health")) return `${styles.badge} ${styles.healthtech}`;
      if (value.includes("ed")) return `${styles.badge} ${styles.edtech}`;
      if (value.includes("ai")) return `${styles.badge} ${styles.ai}`;
      if (value.includes("social")) return `${styles.badge} ${styles.social}`;
      return `${styles.badge} ${styles.defaultBadge}`;
    };

    return projects
      .slice(0, 20)
      .map((project) => {
        const progressValue = project.progress ?? 0;
        const statusText = project.status ?? "backlog";
        return {
          Project: project.name ?? "Untitled",
          Category: (
            <span className={badgeClass(project.category)}>
              {project.category || "Uncategorized"}
            </span>
          ),
          statusText,
          Progress: (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div
                  style={{
                    width: `${Math.min(Math.max(progressValue, 0), 100)}%`,
                    background:
                      progressValue >= 100
                        ? "#22c55e"
                        : progressValue > 60
                        ? "#10b981"
                        : progressValue > 30
                        ? "#f97316"
                        : undefined,
                  }}
                />
              </div>
              <span>{progressValue}%</span>
            </div>
          ),
        };
      });
  }, [projects]);

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Total Projects</h3>
            <h2>{loadingProjects ? "…" : projects.length}</h2>
            <p className={styles.greenText}>Projects in the workspace</p>
          </div>
          <div className={styles.card}>
            <h3>Completed Projects</h3>
            <h2>{loadingProjects ? "…" : completedProjects}</h2>
            <p className={styles.greenText}>Marked as completed</p>
          </div>
          <div className={styles.card}>
            <h3>Active Members</h3>
            <h2>{loadingUsers ? "…" : userCount}</h2>
            <p className={styles.greenText}>Total registered users</p>
          </div>
          <div className={styles.card}>
            <h3>Backlog Projects</h3>
            <h2>
              {loadingProjects
                ? "…"
                : Math.max(projects.length - completedProjects, 0)}
            </h2>
            <p className={styles.redText}>Remaining to complete</p>
          </div>
        </div>

        <div className={styles.chartSection}>
          <ChartCard title="Projects by Category" type="bar" data={barData} />
          <ChartCard title="Project Status Distribution" type="pie" data={pieData} />
        </div>

        <div className={styles.tableSection}>
          <h2>Recent Projects</h2>
          <Table headers={headers} data={recentRows} />
        </div>
      </div>
    </Layout>
  );
}
