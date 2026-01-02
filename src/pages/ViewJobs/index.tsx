import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout/Layout";
import Table from "@/components/Table/Table";
import styles from "./ViewJobs.module.css";
import headerStyles from "../Projects/AddProject.module.css";
import { useLoader } from "@/components/Loader/LoaderProvider";

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAt: string;
  platform: string;
  status: string;
  applyUrl: string;
};

export default function ViewJobs() {
  const headers = ["Job Title", "Company", "Location", "Platform", "Posted", "Status", "Action"];
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { withLoader } = useLoader();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/jobs`);
        if (!response.ok) throw new Error(`Failed to load jobs (${response.status})`);
        const result = (await response.json()) as { jobs?: JobRow[]; message?: string };
        if (!result.jobs) throw new Error(result.message || "No jobs returned");
        setJobs(result.jobs);
      } catch (err) {
        console.error("Jobs fetch failed", err);
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      }
    };

    void withLoader(fetchJobs, "Scanning the latest roles for you...");
  }, [withLoader]);

  const tableRows = useMemo(
    () =>
      jobs.map((job) => ({
        "Job Title": job.title,
        Company: job.company,
        Location: job.location,
        Platform: job.platform,
        Posted: job.postedAt || "-",
        Status: job.status || "Open",
        statusText: job.status || "Open",
        Action: (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-link"
          >
            Apply
          </a>
        ),
      })),
    [jobs]
  );

  return (
    <Layout>
      <section className={headerStyles.header}>
        <div>
          <h2 className={headerStyles.title}>Explore roles and applications</h2>
          <p className={headerStyles.subtitle}>
            Review openings and keep tabs on every application you are tracking.
          </p>
        </div>
      </section>

      {error ? (
        <p className={styles.jobInfo}>Error: {error}</p>
      ) : jobs.length === 0 ? (
        <p className={styles.jobInfo}>No jobs available right now.</p>
      ) : (
        <>
          <Table headers={headers} data={tableRows} enableStatusFilter={false} />
          <div className={styles.jobInfo}>
            <p>Total {jobs.length} Jobs, Showing 10 jobs per page</p>
          </div>
        </>
      )}
    </Layout>
  );
}
