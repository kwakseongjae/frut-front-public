import { apiClient } from "./client";
import type { ProductBadge } from "./products";

export interface AddWishlistRequest {
	product: number;
}

export interface WishlistItem {
	id: number;
	product_id: number;
	product_name: string;
	image_url: string | null;
	cost_price: number;
	price: number;
	discount_rate: number;
	farm_id: number;
	farm_name: string;
	farm_image: string | null;
	rating_avg: string;
	review_count: number;
	badges: ProductBadge[];
	created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface WishlistResponse extends PaginatedResponse<WishlistItem> {}

export interface AddWishlistResponse {
	id: number;
	product_id: number;
	product_name: string;
	image_url: string | null;
	cost_price: number;
	price: number;
	discount_rate: number;
	farm_name: string;
	rating_avg: string;
	review_count: number;
	badges: ProductBadge[];
	created_at: string;
}

export const wishlistApi = {
	addToWishlist: async (
    request: AddWishlistRequest
	): Promise<AddWishlistResponse> => {
		try {
			const data = await apiClient.post<AddWishlistResponse>(
				"/api/shopping/wishlist",
        request
			);
			return data;
		} catch (error) {
			// 400 에러 (이미 찜한 상품) 처리
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("찜하기 추가에 실패했습니다.");
		}
	},
  getWishlist: async (page?: number): Promise<WishlistResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/shopping/wishlist${
      queryString ? `?${queryString}` : ""
    }`;

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
      throw new Error("찜목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      // data가 배열인 경우 (페이지네이션 없음)
      if (Array.isArray(jsonData.data)) {
        return {
          count: jsonData.data.length,
          next: null,
          previous: null,
          results: jsonData.data,
        };
      }
      // data가 페이지네이션 형식인 경우
      if (
        jsonData.data.count !== undefined &&
        jsonData.data.results !== undefined
      ) {
        return jsonData.data as WishlistResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as WishlistResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
	},
	deleteFromWishlist: async (productId: number): Promise<void> => {
		await apiClient.delete(`/api/shopping/wishlist/${productId}?by=product`);
	},
};
