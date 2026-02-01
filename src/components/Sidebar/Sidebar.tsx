import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { getSession } from "@/utils/authSession";
import styles from "./Sidebar.module.css";

const menuItems = [
  { name: "Dashboard", path: "/Dashboard", icon: "📊" },
  { name: "Job Search", path: "/ViewJobs", icon: "🗂️" },
  { name: "Resume Builder", path: "/ResumeBuilder", icon: "📄" },
  { name: "LinkedIn Profile Analysis", path: "/LinkedinAnalysis", icon: "🔗" },
  { name: "Schedule 1:1 Meet", path: "/Mentorship", icon: "📅" },
  { name: "Assessment", path: "/", icon: "📝" },
  { name: "AI Interview", path: "/InterviewQuestions", icon: "🤖" },
  { name: "Ask Anu - Your AI Coach", path: "/AskAnu", icon: "/shiksha.png" },
  { name: "Discussions", path: "/Discussions", icon: "💬" },
  { name: "Bulk Upload", path: "/Upload", icon: "📤" }
];

export default function Sidebar() {
  const router = useRouter();
  const currentPath = router.pathname;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session?.role) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setUserRole(session.role);
    }
  }, []);

  const visibleItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.name !== "Upload" || (userRole ?? "").toLowerCase() === "teacher"
      ),
    [userRole]
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image src="/logo.svg" alt="Logo" width={200} height={48} priority />
      </div>
      <ul className={styles.menuList}>
        {visibleItems.map((item) => {
          const isProjects =
            item.path === "/Projects" &&
            (currentPath === "/Projects" || currentPath.startsWith("/Projects/"));
          const isActive = currentPath === item.path || isProjects;
          return (
            <li
              key={item.name}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
            >
              <Link href={item.path}>
                {item.icon.startsWith("/") ? (
                  <Image
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                  />
                ) : (
                  item.icon
                )}{" "}
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
