import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
import { getDb } from "@/utils/firebase";

type Member = {
  id: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
  courseName?: string;
  courseDuration?: string;
  courseStartDate?: string;
  createdAt?: string;
  subject?: string;
  userId?: string;
};

const normalizeDate = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
};

const toTimestamp = (value: string | undefined): number => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ members: Member[] } | { message: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const db = getDb();
    const usersRef = collection(db, "upEducatePlusUsers");
    const snapshot = await getDocs(usersRef);

    const members: Member[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const createdAt =
        normalizeDate(data.createdAt) ||
        normalizeDate(data.courseStartDate) ||
        normalizeDate(data.createdAt?.seconds ? data.createdAt : undefined);

      return {
        id: docSnap.id,
        name: data.name ?? "Member",
        email: data.email ?? docSnap.id,
        role: data.role ?? "NA",
        mobileNumber: data.mobileNumber ?? "",
        courseName: data.courseName ?? "",
        courseDuration: data.courseDuration ?? "",
        courseStartDate: normalizeDate(data.courseStartDate),
        createdAt,
        subject: data.subject ?? "",
        userId: data.userId ?? docSnap.id,
      };
    });

    const sorted = members.sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
    );

    return res.status(200).json({ members: sorted.slice(0, 50) });
  } catch (error) {
    console.error("Failed to fetch active members", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch active members";
    return res.status(500).json({ message });
  }
}
