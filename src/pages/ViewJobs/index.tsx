import Layout from "@/components/Layout/Layout";
import Table from "@/components/Table/Table";
import styles from "./ViewJobs.module.css";
import headerStyles from "../Projects/AddProject.module.css";

export default function ViewJobs() {
  const headers = ["Job Title", "Date Posted", "Platform", "Status", "Action"];

  const jobs = Array.from({ length: 50 }, (_, i) => {
    const platforms = ["LinkedIn", "Indeed", "Naukri", "Glassdoor", "Internshala"];
    const statuses = ["Active", "Backlog", "Completed"];
    return {
      "Job Title": [
        "Frontend Developer",
        "AI Engineer",
        "React Developer",
        "UI/UX Designer",
        "Cyber Security Analyst",
      ][i % 5] + ` #${i + 1}`,
      "Date Posted": `Oct ${21 - (i % 10)}`,
      Platform: platforms[i % platforms.length],
      Status: statuses[i % statuses.length],
      Action: <button className="btn-primary">View</button>,
    };
  });

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

      <Table headers={headers} data={jobs} />
      <div className={styles.jobInfo}>
        <p>dY'Ź Total {jobs.length} Jobs, Showing 10 jobs per page</p>
      </div>
    </Layout>
  );
}
