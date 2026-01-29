import type { Schema } from "./schemaUtils";

export type RegisterFormRecord = {
  role: "teacher" | "student";
  name: string;
  email: string;
  password: string;
  courseName: string;
  courseDuration: string;
  courseStartDate: string;
  mobileNumber: string;
};

export const registerFormSchema: Schema<RegisterFormRecord> = {
  name: "registerForm",
  storageKey: "rnw-register-form",
  columns: {
    role: "teacher",
    name: "",
    email: "",
    password: "",
    courseName: "",
    courseDuration: "",
    courseStartDate: "",
    mobileNumber: "",
  },
};

export type RegisterRecord = {
  role: "teacher";
  name: string;
  email: string;
  password: string;
  courseName: string;
  courseDuration: string;
  courseStartDate: string;
  mobileNumber: string;
  createdAt: string;
};

export const registerSchema: Schema<RegisterRecord> = {
  name: "register",
  storageKey: "rnw-register",
  columns: {
    role: "student",
    name: "",
    email: "",
    password: "",
    courseName: "",
    courseDuration: "",
    courseStartDate: "",
    mobileNumber: "",
    createdAt: "",
  },
};

export type ProjectFormRecord = {
  name: string;
  durationDays: string;
  category: string;
  techStack: string[];
  description: string;
  startDate: string;
  budget: string;
};

export const projectFormSchema: Schema<ProjectFormRecord> = {
  name: "projectForm",
  storageKey: "rnw-project-form",
  columns: {
    name: "",
    durationDays: "",
    category: "",
    techStack: [],
    description: "",
    startDate: "",
    budget: "",
  },
};

export type InterviewAttemptRecord = {
  username: string;
  category: string;
  answers: Record<number, string>;
  score: number | null;
  total: number;
  percent: number;
  createdAt: string;
};

export const interviewAttemptSchema: Schema<InterviewAttemptRecord> = {
  name: "interviewAttempt",
  storageKey: "rnw-interview-attempts",
  columns: {
    username: "",
    category: "fullstack",
    answers: {},
    score: null,
    total: 0,
    percent: 0,
    createdAt: "",
  },
};
