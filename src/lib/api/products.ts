import { apiClient } from "./client";
import { queryKeys } from "./query-keys";

export type ProductListType =
  | "special"
  | "weekly_best"
  | "popular"
  | "recommended"
  | "search"
  | undefined;

export interface ProductBadge {
  name: string;
  image_url: string;
}

export interface Product {
  id: number;
  farm_id?: number;
  farm_name: string;
  farm_profile_image: string | null;
  category_name: string;
  product_name: string;
  display_price: number;
  display_cost_price: number;
  display_discount_rate: number;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
  is_recommended: boolean;
  is_special?: boolean;
  badges: ProductBadge[];
  rating_avg: string;
  review_count: number;
  view_count: number;
  days_remaining: number | null;
  main_image: string | null;
  is_wished: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  type?: ProductListType;
  q?: string; // 검색어 (type=search일 때 필수)
  category_id?: number; // 카테고리 ID로 필터링
  page?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductListResponse extends PaginatedResponse<Product> {}

export interface ProductOption {
  id: number;
  name: string;
  price: number;
  cost_price: number;
  discount_rate: number;
}

export interface ReviewReply {
  id: number;
  reply_content: string;
  created_at: string;
}

export interface ProductReview {
  id: number;
  user_name: string;
  product_name: string;
  rating: number;
  review_content: string;
  image_url: string | null;
  created_at: string;
  reply: ReviewReply | null;
}

export interface ProductReviewsResponse
  extends PaginatedResponse<ProductReview> {}

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
  is_main: boolean;
}

export interface ProductDetail {
  id: number;
  farm_id: number;
  farm_name: string;
  farm_image: string | null;
  category_name: string;
  product_name: string;
  product_description: string;
  detail_content: string | null;
  display_cost_price: number;
  display_price: number;
  display_discount_rate: number;
  producer_name: string | null;
  producer_location: string | null;
  production_date: string | null;
  production_year: number | null;
  expiry_type: string | null;
  legal_notice: string | null;
  product_composition: string | null;
  handling_method: string | null;
  customer_service_phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
  is_special: boolean;
  rating_avg: string;
  review_count: number;
  view_count: number;
  days_remaining: number | null;
  delivery_fee: number;
  images: ProductImage[];
  options: ProductOption[];
  is_wished: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  category_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  category_name: string;
  sort_order: number;
  is_active: boolean;
  subcategory_count: number;
  subcategories: Subcategory[];
  created_at: string;
  updated_at: string;
}

export const productsApi = {
  getProducts: async (
    params?: ProductListParams
  ): Promise<ProductListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.type) {
      searchParams.append("type", params.type);
    }

    if (params?.q) {
      searchParams.append("q", params.q);
    }

    if (params?.category_id) {
      searchParams.append("category_id", params.category_id.toString());
    }

    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

    const data = await apiClient.get<ProductListResponse>(endpoint);
    return data;
  },

  getProductDetail: async (id: number): Promise<ProductDetail> => {
    const data = await apiClient.get<ProductDetail>(`/api/products/${id}`);
    return data;
  },

  getProductReviews: async (
    productId: number,
    page?: number
  ): Promise<ProductReviewsResponse> => {
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const endpoint = `/api/products/${productId}/reviews${
      queryString ? `?${queryString}` : ""
    }`;

    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}${endpoint}`;

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
      throw new Error("리뷰 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as ProductReviewsResponse;
    }

    // 직접 데이터 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as ProductReviewsResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },

  getCategories: async (isActive?: boolean): Promise<Category[]> => {
    const searchParams = new URLSearchParams();
    if (isActive !== undefined) {
      searchParams.append("is_active", isActive.toString());
    }
    const queryString = searchParams.toString();
    const endpoint = `/api/products/categories${
      queryString ? `?${queryString}` : ""
    }`;
    const data = await apiClient.get<Category[]>(endpoint);
    return data;
  },
};

export const productsQueryKeys = {
  all: queryKeys.products.all,
  lists: () => [...queryKeys.products.all, "list"] as const,
  list: (params?: ProductListParams) =>
    [...productsQueryKeys.lists(), params] as const,
  details: () => [...queryKeys.products.all, "detail"] as const,
  detail: (id: number) => [...productsQueryKeys.details(), id] as const,
  categories: (isActive?: boolean) =>
    [...queryKeys.products.all, "categories", isActive] as const,
  reviews: (productId: number, page?: number) =>
    [...queryKeys.products.all, "reviews", productId, page] as const,
};
