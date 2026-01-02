import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getSession, saveSession } from "@/utils/authSession";
import styles from "./Login.module.css";
import { useLoader } from "@/components/Loader/LoaderProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { withLoader, isLoading } = useLoader();

  useEffect(() => {
    const existingSession = getSession();
    if (existingSession) {
      router.replace("/Dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await withLoader(async () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const message =
            (errorBody as { message?: string }).message ??
            "Invalid email or password.";
          toast.error(message);
          return;
        }

        const result = (await response.json()) as {
          message?: string;
          user?: { name?: string; role?: string; email?: string; userId?: string };
        };

        const authenticatedUser = {
          ...result.user,
          email: result.user?.email ?? email,
        };
        saveSession(authenticatedUser);

        const name = authenticatedUser?.name ?? "";
        toast.success(
          name
            ? `Welcome back, ${name}!`
            : result.message ?? "Login successful."
        );
        router.push("/Dashboard");
      }, "Signing you in...");
    } catch (error) {
      console.error("Failed to login via API", error);
      toast.error("Could not login right now. Please try again.");
    }
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Red Image Section */}
      <div className={styles.leftSection}>
        <div className="overlay">
          <h1 className={styles.brand}>Red and White</h1>
          <p className={styles.tagline}>
            Learn like top IITians & achieve Professional Jobs <br /> Trusted by
            1500+ Placement Partners
          </p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <h2 className={styles.heading}>Welcome Back</h2>
          <p className={styles.subHeading}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className={styles.formBox}>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <div className={styles.passwordRow}>
                <label>Password:</label>
              </div>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <div className={styles.forgotPassword}>
              <span
                  className={styles.forgotPasswordLink}
                  onClick={() => router.push("/login/forgot-password")}
                >
                  Forgot password?
                </span>
            </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>New to Red and White?</span>
          </div>

          <button
            className={styles.createAccountButton}
            onClick={handleCreateAccount}
            disabled={isLoading}
          >
            Create Account
          </button>

          <p className={styles.terms}>
            By continuing, you agree to our{" "}
            <a href="#" className={styles.link}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className={styles.link}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
