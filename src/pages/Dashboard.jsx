import { lazy, Suspense } from "react";
import AuthPanel from "../components/AuthPanel";
import LedControl from "../components/LedControl";
import SensorCard from "../components/SensorCard";
import useAuth from "../hooks/useAuth";
import useSensorData from "../hooks/useSensorData";

const TemperatureChart = lazy(() => import("../components/TemperatureChart"));
const HumidityChart = lazy(() => import("../components/HumidityChart"));

const Dashboard = () => {
  const { sensorData, history, loading, error, lastUpdated } = useSensorData();
  const { user, loading: authLoading, error: authError, signIn, signOutUser, getIdToken } = useAuth();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header className="mb-6 rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-panel backdrop-blur-sm sm:mb-8 sm:p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          ESP32 IoT Dashboard
        </h1>
        <p className="mt-2 text-xs font-semibold text-slate-600 sm:text-sm">Last updated: {lastUpdated}</p>
      </header>

      {error && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SensorCard title="Temperature" value={sensorData.temperature} unit="deg C" />
        <SensorCard title="Humidity" value={sensorData.humidity} unit="%" />
        <LedControl canControl={Boolean(user)} getIdToken={getIdToken} />
        <AuthPanel
          user={user}
          loading={authLoading}
          error={authError}
          onSignIn={signIn}
          onSignOut={signOutUser}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Suspense
          fallback={
            <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-panel backdrop-blur-sm">
              <p className="text-sm font-semibold tracking-wide text-slate-500">Loading chart...</p>
            </article>
          }
        >
          <TemperatureChart history={history} />
        </Suspense>
        <Suspense
          fallback={
            <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-panel backdrop-blur-sm">
              <p className="text-sm font-semibold tracking-wide text-slate-500">Loading chart...</p>
            </article>
          }
        >
          <HumidityChart history={history} />
        </Suspense>
      </section>

      {loading && (
        <p className="mt-4 text-center text-sm font-semibold text-slate-500">Loading live data...</p>
      )}
    </main>
  );
};

export default Dashboard;
