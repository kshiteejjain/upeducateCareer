import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import ChartCard from "@/components/ChartCard/ChartCard";
import Table from "@/components/Table/Table";
import { type Project, normalizeProject } from "@/utils/projectData";
import { getSession } from "@/utils/authSession";
import styles from "./Dashboard.module.css";
import { useLoader } from "@/components/Loader/LoaderProvider";
import Loader from "@/components/Loader/Loader";

type StatusKey = "completed" | "inprogress" | "backlog";
type Member = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  mobileNumber?: string;
  courseName?: string;
  courseDuration?: string;
  courseStartDate?: string;
  createdAt?: string;
  subject?: string;
  status?: string;
  userId?: string;
};

const statusToKey = (status?: string): StatusKey => {
  const value = status?.toLowerCase() ?? "";
  if (value.includes("complete")) return "completed";
  if (value.includes("active") || value.includes("progress")) return "inprogress";
  return "backlog";
};

export default function Dashboard() {
  const headers = ["Project", "Category", "Status", "Progress"];
  const memberHeaders = [
    "Name",
    "Email",
    "Role",
    "Mobile Number",
    "Course Name",
    "Course Duration",
    "Course Start Date",
    "Created At",
    "Subject",
    "User ID",
  ];

  const [projects, setProjects] = useState<Project[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { withLoader } = useLoader();

  useEffect(() => {
    const session = getSession();
    setUserRole(session?.role ?? null);

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
      }
    };

    const fetchMembers = async (role?: string) => {
      if ((role ?? "").toLowerCase() !== "faculty") {
        return;
      }
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/activeMembers`);
        if (!response.ok) throw new Error("Failed to load members");
        const result = (await response.json()) as { members?: Member[] };
        setActiveMembers(result.members ?? []);
      } catch (error) {
        console.error("Dashboard active members fetch failed", error);
      }
    };

    const roleValue = session?.role ?? "";
    void withLoader(fetchProjects, "Loading projects overview...");
    void withLoader(fetchUsers, "Fetching member counts...");
    void withLoader(() => fetchMembers(roleValue), "Retrieving active members...");
  }, [withLoader]);

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
      inprogress: 0,
      backlog: 0,
    };
    projects.forEach((p) => {
      counts[statusToKey(p.status)] += 1;
    });

    return {
      labels: ["Completed", "In Progress", "Backlog"],
      datasets: [
        {
          data: [counts.completed, counts.inprogress, counts.backlog],
          backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
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
        const statusClass = statusText.toLowerCase().includes("complete")
          ? styles.completed
          : statusText.toLowerCase().includes("active")
          ? styles.active
          : styles.pending;
        return {
          Project: project.name ?? "Untitled",
          Category: (
            <span className={badgeClass(project.category)}>
              {project.category || "Uncategorized"}
            </span>
          ),
          Status: (
            <span className={`${styles.status} ${statusClass}`}>
              {statusText}
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

  const activeMemberRows = useMemo(() => {
    return activeMembers.map((member) => {
      return {
        Name: member.name ?? "Member",
        Email: member.email ?? "-",
        Role: member.role ?? "-",
        "Mobile Number": member.mobileNumber ?? "-",
        "Course Name": member.courseName ?? "-",
        "Course Duration": member.courseDuration ?? "-",
        "Course Start Date": member.courseStartDate ?? "-",
        "Created At": member.createdAt ?? "-",
        Subject: member.subject ?? "-",
        "User ID": member.userId ?? member.id,
        statusText: member.status ?? "Active",
      };
    });
  }, [activeMembers]);

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <span className={styles.cardGlow} aria-hidden="true" />
            <h3>Total Projects</h3>
            <h2>{projects.length}</h2>
            <p className={styles.greenText}>Projects in the workspace</p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardGlow} aria-hidden="true" />
            <h3>Completed Projects</h3>
            <h2>{completedProjects}</h2>
            <p className={styles.greenText}>Completed by students</p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardGlow} aria-hidden="true" />
            <h3>Active Members</h3>
            <h2>{userCount}</h2>
            <p className={styles.greenText}>Total registered users</p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardGlow} aria-hidden="true" />
            <h3>Listed Jobs</h3>
            <h2>95</h2>
            <p className={styles.redText}>All remote jobs</p>
          </div>
        </div>

        <div className={styles.chartSection}>
          <ChartCard title="Projects by Category" type="bar" data={barData} />
          <ChartCard title="Project Status Distribution" type="pie" data={pieData} />
        </div>

        <div className={styles.tableStack}>
          <div className={styles.tableSection}>
            <h2>Recent Projects</h2>
            <Table headers={headers} data={recentRows} />
          </div>

          {userRole?.toLowerCase() === "faculty" && (
            <div className={styles.tableSection}>
              <h2>Active Members</h2>
              {activeMemberRows.length === 0 ? (
                <p className={styles.loadingText}>No active members found.</p>
              ) : (
                <Table
                  headers={memberHeaders}
                  data={activeMemberRows}
                  enableStatusFilter={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
