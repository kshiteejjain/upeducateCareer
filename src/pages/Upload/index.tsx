import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./Upload.module.css";
import { toast } from "react-toastify";
import { useLoader } from "@/components/Loader/LoaderProvider";

type UploadStatus =
  | "idle"
  | "parsing"
  | "ready"
  | "uploading"
  | "success"
  | "error";

type MappedUser = {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: "student";
  mobileNumber: string;
  courseName: string;
  courseDuration: string;
  courseStartDate: string;
  subject: string;
  createdAt: string;
};

const normalizeKey = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_]+/g, "");

const getField = (record: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (record[normalized]) return record[normalized];
  }
  return "";
};

const formatTimestampIST = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(now)
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

  const day = String(Number(parts.day ?? "0"));
  const month = parts.month ?? "";
  const year = parts.year ?? "";
  const hour = parts.hour ?? "00";
  const minute = parts.minute ?? "00";
  const second = parts.second ?? "00";

  return `${day} ${month} ${year} at ${hour}:${minute}:${second} UTC+5:30`;
};

const generateClientUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const splitCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1; // skip escaped quote
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsv = (text: string): MappedUser[] => {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length <= 1) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeKey);

  return lines
    .slice(1)
    .map((line) => {
      const cols = splitCsvLine(line);
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = cols[idx] ?? "";
      });

      const email = getField(record, ["email"])?.trim().toLowerCase();
      if (!email) return null;

      const firstName = getField(record, ["first_name", "firstname"]).trim();
      const lastName = getField(record, ["last_name", "lastname"]).trim();
      const courseName = getField(record, ["package_name", "packagename"]).trim();
      const courseDuration = getField(record, [
        "course duration",
        "course_duration",
        "courseduration",
        "duration",
      ]).trim();
      const courseStartDate = getField(record, [
        "start date",
        "start_date",
        "startdate",
        "course start date",
        "course_start_date",
        "coursestartdate",
      ]).trim();
      const name = [firstName, lastName].filter(Boolean).join(" ").trim();

      return {
        userId: generateClientUuid(),
        name: name || "User",
        email,
        password: "apple@123",
        role: "student",
        mobileNumber: "",
        courseName,
        courseDuration,
        courseStartDate,
        subject: "",
        createdAt: formatTimestampIST(),
      };
    })
    .filter((user): user is MappedUser => Boolean(user));
};

export default function UploadUsers() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [previewUsers, setPreviewUsers] = useState<MappedUser[]>([]);
  const { withLoader, isLoading } = useLoader();

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("parsing");
    setPreviewUsers([]);

    try {
      const text = await file.text();
      const users = parseCsv(text);
      if (users.length === 0) {
        throw new Error("No valid rows found (email required).");
      }

      setPreviewUsers(users);
      setStatus("ready");
      toast.info(`Preview ready for ${users.length} users.`, {
        toastId: "preview-ready",
      });
    } catch (error) {
      console.error("Parsing failed", error);
      setStatus("error");
      setPreviewUsers([]);
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Try again."
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleUploadToDatabase = async () => {
    if (previewUsers.length === 0) {
      toast.error("Upload a CSV to preview before sending to the database.");
      return;
    }
    setStatus("uploading");

    try {
      await withLoader(async () => {
        const response = await fetch("/api/uploadUsers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users: previewUsers }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            (errorBody as { message?: string }).message ?? "Upload failed"
          );
        }
      }, "Syncing users to the database...");

      setStatus("success");
      setPreviewUsers([]);
      toast.success("Data uploaded successfully.");
    } catch (error) {
      console.error("Upload failed", error);
      setStatus("error");
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Try again."
      );
    } finally {
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const statusLabel =
    isLoading
      ? "Saving to database..."
      : status === "parsing"
      ? "Reading CSV..."
      : status === "uploading"
      ? "Saving to database..."
      : status === "success"
      ? "Completed"
      : status === "error"
      ? "Failed"
      : status === "ready"
      ? "Preview ready"
      : "Upload";

  return (
    <Layout>
      <div className={styles.page}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Upload Users</h2>
            <p className={styles.subtitle}>
              Import a CSV of users; we&apos;ll map only the required fields
              before writing to the database.
            </p>
          </div>

          <label className={styles.uploadButton}>
            <span className={styles.buttonLabel}>Choose CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelection}
              className={styles.fileInput}
            />
          </label>

          <div className={styles.statusTrack}>
            <div
              className={`${styles.statusDot} ${styles[status] ?? ""}`}
              aria-label={statusLabel}
            />
            <span className={styles.statusText}>{statusLabel}</span>
          </div>

          <div className={styles.hint}>
            <strong>Required CSV headers:</strong>{" "}
            <code>email</code>, <code>first_name</code>, <code>last_name</code>,{" "}
            <code>course duration</code>, <code>package_name</code>,{" "}
            <code>Start Date</code>
          </div>
        </section>

        {previewUsers.length > 0 && (
          <section className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div>
                <p className={styles.previewTitle}>
                  Review mapped key/value pairs
                </p>
                <p className={styles.previewSubtitle}>
                  We will upload only these keys to the users collection.
                </p>
              </div>
              <button
                className={styles.submitButton}
                onClick={handleUploadToDatabase}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload to database"}
              </button>
            </div>

            <div className={styles.previewList}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>userId</th>
                    <th>name</th>
                    <th>email</th>
                    <th>password</th>
                    <th>role</th>
                    <th>mobileNumber</th>
                    <th>courseName</th>
                    <th>courseDuration</th>
                    <th>courseStartDate</th>
                    <th>subject</th>
                    <th>createdAt</th>
                  </tr>
                </thead>
                <tbody>
                  {previewUsers.map((user, index) => (
                    <tr key={user.email + index}>
                      <td>#{index + 1}</td>
                      <td>{user.userId}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.password}</td>
                      <td>{user.role}</td>
                      <td>{user.mobileNumber || "—"}</td>
                      <td>{user.courseName || "—"}</td>
                      <td>{user.courseDuration || "—"}</td>
                      <td>{user.courseStartDate || "—"}</td>
                      <td>{user.subject || "—"}</td>
                      <td>{user.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
