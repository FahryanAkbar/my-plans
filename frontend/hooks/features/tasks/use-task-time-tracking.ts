import { useState, useEffect } from "react";
import { TASK_STATUS, TaskStatus } from "@/lib/constants/task";

interface UseTaskTimeTrackingProps {
  status: TaskStatus;
  lastStatusChangedAt?: number;
  actualHours?: number;
}

export const useTaskTimeTracking = ({
  status,
  lastStatusChangedAt,
  actualHours = 0,
}: UseTaskTimeTrackingProps) => {
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    if (status !== TASK_STATUS.IN_PROGRESS || !lastStatusChangedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionTime(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const deltaMs = now - lastStatusChangedAt;
      const deltaHours = deltaMs / (1000 * 60 * 60);
      setSessionTime(deltaHours);
    };

    updateTimer();
    
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [status, lastStatusChangedAt]);

  const totalActualHours = Number((actualHours + sessionTime).toFixed(2));

  return {
    sessionTime,
    totalActualHours,
  };
};
