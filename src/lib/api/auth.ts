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
};

export const authQueryKeys = {
	all: queryKeys.users.auth.all,
	login: queryKeys.users.auth.login,
	refresh: queryKeys.users.auth.refresh,
};
