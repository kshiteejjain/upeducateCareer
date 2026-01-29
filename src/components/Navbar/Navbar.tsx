import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { clearSession } from "@/utils/authSession";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname, push } = useRouter();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const segment = pathname.split("/").filter(Boolean).pop() || "";
    if (pathname === "/Projects/[id]") {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setPageTitle("Project Details");
      return;
    }
    const title =
      segment
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()) || "Dashboard";
    setPageTitle(title);
  }, [pathname]);

  const goToProfile = () => {
    setOpen(false);
    push("/Profile");
  };

  return (
    <header className={styles.navbar}>
      <h4 className={styles.pageTitle}>{pageTitle}</h4>

      <div className={styles.actions}>
        <span title="Notifications" className={styles.icon}>
          &#128276;
        </span>

        {/* User Menu */}
        <div className={styles.userMenu}>
          <span
            className={styles.userIcon}
            onClick={() => setOpen(!open)}
            title="User Menu"
          >
            &#128100;
          </span>
          {open && (
            <ul className={styles.dropdown}>
              <li className={styles.menuRow} onClick={goToProfile}>
                <span className={styles.menuIcon} aria-hidden="true">
                  👤
                </span>
                <span>Profile</span>
              </li>
              <li
                className={styles.menuRow}
                onClick={() => {
                  clearSession();
                  setOpen(false);
                  push("/login");
                }}
              >
                <span className={styles.menuIcon} aria-hidden="true">
                  🔓  
                </span>
                <span>Logout</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
