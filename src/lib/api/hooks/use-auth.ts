"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
	authApi,
	authQueryKeys,
	type LoginRequest,
	type LoginResponse,
} from "../auth";

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	newPasswordConfirm: string;
}

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

	return useMutation({
		mutationFn: async () => {
			// 리프레시 토큰 가져오기
			const refreshToken =
				typeof window !== "undefined"
					? localStorage.getItem("refreshToken")
					: null;

			if (!refreshToken) {
				throw new Error("리프레시 토큰이 없습니다.");
			}

			// 로그아웃 API 호출
			await authApi.logout(refreshToken);
		},
		onSuccess: () => {
			// 토큰 제거
			if (typeof window !== "undefined") {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
			}

			// 쿼리 캐시 초기화
			queryClient.clear();

			// 로그아웃 이벤트 발생
			window.dispatchEvent(new CustomEvent("auth:logout"));

			// 홈 화면으로 이동
			router.push("/");
		},
	});
};

export const useChangePassword = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: (request: ChangePasswordRequest) =>
			authApi.changePassword(
				request.currentPassword,
				request.newPassword,
				request.newPasswordConfirm,
			),
		onSuccess: () => {
			// 비밀번호 변경 성공 시 완료 페이지로 이동
			router.push("/account/edit/password/complete");
		},
	});
};

export interface WithdrawRequest {
	password: string;
	reason: string;
	detail?: string;
}

export const useWithdraw = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: WithdrawRequest) =>
			authApi.withdraw(request.password, request.reason, request.detail),
		onSuccess: () => {
			// 토큰 제거
			if (typeof window !== "undefined") {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
			}

			// 쿼리 캐시 초기화
			queryClient.clear();

			// 로그아웃 이벤트 발생
			window.dispatchEvent(new CustomEvent("auth:logout"));

			// 회원탈퇴 완료 페이지로 이동
			router.push("/account/withdraw/complete");
		},
	});
};
