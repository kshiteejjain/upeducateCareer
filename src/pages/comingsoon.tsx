import Layout from "@/components/Layout/Layout";
import React, { useState } from "react";

export default function ComingSoon() {
  // Generate random positions on mount to avoid impure function calls during render
  const [animatedElements] = useState(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      fontSize: 20 + Math.random() * 30,
      opacity: 0.1 + Math.random() * 0.3,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    }));
  });

  return (
    <Layout>
    <div
      style={{
        height: "100vh",
        background:
          "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#222",
        textAlign: "center",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Animated background icons */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0
        }}
      >
        {animatedElements.map((elem) => (
          <span
            key={elem.id}
            style={{
              position: "absolute",
              left: `${elem.left}%`,
              top: `${elem.top}%`,
              fontSize: `${elem.fontSize}px`,
              opacity: elem.opacity,
              animation: `float ${elem.duration}s ease-in-out infinite`,
              animationDelay: `${elem.delay}s`
            }}
          >
            🚀
          </span>
        ))}
      </div>

      <div style={{ zIndex: 1 }}>
        {/* Infographic illustration */}
        <div
          style={{
            width: "160px",
            height: "160px",
            margin: "0 auto 1rem",
            background:
              "linear-gradient(145deg, #ff6a00, #ee0979)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite"
          }}
        >
          <span style={{ fontSize: "60px", color: "#fff" }}>🛠️</span>
        </div>

        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            animation: "fadeInDown 1s ease forwards"
          }}
        >
          Coming Soon!
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#555",
            maxWidth: "480px",
            margin: "0 auto 1.5rem",
            animation: "fadeInUp 1.5s ease forwards"
          }}
        >
          We’re working hard to launch something amazing. Stay tuned for
          exciting updates!
        </p>

        {/* Progress infographic */}
        <div
          style={{
            background: "#eee",
            borderRadius: "20px",
            height: "12px",
            width: "240px",
            margin: "0 auto",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(90deg, #ee0979, #ff6a00)",
              height: "100%",
              width: "70%",
              borderRadius: "20px",
              animation: "progress 3s ease-in-out infinite alternate"
            }}
          ></div>
        </div>

        <p
          style={{
            marginTop: "1rem",
            fontWeight: 500,
            color: "#888"
          }}
        >
          in progress...
        </p>
      </div>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes fadeInDown {
            from {opacity: 0; transform: translateY(-20px);}
            to {opacity: 1; transform: translateY(0);}
          }
          @keyframes fadeInUp {
            from {opacity: 0; transform: translateY(20px);}
            to {opacity: 1; transform: translateY(0);}
          }
          @keyframes pulse {
            0%, 100% {transform: scale(1);}
            50% {transform: scale(1.05);}
          }
          @keyframes progress {
            0% {width: 30%;}
            100% {width: 80%;}
          }
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg);}
            50% { transform: translateY(-20px) rotate(10deg);}
            100% { transform: translateY(0px) rotate(0deg);}
          }
        `}
      </style>
    </div>
    </Layout>
  );
}
