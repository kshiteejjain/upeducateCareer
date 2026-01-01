export type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  startDate: string;
  deadline: string;
  participants: string[];
  participantNotes?: Record<
    string,
    { role?: string; contribution?: string }
  >;
  progress: number;
  techStack: string[];
  status: string;
  durationDays: number;
  owner: string;
  ownerId?: string;
  budget: string | number;
  source: "ai" | "custom";
  createdAt?: string;
};

export const aiProjectTemplates: Omit<Project, "id" | "source">[] = [
  {
    name: "Urban Health Pulse",
    category: "Healthcare",
    description:
      "Neighborhood health insights with outreach campaigns and alerts.",
    startDate: "2025-10-10",
    deadline: "2026-01-05",
    participants: [],
    progress: 0,
    techStack: ["Next.js", "GraphQL", "Prisma"],
    status: "",
    durationDays: 84,
    owner: "Health Innovation",
    budget: "$22k",
  },
  {
    name: "Talent Orbit",
    category: "HR Tech",
    description:
      "AI assisted candidate shortlisting with interview readiness tracking.",
    startDate: "2025-09-28",
    deadline: "2025-12-18",
    participants: [],
    progress: 0,
    techStack: ["React", "Python", "PostgreSQL"],
    status: "",
    durationDays: 77,
    owner: "People Ops",
    budget: "$17k",
  },
  {
    name: "MarketLift CRM",
    category: "Sales",
    description: "Pipeline visibility with automated nudges for sales reps.",
    startDate: "2025-10-05",
    deadline: "2026-01-15",
    participants: [],
    progress: 0,
    techStack: ["Angular", "Node.js", "MySQL"],
    status: "",
    durationDays: 98,
    owner: "Growth Systems",
    budget: "$26k",
  },
];

export const normalizeProject = (
  data: Partial<Project>,
  id: string
): Project => ({
  id,
  name: data.name ?? "Untitled Project",
  category: data.category ?? "General",
  description:
    data.description ?? "Project scope and milestones are being defined.",
  startDate: data.startDate ?? "",
  deadline: data.deadline ?? "",
  participants: data.participants ?? [],
  participantNotes: data.participantNotes ?? {},
  progress: data.progress ?? 0,
  techStack: data.techStack ?? [],
  status: data.status ?? "",
  durationDays: data.durationDays ?? 0,
  owner: data.owner ?? "Project Owner",
  ownerId: data.ownerId,
  budget: data.budget ?? "TBD",
  source: data.source ?? "custom",
  createdAt: data.createdAt,
});
