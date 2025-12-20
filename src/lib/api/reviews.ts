import { apiClient } from "./client";

export interface ReviewableItem {
  order_item_id: number;
  farm_name: string;
  product_name: string;
  option_name: string;
  product_id: number;
  product_image: string | null;
  ordered_at: string;
}

export interface ReviewableItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReviewableItem[];
}

export interface CreateReviewRequest {
  product: number;
  order_item: number;
  rating: number;
  review_content: string;
  review_image?: string | null;
}

export interface CreateReviewResponse {
  success: boolean;
  data: {
    id: number;
    product: number;
    order_item: number;
    rating: number;
    review_content: string;
    review_image: string | null;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

export interface ReviewReply {
  id: number;
  reply_content: string;
  created_at: string;
  farm_id?: number;
  farm_name: string;
  farm_image?: string;
}

export interface SellerReview {
  id: number;
  user_name: string;
  product_id: number;
  product_name: string;
  rating: number;
  review_content: string;
  image_url: string | null;
  created_at: string;
  reply: ReviewReply | null;
}

export interface SellerReviewsParams {
  farm_id: number;
}

export interface CreateReviewReplyRequest {
  reply_content: string;
}

export interface CreateReviewReplyResponse {
  success: boolean;
  data: ReviewReply;
  message: string;
}

export interface WrittenReview {
  id: number;
  user_name: string;
  product_name: string;
  farm_name?: string;
  option_name?: string;
  quantity?: number;
  rating: number;
  review_content: string;
  image_url: string | null;
  created_at: string;
  reply: ReviewReply | null;
}

export interface WrittenReviewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WrittenReview[];
}

export const reviewsApi = {
  getReviewableItems: async (): Promise<ReviewableItemsResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/reviews/reviewable`;

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
      throw new Error("작성 가능한 상품 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as ReviewableItemsResponse;
    }

    // 직접 데이터 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as ReviewableItemsResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },

  createReview: async (
    request: CreateReviewRequest
  ): Promise<CreateReviewResponse["data"]> => {
    const data = await apiClient.post<CreateReviewResponse["data"]>(
      "/api/reviews",
      request
    );
    return data;
  },

  getWrittenReviews: async (): Promise<WrittenReviewsResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/reviews`;

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
      throw new Error("작성한 상품후기 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as WrittenReviewsResponse;
    }

    // 직접 데이터 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as WrittenReviewsResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },

  getSellerReviews: async (
    params: SellerReviewsParams
  ): Promise<SellerReview[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append("farm_id", params.farm_id.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/reviews/seller${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await apiClient.get<SellerReview[]>(endpoint);
    return data;
  },

  getMySellerReviews: async (): Promise<SellerReview[]> => {
    const data = await apiClient.get<SellerReview[]>("/api/reviews/seller");
    return data;
  },

  createReviewReply: async (
    reviewId: number,
    request: CreateReviewReplyRequest
  ): Promise<CreateReviewReplyResponse["data"]> => {
    const data = await apiClient.post<CreateReviewReplyResponse["data"]>(
      `/api/reviews/${reviewId}/reply`,
      request
    );
    return data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  },
};
