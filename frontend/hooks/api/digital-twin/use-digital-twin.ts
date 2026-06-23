import { useState, useEffect } from "react";
import { toast } from "sonner";
import { digitalTwinService } from "@/services";
import { TwinStateDto } from "@/types/features";

export function useDigitalTwin(projectId: string) {
  const [state, setState] = useState<TwinStateDto | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const disconnect = digitalTwinService.connectToTwin(
      projectId,
      (updatedState) => {
        setState(updatedState);
      },
      {
        onConnect: () => {
          setIsConnected(true);
          setError(null);
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        onError: (errMsg) => {
          setError(errMsg);
          toast.error(`Digital Twin connection error: ${errMsg}`);
        },
      },
    );

    return () => {
      disconnect();
    };
  }, [projectId]);

  return {
    state,
    isConnected,
    error,
  };
}
