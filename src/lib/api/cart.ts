import { apiClient } from "./client";

export interface CartItemRequest {
	product_option_id: number;
	quantity: number;
}

export interface AddToCartRequest {
	items: CartItemRequest[];
}

export interface AddToCartResponse {
	success: boolean;
	message?: string;
}

export interface CartItem {
	id: number;
	product_option_id: number;
	product_id: number;
	product_name: string;
	option_name: string;
	image_url: string;
	cost_price: number;
	price: number;
	farm_name: string;
	quantity: number;
}

export interface UpdateCartItemRequest {
	product_option_id: number;
	quantity: number;
}

export interface CartResponse {
	items: CartItem[];
	total_price: number;
}

export const cartApi = {
	addToCart: async (request: AddToCartRequest): Promise<AddToCartResponse> => {
		const data = await apiClient.post<AddToCartResponse>(
			"/api/shopping/cart",
			request,
		);
		return data;
	},

	getCart: async (): Promise<CartResponse> => {
		const data = await apiClient.get<CartResponse>("/api/shopping/cart");
		return data;
	},

	deleteCartItem: async (id: number): Promise<void> => {
		await apiClient.delete<void>(`/api/shopping/cart/${id}`);
	},

	updateCartItem: async (
		id: number,
		request: UpdateCartItemRequest,
	): Promise<void> => {
		await apiClient.patch<void>(`/api/shopping/cart/${id}`, request);
	},
};





















