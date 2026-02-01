import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./Discussions.module.css";
import { useLoader } from "@/components/Loader/LoaderProvider";

type Discussion = {
  title: string;
  source: string;
  category: string;
  summary: string;
  link: string;
};

type FetchState = {
  items: Discussion[];
  error: string | null;
};

const INDIA_TEACHING_TOPICS: Discussion[] = [
  {
    title: "NEP 2020 in practice: classroom changes that actually work",
    source: "Teacher Community",
    category: "Policy & Practice",
    summary:
      "Share how you are aligning lesson plans to competency-based learning and assessment.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Foundational Literacy & Numeracy: effective routines for Grades 1-3",
    source: "Primary Educators",
    category: "Early Years",
    summary:
      "Discuss daily FLN routines, phonics approaches, and number sense activities.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Teaching STEM in low-resource classrooms",
    source: "STEM Teachers India",
    category: "STEM",
    summary:
      "Swap ideas for hands-on experiments using local materials and minimal tech.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Differentiated instruction for mixed-ability classrooms",
    source: "Inclusive Education",
    category: "Pedagogy",
    summary:
      "Share strategies for tiered assignments, peer learning, and scaffolding.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Classroom management in large classes (50+ students)",
    source: "School Leaders",
    category: "Classroom",
    summary:
      "Discuss seating, routines, and quick assessment techniques that scale.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Integrating local language instruction alongside English",
    source: "Language Teachers",
    category: "Language",
    summary:
      "Talk about bilingual resources, translanguaging, and reading fluency.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Project-based learning aligned to Indian curriculum",
    source: "Project Learning Hub",
    category: "PBL",
    summary:
      "Share project ideas, rubrics, and ways to assess collaboration.",
    link: "https://www.education.gov.in/",
  },
  {
    title: "Assessments beyond exams: portfolios and performance tasks",
    source: "Assessment Circle",
    category: "Assessment",
    summary:
      "Explore low-stakes checks for understanding and rubric-based grading.",
    link: "https://www.education.gov.in/",
  },
];

export default function Discussions() {
  const [state, setState] = useState<FetchState>({ items: [], error: null });
  const [hasLoaded, setHasLoaded] = useState(false);
  const { withLoader } = useLoader();

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!isMounted) return;
      setState({
        items: INDIA_TEACHING_TOPICS,
        error: null,
      });
      setHasLoaded(true);
    };

    void withLoader(fetchAll, "Loading India-focused teaching discussions...");
    return () => {
      isMounted = false;
    };
  }, [withLoader]);

  const content = useMemo(() => {
    if (!hasLoaded) {
      return <p className={styles.status}>Loading discussions...</p>;
    }
    if (state.error) {
      return <p className={styles.statusError}>{state.error}</p>;
    }
    if (!state.items.length) {
      return <p className={styles.status}>No discussions found right now.</p>;
    }
    return (
      <section className={styles.grid}>
        {state.items.map((discussion) => (
          <a
            key={`${discussion.source}-${discussion.title}`}
            href={discussion.link}
            target="_blank"
            rel="noreferrer"
            className={styles.card}
          >
            <div className={styles.badgeRow}>
              <span className={styles.badge}>{discussion.category}</span>
              <span className={styles.source}>{discussion.source}</span>
            </div>
            <h3 className={styles.cardTitle}>{discussion.title}</h3>
            <p className={styles.summary}>{discussion.summary}</p>
            <div className={styles.footer}>
              <span className={styles.linkHint}>Open discussion -&gt;</span>
            </div>
          </a>
        ))}
      </section>
    );
  }, [hasLoaded, state.error, state.items]);

  return (
    <Layout>
      {content}
    </Layout>
  );
}
