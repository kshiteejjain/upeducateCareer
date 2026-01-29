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

const mapRemotive = (data: Record<string, unknown>): JobItem[] => {
  const jobs = (data?.jobs as JobItem[]) || [];
  return jobs.map((job: Record<string, unknown>, idx: number) => ({
    id: `remotive-${(job.id as string) ?? idx}`,
    title: (job.title as string) ?? "Untitled",
    company: (job.company_name as string) ?? "Unknown",
    location: (job.candidate_required_location as string) ?? "Remote",
    postedAt: (job.publication_date as string) ?? "",
    platform: "Remotive",
    status: ((job.job_status as string) ?? "").toLowerCase().includes("closed") ? "Closed" : "Open",
    applyUrl: (job.url as string) ?? "#",
  }));
};

const mapRemoteOK = (data: Record<string, unknown>[]): JobItem[] => {
  const jobs = Array.isArray(data) ? data.slice(1) : []; // first item is metadata
  return jobs.map((job: Record<string, unknown>, idx: number) => ({
    id: `remoteok-${(job.id as string) ?? idx}`,
    title: (job.position as string) ?? (job.title as string) ?? "Untitled",
    company: (job.company as string) ?? "Unknown",
    location: (job.location as string) ?? "Remote",
    postedAt: (job.date as string) ?? (job.created_at as string) ?? "",
    platform: "RemoteOK",
    status: (job.closed as boolean) ? "Closed" : "Open",
    applyUrl:
      typeof job.url === "string"
        ? job.url
        : typeof job.apply_url === "string"
        ? job.apply_url
        : "#",
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

    const [remotiveResult, remoteOkResult] = await Promise.allSettled([
      fetchJson<Record<string, unknown>>(remotiveUrl.toString()),
      fetchJson<Record<string, unknown>[]>(remoteOkUrl.toString(), {
        "User-Agent": "RedNWhiteJobs/1.0",
      }),
    ] as const);

    const remotive =
      remotiveResult.status === "fulfilled"
        ? mapRemotive(remotiveResult.value)
        : [];
    const remoteOk =
      remoteOkResult.status === "fulfilled"
        ? mapRemoteOK(remoteOkResult.value)
        : [];

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
