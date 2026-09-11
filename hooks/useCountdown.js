import { useEffect, useState } from "react";

export default function useCountdown(initialSeconds, disabled = false) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (disabled) return;
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, disabled]);

  const reset = () => setSeconds(initialSeconds);

  return { seconds, reset };
}