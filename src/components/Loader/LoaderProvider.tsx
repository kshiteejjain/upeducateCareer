import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Loader from "./Loader";

type LoaderContextValue = {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoader: <T>(operation: () => Promise<T>, message?: string) => Promise<T>;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startLoading = useCallback((nextMessage?: string) => {
    setPending((count) => count + 1);
    if (nextMessage) {
      setMessage(nextMessage);
    }
  }, []);

  const stopLoading = useCallback(() => {
    setPending((count) => Math.max(0, count - 1));
  }, []);

  useEffect(() => {
    if (pending === 0) {
      setMessage(null);
    }
  }, [pending]);

  const withLoader = useCallback(
    async <T,>(operation: () => Promise<T>, message?: string) => {
      startLoading(message);
      try {
        return await operation();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const value = useMemo(
    () => ({
      isLoading: pending > 0,
      startLoading,
      stopLoading,
      withLoader,
    }),
    [pending, startLoading, stopLoading, withLoader]
  );

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <Loader active={pending > 0} message={message} />
    </LoaderContext.Provider>
  );
}

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
