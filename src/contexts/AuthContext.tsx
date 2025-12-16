"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@/lib/api/auth";
import { authQueryKeys } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();

  // 서버와 클라이언트에서 동일한 초기값 사용 (hydration mismatch 방지)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // accessToken 상태 초기화
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
    }
  }, []);

  // 프로필 조회 (accessToken이 있을 때만)
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["users", "profile"],
    queryFn: () => usersApi.getProfile(),
    enabled: !!accessToken,
    retry: false,
  });

  useEffect(() => {
    // 클라이언트에서만 실행 (서버에서는 실행되지 않음)
    if (typeof window === "undefined") {
      return;
    }

    // 초기 로드 시 토큰 확인
    const cachedUser = queryClient.getQueryData<User>(authQueryKeys.all);

    // 토큰이 있으면 로그인 상태로 설정
    if (accessToken) {
      setIsLoggedIn(true);
      // 프로필 데이터가 있으면 User 타입으로 변환하여 설정
      if (profileData) {
        // User 타입에 맞게 변환 (프로필 데이터를 User로 매핑)
        const userData: User = {
          id: 0, // 프로필 API에는 id가 없으므로 0으로 설정
          username: profileData.username,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          profile_image: null,
          user_type: profileData.user_type,
          point_balance: 0,
          is_marketing_consented: profileData.is_marketing_consented,
          user_note: null,
          date_joined: "",
          last_login: null,
        };
        setUser(userData);
        // 쿼리 캐시에도 저장
        queryClient.setQueryData(authQueryKeys.all, userData);
      } else if (cachedUser) {
        setUser(cachedUser);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }

    // 프로필 로딩이 완료되면 초기화 완료 표시
    if (!isProfileLoading) {
      setIsInitialized(true);
    }

    // 로그인 이벤트 리스너
    const handleLogin = (event: CustomEvent<User>) => {
      setIsLoggedIn(true);
      setUser(event.detail);
      setAccessToken(localStorage.getItem("accessToken"));
    };

    // 로그아웃 이벤트 리스너
    const handleLogout = () => {
      setIsLoggedIn(false);
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener("auth:login", handleLogin as EventListener);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:login", handleLogin as EventListener);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [queryClient, accessToken, profileData, isProfileLoading]);

  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
