import { apiClient } from "./client";

export interface ApplicableCoupon {
	user_coupon_id: number;
	coupon_id: number;
	coupon_name: string;
	coupon_type: "FIXED_AMOUNT" | "PERCENTAGE";
	coupon_type_display: string;
	discount_value: number;
	max_discount_amount: number;
	min_order_amount: number;
	description: string;
	end_date: string;
	calculated_discount: number;
	final_amount: number;
}

export interface ApplicableCouponsResponse {
	success: boolean;
	data: {
		count: number;
		applicable_coupons: ApplicableCoupon[];
	};
	message: string;
}

// apiClient.post는 이미 data.data를 반환하므로, 실제 반환 타입은 data 부분만
export interface ApplicableCouponsData {
	count: number;
	applicable_coupons: ApplicableCoupon[];
}

export interface UserCoupon {
	id: number;
	coupon_id: number;
	coupon_name: string;
	coupon_type: "FIXED_AMOUNT" | "PERCENTAGE";
	coupon_type_display: string;
	discount_value: number;
	max_discount_amount: number;
	min_order_amount: number;
	description: string;
	end_date: string;
	is_used: boolean;
	used_at: string | null;
	issued_at: string;
	is_expired: boolean;
	is_usable: boolean;
}

export interface UserCouponsResponse {
	available_count: number;
	used_count: number;
	available_coupons: UserCoupon[];
	unavailable_coupons: UserCoupon[];
}

export interface AvailableCoupon {
	id: number;
	coupon_name: string;
	coupon_type: "FIXED_AMOUNT" | "PERCENTAGE";
	coupon_type_display: string;
	discount_value: number;
	max_discount_amount: number;
	min_order_amount: number;
	description: string;
	start_date: string;
	end_date: string;
	is_downloaded: boolean;
}

export interface AvailableCouponsResponse {
	count: number;
	coupons: AvailableCoupon[];
}

export interface DownloadCouponResponse {
	id: number;
	coupon_id: number;
	coupon_name: string;
	coupon_type: "FIXED_AMOUNT" | "PERCENTAGE";
	coupon_type_display: string;
	discount_value: number;
	max_discount_amount: number;
	min_order_amount: number;
	description: string;
	end_date: string;
	is_used: boolean;
	used_at: string | null;
	issued_at: string;
	is_expired: boolean;
	is_usable: boolean;
}

export const couponsApi = {
	getApplicableCoupons: async (
		totalAmount: number,
	): Promise<ApplicableCouponsData> => {
		const data = await apiClient.get<ApplicableCouponsData>(
			`/api/benefits/user-coupons/applicable?total_amount=${totalAmount}`,
		);
		return data;
	},
	getUserCoupons: async (): Promise<UserCouponsResponse> => {
		const data = await apiClient.get<UserCouponsResponse>(
			"/api/benefits/user-coupons",
		);
		return data;
	},
	getAvailableCoupons: async (): Promise<AvailableCouponsResponse> => {
		const data = await apiClient.get<AvailableCouponsResponse>(
			"/api/benefits/user-coupons/available",
		);
		return data;
	},
	downloadCoupon: async (couponId: number): Promise<DownloadCouponResponse> => {
		const data = await apiClient.post<DownloadCouponResponse>(
			`/api/benefits/user-coupons/${couponId}/download`,
		);
		return data;
	},
};
