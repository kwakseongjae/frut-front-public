const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export interface ApiError {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
}

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private async getAccessToken(): Promise<string | null> {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("accessToken");
	}

	private async getRefreshToken(): Promise<string | null> {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("refreshToken");
	}

	private async setTokens(
		accessToken: string,
		refreshToken: string,
	): Promise<void> {
		if (typeof window === "undefined") return;
		localStorage.setItem("accessToken", accessToken);
		localStorage.setItem("refreshToken", refreshToken);
	}

	private async clearTokens(): Promise<void> {
		if (typeof window === "undefined") return;
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
	}

	private async refreshAccessToken(): Promise<string | null> {
		const refreshToken = await this.getRefreshToken();
		if (!refreshToken) return null;

		try {
			const response = await fetch(`${this.baseURL}/api/users/auth/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refresh: refreshToken }),
			});

			if (!response.ok) {
				await this.clearTokens();
				return null;
			}

			const data: ApiResponse<{ access: string; refresh: string }> =
				await response.json();

			if (data.success && data.data) {
				await this.setTokens(data.data.access, data.data.refresh);
				return data.data.access;
			}

			return null;
		} catch {
			await this.clearTokens();
			return null;
		}
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const accessToken = await this.getAccessToken();

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		};

		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`;
		}

		let response = await fetch(url, {
			...options,
			headers,
		});

		// 401 에러 시 토큰 갱신 시도
		if (response.status === 401 && accessToken) {
			const newAccessToken = await this.refreshAccessToken();
			if (newAccessToken) {
				const retryHeaders: Record<string, string> = {
					...headers,
					Authorization: `Bearer ${newAccessToken}`,
				};
				response = await fetch(url, {
					...options,
					headers: retryHeaders,
				});
			} else {
				// 리프레시 실패 시 로그아웃 처리
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("auth:logout"));
				}
				throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
			}
		}

		if (!response.ok) {
			const errorData: ApiError = await response.json().catch(() => ({
				success: false,
				message: "요청 처리 중 오류가 발생했습니다.",
			}));
			throw new Error(errorData.message || "요청 처리 중 오류가 발생했습니다.");
		}

		const data: ApiResponse<T> = await response.json();
		return data.data;
	}

	async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "GET",
		});
	}

	async post<T>(
		endpoint: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async put<T>(
		endpoint: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async patch<T>(
		endpoint: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "DELETE",
		});
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
