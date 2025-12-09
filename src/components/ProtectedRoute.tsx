"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isLoggedIn, isInitialized } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// 초기화가 완료된 후에만 리다이렉트 체크
		// isInitialized가 false면 아직 토큰 확인 중이므로 리다이렉트하지 않음
		if (isInitialized && !isLoggedIn) {
			// 현재 경로를 redirect 파라미터로 전달
			const currentPath = window.location.pathname;
			// replace를 사용하여 로그인 페이지로 이동 후 뒤로가기 시 이전 페이지로 돌아가지 않도록 함
			router.replace(`/signin?redirect=${encodeURIComponent(currentPath)}`);
			return;
		}
	}, [isLoggedIn, isInitialized, router]);

	// 초기화 중이면 아무것도 렌더링하지 않음 (리다이렉트하지 않음)
	// 이렇게 하면 토큰 확인이 완료될 때까지 페이지가 유지됨
	if (!isInitialized) {
		return null;
	}

	// 초기화 완료 후 로그인하지 않은 경우에만 리다이렉트
	// useEffect에서 리다이렉트를 처리하므로 여기서는 null 반환
	if (!isLoggedIn) {
		return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
	}

	return <>{children}</>;
};

export default ProtectedRoute;
