"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { User } from "@/lib/api/auth";
import { authQueryKeys } from "@/lib/api/auth";

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

	useEffect(() => {
		// 클라이언트에서만 실행 (서버에서는 실행되지 않음)
		if (typeof window === "undefined") {
			return;
		}

		// 초기 로드 시 토큰 확인
		const accessToken = localStorage.getItem("accessToken");
		const cachedUser = queryClient.getQueryData<User>(authQueryKeys.all);

		// 토큰이 있으면 로그인 상태로 설정
		if (accessToken) {
			setIsLoggedIn(true);
			if (cachedUser) {
				setUser(cachedUser);
			}
		} else {
			setIsLoggedIn(false);
			setUser(null);
		}

		// 초기화 완료 표시
		setIsInitialized(true);

		// 로그인 이벤트 리스너
		const handleLogin = (event: CustomEvent<User>) => {
			setIsLoggedIn(true);
			setUser(event.detail);
		};

		// 로그아웃 이벤트 리스너
		const handleLogout = () => {
			setIsLoggedIn(false);
			setUser(null);
		};

		window.addEventListener("auth:login", handleLogin as EventListener);
		window.addEventListener("auth:logout", handleLogout);

		return () => {
			window.removeEventListener("auth:login", handleLogin as EventListener);
			window.removeEventListener("auth:logout", handleLogout);
		};
	}, [queryClient]);

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
