import type { NextApiRequest, NextApiResponse } from "next";

type JobItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAt: string;
  platform: string;
  status: "Open" | "Closed";
  applyUrl: string;
};

const fetchJson = async <T>(url: string, headers?: Record<string, string>) => {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
};

const mapRemotive = (data: any): JobItem[] => {
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs.map((job: any, idx: number) => ({
    id: `remotive-${job.id ?? idx}`,
    title: job.title ?? "Untitled",
    company: job.company_name ?? "Unknown",
    location: job.candidate_required_location ?? "Remote",
    postedAt: job.publication_date ?? "",
    platform: "Remotive",
    status: (job.job_status ?? "").toLowerCase().includes("closed") ? "Closed" : "Open",
    applyUrl: job.url ?? "#",
  }));
};

const mapRemoteOK = (data: any): JobItem[] => {
  const jobs = Array.isArray(data) ? data.slice(1) : []; // first item is metadata
  return jobs.map((job: any, idx: number) => ({
    id: `remoteok-${job.id ?? idx}`,
    title: job.position ?? job.title ?? "Untitled",
    company: job.company ?? "Unknown",
    location: job.location ?? "Remote",
    postedAt: job.date ?? job.created_at ?? "",
    platform: "RemoteOK",
    status: job.closed ? "Closed" : "Open",
    applyUrl: job.url ?? job.apply_url ?? "#",
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ jobs: JobItem[] } | { message: string }>
) {
  const { search } = req.query;
  const query = typeof search === "string" ? search : "";

  try {
    const remotiveUrl = new URL("https://remotive.io/api/remote-jobs");
    if (query) remotiveUrl.searchParams.set("search", query);

    const remoteOkUrl = new URL("https://remoteok.com/api");

    const results = await Promise.allSettled([
      fetchJson(remotiveUrl.toString()),
      fetchJson(remoteOkUrl.toString(), { "User-Agent": "RedNWhiteJobs/1.0" }),
    ]);

    const remotive =
      results[0].status === "fulfilled" ? mapRemotive(results[0].value) : [];
    const remoteOk =
      results[1].status === "fulfilled" ? mapRemoteOK(results[1].value) : [];

    const combined = [...remotive, ...remoteOk].filter(
      (job) => job.applyUrl && job.applyUrl !== "#"
    );

    if (combined.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    return res.status(200).json({ jobs: combined });
  } catch (error) {
    console.error("Failed to fetch jobs", error);
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return res.status(500).json({ message });
  }
}
