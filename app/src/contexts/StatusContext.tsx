import { createContext, useContext, useState, type ReactNode } from "react";

export type StatusState = "idle" | "converting" | "rendering" | "applying";

interface StatusContextValue {
  readonly status: StatusState;
  readonly setStatus: (s: StatusState) => void;
}

const StatusContext = createContext<StatusContextValue>({
  status: "idle",
  setStatus: () => {},
});

export function StatusProvider({ children }: { readonly children: ReactNode }) {
  const [status, setStatus] = useState<StatusState>("idle");
  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatus(): StatusContextValue {
  return useContext(StatusContext);
}
