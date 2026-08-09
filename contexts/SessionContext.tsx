"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

type SessionUser = {
  id: number;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
};

type SessionData = {
  user: SessionUser | null;
  hasAccess: boolean;
  unlockedCourses: string[];
};

type SessionContextType = SessionData & {
  setSession: (session: SessionData) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);

  const [hasAccess, setHasAccess] = useState(false);

  const [unlockedCourses, setUnlockedCourses] =
    useState<string[]>([]);

  /*
   * A new setSession identity on every render was re-triggering any effect
   * that listed it as a dependency. TelegramAuth's login effect does, so a
   * successful login re-ran it, POSTed /api/telegram-login again, and the
   * loop never settled — a logged-in user's session cookie was created, but
   * the app stayed on the splash forever.
   */
  const setSession = useCallback(
    (session: SessionData) => {
      setUser(session.user);
      setHasAccess(session.hasAccess);
      setUnlockedCourses(session.unlockedCourses);
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      hasAccess,
      unlockedCourses,
      setSession,
    }),
    [user, hasAccess, unlockedCourses, setSession]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession must be used inside SessionProvider."
    );
  }

  return context;
}