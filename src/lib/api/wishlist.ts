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
  getWishlist: async (): Promise<WishlistItem[]> => {
    const data = await apiClient.get<WishlistItem[]>("/api/shopping/wishlist");
    return data;
  },
  deleteFromWishlist: async (productId: number): Promise<void> => {
    await apiClient.delete(`/api/shopping/wishlist/${productId}?by=product`);
  },
};
