import type { NextApiRequest, NextApiResponse } from "next";
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getDb } from "@/utils/firebase";
import { normalizeProject, type Project } from "@/utils/projectData";

type CreateProjectBody = {
  name?: string;
  category?: string;
  description?: string;
  startDate?: string;
  deadline?: string;
  participants?: string[];
  techStack?: string[];
  durationDays?: number;
  owner?: string;
  ownerId?: string;
  budget?: string | number;
  source?: Project["source"];
  status?: string;
};

function serializeProject(data: Partial<Project>, id: string): Project {
  const createdAt =
    typeof data.createdAt === "string"
      ? data.createdAt
      : data.createdAt && typeof (data.createdAt as any).toDate === "function"
      ? (data.createdAt as any).toDate().toISOString()
      : undefined;

  const normalizeDateField = (value: unknown) => {
    if (typeof value === "string") return value;
    if (value && typeof (value as any).toDate === "function") {
      return (value as any).toDate().toISOString().slice(0, 10);
    }
    return value ? String(value) : "";
  };

  return normalizeProject(
    {
      ...data,
      startDate: normalizeDateField(data.startDate),
      deadline: normalizeDateField(data.deadline),
      createdAt,
    },
    id
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = getDb();
  const projectsRef = collection(db, "projects");
  const projectId =
    typeof req.query.id === "string"
      ? req.query.id
      : typeof req.body?.id === "string"
      ? req.body.id
      : null;

  if (req.method === "GET") {
    try {
      if (projectId) {
        const snap = await getDoc(doc(projectsRef, projectId));
        if (!snap.exists()) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(serializeProject(snap.data(), snap.id));
      }

      const snapshot = await getDocs(projectsRef);
      const items = snapshot.docs.map((docSnap) =>
        serializeProject(docSnap.data(), docSnap.id)
      );
      return res.status(200).json(items);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch projects";
      return res.status(500).json({ message });
    }
  }

  if (req.method === "POST") {
    const {
      name,
      category,
      description,
      startDate,
      deadline,
      participants = [],
      techStack = [],
      durationDays = 0,
      owner,
      ownerId,
      budget,
      source = "custom",
      status = "",
    } = req.body as CreateProjectBody;

    if (!name || !startDate || !deadline) {
      return res
        .status(400)
        .json({ message: "name, startDate, and deadline are required." });
    }

    try {
      const parsedBudget =
        typeof budget === "string"
          ? parseFloat(budget.replace(/[^\d.-]/g, ""))
          : budget;
      const budgetValue =
        typeof parsedBudget === "number" ? parsedBudget : Number.NaN;
      const safeBudget = Number.isFinite(budgetValue) ? budgetValue : 0;

      const payload: Omit<Project, "id"> = {
        name: name.trim(),
        category: (category ?? "General").trim(),
        description:
          description?.trim() ||
          "Project scope and milestones are being defined.",
        startDate,
        deadline,
        participants,
        progress: 0,
        techStack,
      status: status?.trim() || "backlog",
        durationDays,
        owner: owner?.trim() || "Project Owner",
        ownerId: ownerId?.trim() || undefined,
        budget: safeBudget,
        source: source === "ai" ? "ai" : "custom",
        createdAt: undefined,
      };

      const docRef = await addDoc(projectsRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });

      const normalized = serializeProject(
        { ...payload, createdAt: new Date().toISOString() },
        docRef.id
      );

      return res.status(201).json(normalized);
    } catch (error) {
      console.error("Failed to create project", error);
      const message =
        error instanceof Error ? error.message : "Failed to create project";
      return res.status(500).json({ message });
    }
  }

  if (req.method === "PATCH") {
    const { participant } = req.body as { participant?: string };
    const participantName = participant?.trim();

    if (!projectId || !participantName) {
      return res
        .status(400)
        .json({ message: "id and participant name are required." });
    }

    try {
      const projectRef = doc(projectsRef, projectId);
      const snap = await getDoc(projectRef);
      if (!snap.exists()) {
        return res.status(404).json({ message: "Project not found" });
      }

      await updateDoc(projectRef, {
        participants: arrayUnion(participantName),
      });

      const updatedSnap = await getDoc(projectRef);
      return res
        .status(200)
        .json(serializeProject(updatedSnap.data(), updatedSnap.id));
    } catch (error) {
      console.error("Failed to update participants", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update participants";
      return res.status(500).json({ message });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ message: "Method Not Allowed" });
}
