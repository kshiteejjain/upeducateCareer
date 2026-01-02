import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./Register.module.css";
import { createRecordFromSchema } from "@/utils/schemaUtils";
import {
  registerFormSchema,
  type RegisterFormRecord,
} from "@/utils/formSchemas";
import { toast } from "react-toastify";
import { useLoader } from "@/components/Loader/LoaderProvider";

const initialFormState: RegisterFormRecord = {
  ...createRecordFromSchema(registerFormSchema),
  role: "faculty",
};

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormRecord>(initialFormState);
  const { withLoader, isLoading } = useLoader();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const field = e.target.name as keyof RegisterFormRecord;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value } as RegisterFormRecord));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const record = {
      role: formData.role,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      subject: formData.role === "faculty" ? formData.subject : "",
      courseName: formData.role === "student" ? formData.courseName : "",
      courseDuration: formData.role === "student" ? formData.courseDuration : "",
      courseStartDate:
        formData.role === "student" ? formData.courseStartDate : "",
      mobileNumber: formData.role === "student" ? formData.mobileNumber : "",
      createdAt: new Date().toISOString(),
    };

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const message =
            (errorBody as { message?: string }).message ??
            "Could not register right now. Please try again.";
          toast.error(message);
          return;
        }

        toast.success(`Welcome ${formData.name}! You registered as ${formData.role}.`);
        router.push("/login");
      }, "Creating your account...");
    } catch (error) {
      console.error("Failed to register via API", error);
      toast.error("Could not register right now. Please try again.");
    }
  };

  return (
    <div className={styles.registerPage}>
      {/* Left Section (Same visual as login) */}
      <div className={styles.leftSection}>
        <div className="overlay">
          <h1 className={styles.brand}>Red and White</h1>
          <p className={styles.tagline}>
            Join our vibrant learning community and unlock your potential.
          </p>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <h2 className={styles.heading}>Create Your Account</h2>
          <p className={styles.subHeading}>
            Register to start your journey with Red and White
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Role:</label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                {/* <option value="student">Student</option> */}
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {formData.role === "faculty" && (
              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  name="subject"
                  className="form-control"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.role === "student" && (
              <>
                <div className="form-group">
                  <label>Course Name:</label>
                  <input
                    type="text"
                    name="courseName"
                    className="form-control"
                    placeholder="Enter course name"
                    value={formData.courseName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Course Duration:</label>
                  <input
                    type="text"
                    name="courseDuration"
                    className="form-control"
                    placeholder="e.g., 6 months"
                    value={formData.courseDuration}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Course Start Date:</label>
                  <input
                    type="date"
                    name="courseStartDate"
                    className="form-control"
                    value={formData.courseStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number:</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    className="form-control"
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className={styles.terms}>
            Already have an account?{" "}
            <a
              href="#"
              onClick={() => router.push("/login")}
              className={styles.loginLink}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
