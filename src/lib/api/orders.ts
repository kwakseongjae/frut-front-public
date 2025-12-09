import { apiClient } from "./client";

export interface OrderPreviewRequest {
	order_type: "cart" | "direct";
	cart_item_ids?: number[];
	items?: Array<{
		product_option_id: number;
		quantity: number;
	}>;
	user_coupon_id?: number | null;
	point_used?: number;
}

export interface OrderPreviewItem {
	product_name: string;
	quantity: number;
	unit_price: number;
	total_price: number;
}

export interface OrderPreviewResponse {
	success: boolean;
	data: {
		items: OrderPreviewItem[];
		item_count: number;
		total_amount: number;
		coupon_discount: number;
		point_discount: number;
		total_discount: number;
		final_amount: number;
		coupon_applied: boolean;
		coupon_name: string | null;
		point_balance: number;
		max_point_usable: number;
		is_valid: boolean;
		message: string | null;
	};
	message: string;
}

export interface OrderCreateRequest {
	order_type: "cart" | "direct";
	cart_item_ids?: number[];
	items?: Array<{
		product_option_id: number;
		quantity: number;
	}>;
	delivery_info: {
		recipient_name: string;
		recipient_phone: string;
		delivery_address: string;
		delivery_memo?: string;
	};
	payment_method:
		| "CARD"
		| "TRANS"
		| "VBANK"
		| "PHONE"
		| "KAKAOPAY"
		| "NAVERPAY"
		| "TOSSPAY"
		| "PAYCO";
	user_coupon_id?: number | null;
	point_used?: number;
}

export interface OrderCreateResponse {
	success: boolean;
	data: {
		payment: {
			id: number;
			imp_uid: string | null;
			merchant_uid: string;
			user: number;
			pay_method: string;
			pay_method_display: string;
			total_amount: number;
			discount_amount: number;
			coupon_discount_amount: number;
			point_used: number;
			amount: number;
			status: string;
			status_display: string;
			paid_at: string | null;
		};
		order_items: Array<{
			id: number;
			order_number: string;
			product_name: string;
			unit_price: number;
			quantity: number;
			total_price: number;
			item_status: string;
		}>;
		merchant_uid: string;
		total_order_count: number;
	};
	message: string;
}

export interface VerifyPaymentRequest {
	imp_uid: string;
	merchant_uid: string;
}

export interface VerifyPaymentResponse {
	success: boolean;
	data: {
		payment: {
			id: number;
			imp_uid: string;
			merchant_uid: string;
			status: string;
			status_display: string;
			paid_at: string;
		};
		order_items: Array<unknown>;
	};
	message: string;
}

export interface OrderListItem {
	id: number;
	order_number: string;
	product_name: string;
	quantity: number;
	total_price: number;
	item_status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
	item_status_display: string;
	payment_info: {
		id: number;
		imp_uid: string;
		merchant_uid: string;
		user: number;
		pay_method: string;
		pay_method_display: string;
		total_amount: number;
		discount_amount: number;
		coupon_discount_amount: number;
		point_used: number;
		amount: number;
		status: string;
		status_display: string;
		paid_at: string;
		created_at: string;
		updated_at: string;
	};
	ordered_at: string;
}

export interface OrderListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: OrderListItem[];
}

export const ordersApi = {
	preview: async (
		request: OrderPreviewRequest,
	): Promise<OrderPreviewResponse["data"]> => {
		const data = await apiClient.post<OrderPreviewResponse["data"]>(
			"/api/orders/preview",
			request,
		);
		return data;
	},
	create: async (
		request: OrderCreateRequest,
	): Promise<OrderCreateResponse["data"]> => {
		const data = await apiClient.post<OrderCreateResponse["data"]>(
			"/api/orders",
			request,
		);
		return data;
	},
	verifyPayment: async (
		request: VerifyPaymentRequest,
	): Promise<VerifyPaymentResponse["data"]> => {
		const data = await apiClient.post<VerifyPaymentResponse["data"]>(
			"/api/orders/verify-payment",
			request,
		);
		return data;
	},
	getOrders: async (): Promise<OrderListResponse> => {
		// API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
		const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
		const url = `${API_BASE_URL}/api/orders`;

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

		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		if (!response.ok) {
			throw new Error("주문 목록을 불러오는데 실패했습니다.");
		}

		const jsonData = await response.json();

		// 응답이 { success, data } 형식인지 확인
		if (jsonData.success && jsonData.data) {
			return jsonData.data as OrderListResponse;
		}

		// 직접 데이터 형식인 경우
		if (jsonData.count !== undefined && jsonData.results !== undefined) {
			return jsonData as OrderListResponse;
		}

		// 기본값 반환
		return {
			count: 0,
			next: null,
			previous: null,
			results: [],
		};
	},
};
