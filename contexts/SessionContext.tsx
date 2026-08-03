"use client";

import {
  createContext,
  useContext,
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

  return (
    <SessionContext.Provider
      value={{
  user,
  hasAccess,
  unlockedCourses,

  setSession: (session: SessionData) => {
    setUser(session.user);
    setHasAccess(session.hasAccess);
    setUnlockedCourses(session.unlockedCourses);
       },
    }}
    >
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