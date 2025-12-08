import { apiClient } from "./client";
import { queryKeys } from "./query-keys";

export type ProductListType =
  | "special"
  | "weekly_best"
  | "popular"
  | "recommended"
  | "search"
  | undefined;

export interface Product {
  id: number;
  farm_name: string;
  farm_profile_image: string | null;
  category_name: string;
  product_name: string;
  display_price: number;
  display_cost_price: number;
  display_discount_rate: number;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
  is_recommended: boolean;
  badges: string[];
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
  page?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductListResponse extends PaginatedResponse<Product> {}

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

    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

    const data = await apiClient.get<ProductListResponse>(endpoint);
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
};
