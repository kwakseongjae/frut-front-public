"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
	authApi,
	authQueryKeys,
	type LoginRequest,
	type LoginResponse,
} from "../auth";

export const useLogin = () => {
	const queryClient = useQueryClient();
	const _router = useRouter();

	return useMutation({
		mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
		onSuccess: (data: LoginResponse) => {
			// 토큰 저장
			if (typeof window !== "undefined") {
				localStorage.setItem("accessToken", data.tokens.access);
				localStorage.setItem("refreshToken", data.tokens.refresh);
			}

			// 쿼리 캐시에 사용자 정보 저장
			queryClient.setQueryData(authQueryKeys.all, data.user);

			// 로그인 이벤트 발생
			window.dispatchEvent(
				new CustomEvent("auth:login", { detail: data.user }),
			);
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return () => {
		// 토큰 제거
		if (typeof window !== "undefined") {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		}

		// 쿼리 캐시 초기화
		queryClient.clear();

		// 로그아웃 이벤트 발생
		window.dispatchEvent(new CustomEvent("auth:logout"));

		// 로그인 페이지로 이동
		router.push("/signin");
	};
};
