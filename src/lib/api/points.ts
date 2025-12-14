import { apiClient } from "./client";
import type { PaginatedResponse } from "./products";

export interface PointsBalanceResponse {
	balance: number;
}

export type PointType =
	| "EARN"
	| "USE"
	| "CANCEL_EARN"
	| "CANCEL_USE"
	| "EXPIRE"
	| "ADMIN";

export type EarnReason =
	| "PURCHASE"
	| "REVIEW_TEXT"
	| "REVIEW_PHOTO"
	| "ADMIN_GRANT"
	| "REFUND_RESTORE";

export interface PointHistory {
	id: number;
	point_type: PointType;
	point_type_display: string;
	point_amount: number;
	balance_after: number;
	reason: string;
	earn_reason: EarnReason | null;
	earn_reason_display: string | null;
	expires_at: string | null;
	expired: boolean;
	created_at: string;
}

export interface PointsHistoryResponse
	extends PaginatedResponse<PointHistory> {}

export const pointsApi = {
	getBalance: async (): Promise<PointsBalanceResponse> => {
		const data = await apiClient.get<PointsBalanceResponse>(
			"/api/benefits/points/balance",
		);
		return data;
	},
	getHistory: async (): Promise<PointsHistoryResponse> => {
		// API 응답이 직접 페이지네이션 형태일 수 있으므로 직접 처리
		const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
		const url = `${API_BASE_URL}/api/benefits/points`;

		let accessToken: string | null = null;
		if (typeof window !== "undefined") {
			accessToken = localStorage.getItem("accessToken");
		}

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, {
				method: "GET",
				headers,
			});

			if (!response.ok) {
				throw new Error("포인트 이력을 불러오는데 실패했습니다.");
			}

			const jsonData = await response.json();

			// 응답이 { success, data } 형식인지 확인
			if (jsonData.success && jsonData.data) {
				return jsonData.data as PointsHistoryResponse;
			}

			// 직접 페이지네이션 형식인 경우
			if (jsonData.count !== undefined && jsonData.results !== undefined) {
				return jsonData as PointsHistoryResponse;
			}

			// 기본값 반환
			return {
				count: 0,
				next: null,
				previous: null,
				results: [],
			};
		} catch (error) {
			console.error("포인트 이력 조회 실패:", error);
			// 에러 발생 시 기본값 반환
			return {
				count: 0,
				next: null,
				previous: null,
				results: [],
			};
		}
	},
};
