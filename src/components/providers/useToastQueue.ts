"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}

const TOAST_DURATION_MS = 4000;

function createToastId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}`;
}

/**
 * Manages transient status toasts with guaranteed timer cleanup on unmount.
 */
export function useToastQueue() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const notify = useCallback((title: string, description?: string) => {
    const id = createToastId();
    setToasts((prev) => [...prev, { id, title, description }]);
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, TOAST_DURATION_MS);
    timersRef.current.add(timer);
  }, []);

  return { toasts, notify };
}
