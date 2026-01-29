import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import styles from "./ChartCard.module.css";

// ✅ Register both controllers + elements + scales
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

interface ChartCardProps {
  title: string;
  type: "bar" | "pie";
  data: ChartData<"bar" | "pie">;
}

export default function ChartCard({ title, type, data }: ChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"bar" | "pie"> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart before creating a new one (to prevent memory leaks)
    if (chartInstance.current) chartInstance.current.destroy();

    const baseOptions = {
      plugins: {
        legend: { display: type === "pie" },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    const barOptions =
      type === "bar"
        ? {
            ...baseOptions,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  precision: 0,
                },
              },
            },
          }
        : baseOptions;

    chartInstance.current = new Chart(canvasRef.current, {
      type,
      data,
      options: barOptions,
    });
  }, [data, type]);

  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
