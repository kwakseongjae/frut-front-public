import { apiClient } from "./client";
import { queryKeys } from "./query-keys";

export interface LoginRequest {
	username: string;
	password: string;
}

export interface User {
	id: number;
	username: string;
	name: string;
	email: string;
	phone: string;
	profile_image: string | null;
	user_type: "CONSUMER" | "SELLER" | "ADMIN";
	point_balance: number;
	is_marketing_consented: boolean;
	user_note: string | null;
	date_joined: string;
	last_login: string | null;
}

export interface Tokens {
	access: string;
	refresh: string;
}

export interface LoginResponse {
	user: User;
	tokens: Tokens;
}

export interface RefreshRequest {
	refresh: string;
}

export interface RefreshResponse {
	access: string;
	refresh: string;
}

export interface SendSmsRequest {
	phone: string;
}

export interface SendSmsResponse {
	success: boolean;
	data: null;
	message: string;
}

export interface VerifySmsRequest {
	phone: string;
	code: string;
}

export interface VerifySmsResponse {
	success: boolean;
	data: null;
	message: string;
}

export interface RegisterRequest {
	username: string;
	name: string;
	email: string;
	phone: string;
	password: string;
	password_confirm: string;
	marketing_agreed: boolean;
}

export interface RegisterResponse {
	success: boolean;
	data: User;
	message: string;
}

export const authApi = {
	login: async (credentials: LoginRequest): Promise<LoginResponse> => {
		const data = await apiClient.post<LoginResponse>(
			"/api/users/auth/login",
			credentials,
		);
		return data;
	},

	refresh: async (refreshToken: string): Promise<RefreshResponse> => {
		const data = await apiClient.post<RefreshResponse>(
			"/api/users/auth/refresh",
			{ refresh: refreshToken },
		);
		return data;
	},

	sendSmsVerification: async (
		request: SendSmsRequest,
	): Promise<SendSmsResponse> => {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/auth/sms/send`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request),
			},
		);

		const data: SendSmsResponse = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || "인증번호 발송에 실패했습니다.");
		}

		return data;
	},

	verifySmsCode: async (
		request: VerifySmsRequest,
	): Promise<VerifySmsResponse> => {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/auth/sms/verify`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request),
			},
		);

		const data: VerifySmsResponse = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || "인증번호 확인에 실패했습니다.");
		}

		return data;
	},

	register: async (request: RegisterRequest): Promise<RegisterResponse> => {
		const response = await fetch(
			`${
				process.env.NEXT_PUBLIC_API_BASE_URL || ""
			}/api/users/auth/register-twilio`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request),
			},
		);

		const data: RegisterResponse = await response.json();

		if (!response.ok || !data.success) {
			const error = new Error(data.message || "회원가입에 실패했습니다.");
			// 필드별 에러 정보를 에러 객체에 포함
			(
				error as Error & { fieldErrors?: Record<string, string[]> }
			).fieldErrors = (
				data as unknown as { data?: Record<string, string[]> }
			).data;
			throw error;
		}

		return data;
	},
};

export const authQueryKeys = {
	all: queryKeys.users.auth.all,
	login: queryKeys.users.auth.login,
	refresh: queryKeys.users.auth.refresh,
};
