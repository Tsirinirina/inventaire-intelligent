import { useCameraPermissions } from "expo-camera";
import { useCallback, useEffect } from "react";

export const useCamera = (autoRequest = true) => {
  const [permission, requestCameraPermission] = useCameraPermissions();

  const getStatus = () => {
    if (!permission) return "loading";
    if (permission.granted) return "granted";
    if (!permission.canAskAgain) return "blocked";
    return "denied";
  };

  const status = getStatus();

  const requestPermission = useCallback(async () => {
    try {
      await requestCameraPermission();
    } catch (error) {
      console.error("Failed to request camera permission:", error);
    }
  }, [requestCameraPermission]);

  // Auto-request on mount
  useEffect(() => {
    if (autoRequest && status === "denied") {
      requestPermission();
    }
  }, [autoRequest, status, requestPermission]);

  return {
    status,
    isReady: status === "granted",
    requestPermission,
  };
};
