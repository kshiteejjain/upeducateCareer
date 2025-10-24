import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   const router = useRouter();

   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });

    // On successful login, redirect to dashboard
    if (email && password) {
      router.push("/Dashboard");
    }
  };

  const handleCreateAccount = () => {
    // Redirect to registration page when "Create Account" is clicked
    router.push("/register");
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Red Image Section */}
      <div className={styles.leftSection}>
        <div className="overlay">
          <h1 className={styles.brand}>Red and White</h1>
          <p className={styles.tagline}>
            Learn like top IITians & achieve Professional Jobs <br /> Trusted by 1500+ Placement Partners
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
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary">
              🔐 Sign In
            </button>

          </form>

          <div className={styles.divider}>
            <span>New to Red and White?</span>
          </div>

          <button className={styles.createAccountButton} onClick={handleCreateAccount}>
            ✨ Create Account
          </button>

          <p className={styles.terms}>
            By continuing, you agree to our{" "}
            <a href="#" className={styles.link}>Terms of Service</a> and{" "}
            <a href="#" className={styles.link}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
