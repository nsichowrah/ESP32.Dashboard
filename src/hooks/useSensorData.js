import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "../config/firebase";

const normalizeTimestamp = (value) => {
  if (value == null) return null;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value < 1_000_000_000_000 ? value * 1000 : value;
  return null;
};

export default function useSensorData() {
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    timestamp: null
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let latestReady = false;
    let historyReady = false;

    const maybeStopLoading = () => {
      if (latestReady && historyReady) {
        setLoading(false);
      }
    };

    const latestRef = doc(db, "sensorData", "latest");
    const unsubscribeLatest = onSnapshot(
      latestRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSensorData({
            temperature: data.temperature ?? null,
            humidity: data.humidity ?? null,
            timestamp: normalizeTimestamp(data.timestamp)
          });
        }

        latestReady = true;
        maybeStopLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message || "Failed to load latest sensor data.");
        latestReady = true;
        maybeStopLoading();
      }
    );

    const historyQuery = query(
      collection(db, "sensorHistory"),
      orderBy("timestamp", "desc"),
      limit(25)
    );

    const unsubscribeHistory = onSnapshot(
      historyQuery,
      (snapshot) => {
        const formatted = snapshot.docs
          .map((item) => {
            const data = item.data();
            return {
              id: item.id,
              temperature: data.temperature ?? null,
              humidity: data.humidity ?? null,
              timestamp: normalizeTimestamp(data.timestamp)
            };
          })
          .filter((item) => item.timestamp !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        setHistory(formatted);
        historyReady = true;
        maybeStopLoading();
      },
      (snapshotError) => {
        setError(snapshotError.message || "Failed to load sensor history.");
        historyReady = true;
        maybeStopLoading();
      }
    );

    return () => {
      unsubscribeLatest();
      unsubscribeHistory();
    };
  }, []);

  const lastUpdated = useMemo(() => {
    if (!sensorData.timestamp) return "No timestamp yet";
    return new Date(sensorData.timestamp).toLocaleString();
  }, [sensorData.timestamp]);

  return {
    sensorData,
    history,
    loading,
    error,
    lastUpdated
  };
}
