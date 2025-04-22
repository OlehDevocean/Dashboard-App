import { useEffect, useRef } from "react";

export function useAutoRefresh(callback: () => Promise<void>, intervalMs: number) {
  const callbackRef = useRef(callback);
  
  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const refresh = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    };
    
    // Set interval for auto refresh
    const interval = setInterval(refresh, intervalMs);
    
    // Clear interval on unmount
    return () => clearInterval(interval);
  }, [intervalMs]);
}
