import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
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

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function ViewJobs() {
  const headers = ["Job Title", "Company", "Location", "Platform", "Posted", "Status", "Action"];
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("India");
  const [experience, setExperience] = useState("Any");
  const { withLoader } = useLoader();

  const fetchJobs = useCallback(async (query: string, loaderText: string) => {
    await withLoader(async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const url = new URL(`${apiBaseUrl}/api/jobs`, window.location.origin);
        url.searchParams.set("search", query);
        url.searchParams.set("pages", "5");
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Failed to load jobs (${response.status})`);
        const result = (await response.json()) as { jobs?: JobRow[]; message?: string };
        if (!result.jobs) throw new Error(result.message || "No jobs returned");
        setJobs(result.jobs);
      } catch (err) {
        console.error("Jobs fetch failed", err);
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      }
    }, loaderText);
  }, [withLoader]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const experienceText = experience !== "Any" ? `${experience} experience` : "";
    const query = [role, "jobs", country ? `in ${country}` : "", experienceText]
      .filter(Boolean)
      .join(" ");
    await fetchJobs(query, "Searching jobs...");
  };

  const tableRows = useMemo(
    () =>
      jobs.map((job) => ({
        "Job Title": job.title,
        Company: job.company,
        Location: job.location,
        Platform: job.platform,
        Posted: formatDate(job.postedAt),
        Status: job.status || "Open",
        statusText: job.status || "Open",
        Action: (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.btnLink}
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

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchField}>
          <label htmlFor="jobRole">Job Role</label>
          <input
            id="jobRole"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Teacher, Math, Biology..."
            className={styles.input}
          />
        </div>
        <div className={styles.searchField}>
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={styles.input}
          >
            {[
              "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
              "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
              "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
              "Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
              "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
              "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
              "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
              "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
              "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
              "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
              "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
              "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
              "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
              "Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
              "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
              "Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan",
              "Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
              "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
              "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam",
              "Yemen","Zambia","Zimbabwe"
            ].map((countryName) => (
              <option key={countryName} value={countryName}>
                {countryName}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.searchField}>
          <label htmlFor="experience">Experience</label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className={styles.input}
          >
            {["Any", "Fresher", "1-3 years", "3-5 years", "5+ years", "10+ years"].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {error ? (
        <p className={styles.jobInfo}>Error: {error}</p>
      ) : jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <Image
            src="/no-data.svg"
            alt="No jobs found"
            width={240}
            height={200}
            className={styles.emptyStateImage}
            sizes="20vw"
          />
          <h3>No jobs available</h3>
          <p>Try changing the job role, country, or experience to find matches.</p>
        </div>
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
