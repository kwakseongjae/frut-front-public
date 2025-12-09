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

export const couponsApi = {
	getApplicableCoupons: async (
		totalAmount: number,
	): Promise<ApplicableCouponsData> => {
		const data = await apiClient.get<ApplicableCouponsData>(
			`/api/benefits/user-coupons/applicable?total_amount=${totalAmount}`,
		);
		return data;
	},
};
