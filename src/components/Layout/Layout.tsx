import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import styles from "./Layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.pathname === "/ResumeBuilder") {
      setIsCollapsed(true);
    }
  }, [router.isReady, router.pathname]);

  return (
    <div className={styles.layout}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />
      <main className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : ""}`}>
        <Navbar />
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
