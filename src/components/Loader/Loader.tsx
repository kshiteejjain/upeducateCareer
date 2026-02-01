import { useEffect, useState } from "react";
import styles from "./Loader.module.css";

type LoaderProps = {
  active: boolean;
  message?: string | null;
};

const textArray = [
  "Syncing with the AI workspace...",
  "Drafting your project insights...",
  "Crunching data for your dashboard...",
  "Fetching the latest jobs and updates...",
  "Generating content tailored for you...",
  "Almost there—stay with us...",
];

export default function Loader({ active, message }: LoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || message) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % textArray.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [active, message]);

  if (!active) return null;

  return (
    <div className={styles.backdrop} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <p className={styles.text}>{message || textArray[index]}</p>
    </div>
  );
}
