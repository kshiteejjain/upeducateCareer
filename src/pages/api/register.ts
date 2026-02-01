import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/utils/firebase";

type RegisterRequestBody = {
  role?: "teacher" | "student";
  name?: string;
  email?: string;
  password?: string;
  mobileNumber?: string;
  subject?: string;
  board?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    role,
    name,
    email,
    password,
    mobileNumber = "",
    subject = "",
    board = "",
  } = req.body as RegisterRequestBody;

  if (!email || !password || !name || !role) {
    return res
      .status(400)
      .json({ message: "role, name, email, and password are required." });
  }

  try {
    const db = getDb();
    const userRef = doc(db, "upEducatePlusUsers", email);
    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
      return res.status(409).json({ message: "Email already exists." });
    }

    await setDoc(userRef, {
      userId: randomUUID(),
      role,
      name,
      email,
      password,
      mobileNumber: mobileNumber,
      subject: subject.trim(),
      board: board.trim(),
      createdAt: serverTimestamp(),
      registeredAt: serverTimestamp(),
    });

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to register user.";
    console.error("Error registering user", error);
    return res.status(500).json({ message });
  }
}
