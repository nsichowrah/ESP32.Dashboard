import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TemperatureChart = ({ history }) => {
  const chartHistory = history.filter((entry) => entry.temperature !== null);

  if (!chartHistory.length) {
    return (
      <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-panel backdrop-blur-sm sm:p-5">
        <p className="text-sm font-semibold tracking-wide text-slate-500">Temperature History</p>
        <p className="mt-5 text-sm font-medium text-slate-500">Waiting for sensor history data...</p>
      </article>
    );
  }

  const data = {
    labels: chartHistory.map((entry) => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Temperature (deg C)",
        data: chartHistory.map((entry) => entry.temperature),
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.2)",
        fill: true,
        pointRadius: 2,
        tension: 0.28
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          boxWidth: 14,
          color: "#334155"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
          maxTicksLimit: 6
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: "#64748b"
        },
        grid: {
          color: "rgba(100, 116, 139, 0.15)"
        }
      }
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-panel backdrop-blur-sm sm:p-5">
      <p className="text-sm font-semibold tracking-wide text-slate-500">Temperature History</p>
      <div className="mt-4 h-64 sm:h-72">
        <Line data={data} options={options} />
      </div>
    </article>
  );
};

export default TemperatureChart;
