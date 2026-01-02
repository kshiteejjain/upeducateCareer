import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { getSession } from "@/utils/authSession";
import styles from "./Sidebar.module.css";

const menuItems = [
  { name: "Dashboard", path: "/Dashboard" },
  { name: 'Projects', path: "/Projects" },
  { name: "View Jobs", path: "/ViewJobs" },
  { name: "Interview Preparation", path: "/InterviewQuestions" },
  { name: "Professional Resume", path: "/ResumeBuilder" },
  { name: "AI Mock Interview", path: "/comingsoon" },
  { name: "Discussions", path: "/Discussions" },
  { name: "Mentorship", path: "/Mentorship" },
  { name: "Bulk Upload", path: "/Upload" },
];

export default function Sidebar() {
  const router = useRouter();
  const currentPath = router.pathname;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setUserRole(session?.role ?? null);
  }, []);

  const visibleItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.name !== "Upload" || (userRole ?? "").toLowerCase() === "faculty"
      ),
    [userRole]
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image src="/logo.webp" alt="Logo" width={128} height={30} priority />
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
              <Link href={item.path}>{item.name}</Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
