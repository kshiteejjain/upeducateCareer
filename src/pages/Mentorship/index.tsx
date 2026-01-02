import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import styles from "./Mentorship.module.css";
import { toast } from "react-toastify";

type Mentor = {
  name: string;
  title: string;
  about: string;
  organization: string;
  experience: string;
  techStack: string[];
  city: string;
  photo: string;
};

const mentors: Mentor[] = [
  {
    name: "Kshiteej Jain",
    title:
      "AI Engineer · Frontend Engineer · JavaScript",
    about:
      "Builds AI-first web and mobile experiences, orchestrates RAG and agentic workflows, and designs scalable micro frontends.",
    organization: "Cybage Software",
    experience: "12+ years",
    techStack: [
      "JavaScript",
      "React",
      "Next.js",
      "LangChain",
      "RAG",
      "Vector DBs",
      "MCP",
      "n8n",
    ],
    city: "Gandhinagar, Gujarat, India",
    photo:
      "https://media.licdn.com/dms/image/v2/D4D03AQFg7oYgENDlGg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1721038406569?e=1769040000&v=beta&t=SiGbLnZCLJs6y2Q6WUY13PUlTEz4jVbOnfPnU6JeLAU",
  },
  {
    name: "Mithun Pangal",
    title:
      "Advisor , Technologist and Investor",
    about:
      "As for now I am enabling ideas state and central Govt bodies at scale. I love breaking down complex issues to simplicity, I was fortunate to share my ideas on a Tedx platform do check out the video below.",
    organization: "VYE",
    experience: "20+ years",
    techStack: [
      "AI Research",
      "Government Relations",
      "Technology Advisory",
      "Virtual Reality"
    ],
    city: "Pune, Maharashtra, India",
    photo:
      "https://media.licdn.com/dms/image/v2/C4E03AQFJdFX_SnIEQw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517686417950?e=1769040000&v=beta&t=Po6kalloktIEHsq8rcjr-ik1ClMQjI3NeqiOThVSbuA",
  },
  {
    name: "Dinesh Gaddi",
    title: "Data Scientist",
    about:
      "Delivers data-driven insights and production ML models with an eye on measurable business impact.",
    organization: "Quinnox, Inc.",
    experience: "12+ years",
    techStack: ["Python", "Pandas", "TensorFlow", "SQL", "MLOps"],
    city: "Mumbai, Maharashtra, India",
    photo:
      "https://media.licdn.com/dms/image/v2/C4D03AQGn_LwKyadFKQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1516798275836?e=1769040000&v=beta&t=5fjkcQ5KEv6NBHCJs3yRh8w2koPwFXqzxo3DrP7PgPY",
  },
  {
    name: "Resham Chand Ramola",
    title: "Java Architect",
    about:
      "Architects robust Java platforms and optimizes enterprise-grade services for performance and resilience.",
    organization: "Infosys",
    experience: "18+ years",
    techStack: ["Java", "Spring", "Microservices", "Kafka", "Cloud"],
    city: "Mumbai, India",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Ajit Sharma",
    title:
      "Senior Engineering Manager · Mobile App Development",
    about:
      "Leads mobile engineering teams, shipping performant apps and mentoring engineers on architecture and delivery.",
    organization: "Jio Tesseract",
    experience: "14+ years",
    techStack: ["iOS", "Android", "React Native", "System Design", "CI/CD"],
    city: "Mumbai, Maharashtra, India",
    photo:
      "https://media.licdn.com/dms/image/v2/C4D03AQHjKexpvI1FPw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517072201152?e=1769040000&v=beta&t=bwgM3rlnpFPAfiTcCA0LVxRgnikl33ageTUDlXySwpo",
  },
  {
    name: "Suresh Vishwakarma",
    title:
      "UI Designer · Digital Product Innovator",
    about:
      "Designs user-centered digital products, crafting clean interfaces and thoughtful interaction patterns.",
    organization: "Huawei",
    experience: "12+ years",
    techStack: ["Figma", "Sketch", "Prototyping", "Design Systems", "UX"],
    city: "Dubai, United Arab Emirates",
    photo:
      "https://media.licdn.com/dms/image/v2/D4D03AQFIPZvvYos3KQ/profile-displayphoto-scale_200_200/B4DZjsuCFeG8AY-/0/1756318148307?e=1769040000&v=beta&t=0O46SOzAZg7ISCsDGYVcI51wH6YKyJhi76067zW1R_M",
  },
];

export default function Mentorship() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const openModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormState({ name: "", email: "", message: "" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Message sent successfully, will get back shortly");
    closeModal();
  };

  return (
    <Layout>
      <section className={styles.grid}>
        {mentors.map((mentor) => (
          <article key={mentor.name} className={styles.card}>
            <div className={styles.avatarWrap}>
              <img
                src={mentor.photo}
                alt={mentor.name}
                className={styles.avatar}
              />
              <span className={styles.verified} aria-label="Verified mentor">
                ✓
              </span>
            </div>
            <h3 className={styles.name}>{mentor.name}</h3>
            <p className={styles.role}>{mentor.title}</p>

             <p className={styles.about}>{mentor.about}</p>

            <div className={styles.metaRow}>
              <div>
                <p className={styles.metaLabel}>Organization</p>
                <p className={styles.metaValue}>{mentor.organization}</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Experience</p>
                <p className={styles.metaValue}>{mentor.experience}</p>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div>
                <p className={styles.metaLabel}>City</p>
                <p className={styles.metaValue}>{mentor.city}</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Tech Stack</p>
                <p className={styles.metaValue}>
                  {mentor.techStack.join(", ")}
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.ctaButton}
              onClick={() => openModal(mentor)}
            >
              Connect
            </button>
          </article>
        ))}
      </section>

      {isModalOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={closeModal}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Connect with mentor"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalKicker}>Connect with</p>
                <h4 className={styles.modalTitle}>
                  {selectedMentor?.name ?? "Mentor"}
                </h4>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Name</span>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  type="email"
                  className={styles.input}
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Message</span>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={formState.message}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
