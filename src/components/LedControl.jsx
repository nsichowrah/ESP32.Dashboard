import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

const ledRef = doc(db, "deviceControl", "led");
const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

const LedControl = ({ canControl, getIdToken }) => {
  const [state, setState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      ledRef,
      (snapshot) => {
        const currentState = snapshot.exists() ? snapshot.data().state : 0;
        setState(currentState === 1 ? 1 : 0);
      },
      (snapshotError) => {
        setError(snapshotError.message || "Failed to subscribe to LED state.");
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleLed = async () => {
    if (state === null || saving || !canControl) return;
    if (!backendBaseUrl) {
      setError("Missing VITE_BACKEND_BASE_URL in frontend environment.");
      return;
    }

    const nextState = state === 1 ? 0 : 1;
    setSaving(true);
    setError(null);

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error("Authentication token missing. Please sign in again.");
      }

      const response = await fetch(`${backendBaseUrl}/api/led`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ state: nextState })
      });

      if (!response.ok) {
        let message = "Failed to update LED state from backend.";
        try {
          const payload = await response.json();
          if (payload?.error) message = payload.error;
        } catch (parseError) {
          // Ignore JSON parse errors and keep generic message.
        }
        throw new Error(message);
      }
    } catch (writeError) {
      setError(writeError.message || "Failed to update LED state.");
    } finally {
      setSaving(false);
    }
  };

  const buttonLabel = state === 1 ? "Turn LED OFF" : "Turn LED ON";

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-panel backdrop-blur-sm sm:p-5">
      <p className="text-sm font-semibold tracking-wide text-slate-500">LED Control</p>
      <p className="mt-2 text-lg font-bold text-slate-800">
        Status: {state === 1 ? "ON" : state === 0 ? "OFF" : "Loading..."}
      </p>

      <button
        type="button"
        onClick={toggleLed}
        disabled={state === null || saving || !canControl}
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {saving ? "Updating..." : canControl ? buttonLabel : "Sign in to control LED"}
      </button>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </article>
  );
};

export default LedControl;
