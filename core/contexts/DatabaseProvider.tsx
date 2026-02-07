import React, { useEffect, useState } from "react";
import { initDatabase } from "../database";

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initDatabase(); // <-- appelé exactement une seule fois
    setDbInitialized(true);
  }, []);

  if (!dbInitialized) return null; // ou un splash/loading

  return <>{children}</>;
};
