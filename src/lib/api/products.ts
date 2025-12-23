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
  rank?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  type?: ProductListType;
  q?: string; // 검색어 (type=search일 때 필수)
  category_id?: number; // 카테고리 ID로 필터링
  page?: number;
}

export interface SellerProductsParams {
  farm_id: number;
  page?: number;
}

export interface SellerManagementParams {
  q?: string;
  status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
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
  farm_id?: number;
  farm_name?: string;
  farm_image?: string;
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

export interface ProductReviewImage {
  review_id: number;
  image_url: string;
  user_name: string;
  rating: number;
  created_at: string;
}

export interface ProductReviewImagesResponse
  extends PaginatedResponse<ProductReviewImage> {}

export interface ProductImage {
  id: number;
  image_url: string;
  gcs_path: string;
  sort_order: number;
  is_main: boolean;
}

export interface ProductDetail {
  id: number;
  farm_id: number;
  farm_name: string;
  farm_image: string | null;
  category_id: number;
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
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
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
    const url = `${API_BASE_URL}/api/products${
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
      throw new Error("상품 목록을 불러오는데 실패했습니다.");
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
        return jsonData.data as ProductListResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as ProductListResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
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

  getSellerProducts: async (
    params: SellerProductsParams
  ): Promise<ProductListResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    searchParams.append("farm_id", params.farm_id.toString());
    if (params.page) {
      searchParams.append("page", params.page.toString());
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/products/seller/items${
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
      throw new Error("농장 상품 목록을 불러오는데 실패했습니다.");
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
        return jsonData.data as ProductListResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as ProductListResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },

  getMySellerItems: async (page?: number): Promise<ProductListResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/products/seller/items${
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
      throw new Error("내 상품 목록을 불러오는데 실패했습니다.");
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
        return jsonData.data as ProductListResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as ProductListResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },

  getSellerManagementProducts: async (
    params?: SellerManagementParams
  ): Promise<SellerManagementResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();

    if (params?.q) {
      searchParams.append("q", params.q);
    }

    if (params?.status) {
      searchParams.append("status", params.status);
    }

    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/products/seller/management${
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
      throw new Error("상품 관리 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      const responseData = jsonData.data;

      // products가 배열인 경우 (페이지네이션 없음)
      if (Array.isArray(responseData.products)) {
        return {
          statistics: responseData.statistics || {
            total_count: 0,
            active_count: 0,
            out_of_stock_count: 0,
          },
          products: {
            count: responseData.products.length,
            next: null,
            previous: null,
            results: responseData.products,
          },
        };
      }

      // products가 페이지네이션 형식인 경우
      if (
        responseData.products &&
        responseData.products.count !== undefined &&
        responseData.products.results !== undefined
      ) {
        return responseData as SellerManagementResponse;
      }
    }

    // 직접 형식인 경우
    if (jsonData.statistics && jsonData.products) {
      // products가 배열인 경우
      if (Array.isArray(jsonData.products)) {
        return {
          statistics: jsonData.statistics,
          products: {
            count: jsonData.products.length,
            next: null,
            previous: null,
            results: jsonData.products,
          },
        };
      }
      // products가 페이지네이션 형식인 경우
      return jsonData as SellerManagementResponse;
    }

    // 기본값 반환
    return {
      statistics: {
        total_count: 0,
        active_count: 0,
        out_of_stock_count: 0,
      },
      products: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
    };
  },

  updateProductStatus: async (
    productId: number,
    status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  ): Promise<Product> => {
    // multipart/form-data로 전송
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/products/${productId}`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const formData = new FormData();
    formData.append("status", status);

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("상품 상태 변경에 실패했습니다.");
    }

    const jsonData = await response.json();
    if (jsonData.success && jsonData.data) {
      return jsonData.data as Product;
    }
    throw new Error("상품 상태 변경에 실패했습니다.");
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await apiClient.delete(`/api/products/${productId}`);
  },

  createProduct: async (request: CreateProductRequest): Promise<Product> => {
    // multipart/form-data로 전송
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/products`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const formData = new FormData();
    formData.append("category_id", request.category_id.toString());
    formData.append("product_name", request.product_name);

    if (request.product_description) {
      formData.append("product_description", request.product_description);
    }
    if (request.detail_content) {
      formData.append("detail_content", request.detail_content);
    }
    if (request.producer_name) {
      formData.append("producer_name", request.producer_name);
    }
    if (request.producer_location) {
      formData.append("producer_location", request.producer_location);
    }
    if (request.production_date) {
      formData.append("production_date", request.production_date);
    }
    if (request.production_year !== undefined) {
      formData.append("production_year", request.production_year.toString());
    }
    if (request.expiry_type) {
      formData.append("expiry_type", request.expiry_type);
    }
    if (request.legal_notice) {
      formData.append("legal_notice", request.legal_notice);
    }
    if (request.product_composition) {
      formData.append("product_composition", request.product_composition);
    }
    if (request.handling_method) {
      formData.append("handling_method", request.handling_method);
    }
    if (request.customer_service_phone) {
      formData.append("customer_service_phone", request.customer_service_phone);
    }
    if (request.status) {
      formData.append("status", request.status);
    }

    // images 배열 추가
    request.images.forEach((imagePath) => {
      formData.append("images", imagePath);
    });

    // options가 있으면 JSON 문자열로 추가
    if (request.options && request.options.length > 0) {
      formData.append("options", JSON.stringify(request.options));
    }

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("상품 등록에 실패했습니다.");
    }

    const jsonData = await response.json();
    if (jsonData.success && jsonData.data) {
      return jsonData.data as Product;
    }
    throw new Error("상품 등록에 실패했습니다.");
  },

  updateProduct: async (
    productId: number,
    request: UpdateProductRequest
  ): Promise<Product> => {
    // multipart/form-data로 전송
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/products/${productId}`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const formData = new FormData();
    formData.append("category_id", request.category_id.toString());
    formData.append("product_name", request.product_name);

    if (request.product_description) {
      formData.append("product_description", request.product_description);
    }
    if (request.detail_content) {
      formData.append("detail_content", request.detail_content);
    }
    if (request.producer_name) {
      formData.append("producer_name", request.producer_name);
    }
    if (request.producer_location) {
      formData.append("producer_location", request.producer_location);
    }
    if (request.production_date) {
      formData.append("production_date", request.production_date);
    }
    if (request.production_year !== undefined) {
      formData.append("production_year", request.production_year.toString());
    }
    if (request.expiry_type) {
      formData.append("expiry_type", request.expiry_type);
    }
    if (request.legal_notice) {
      formData.append("legal_notice", request.legal_notice);
    }
    if (request.product_composition) {
      formData.append("product_composition", request.product_composition);
    }
    if (request.handling_method) {
      formData.append("handling_method", request.handling_method);
    }
    if (request.customer_service_phone) {
      formData.append("customer_service_phone", request.customer_service_phone);
    }
    if (request.status) {
      formData.append("status", request.status);
    }

    // images 배열 추가
    request.images.forEach((imagePath) => {
      formData.append("images", imagePath);
    });

    // options가 있으면 JSON 문자열로 추가
    if (request.options && request.options.length > 0) {
      formData.append("options", JSON.stringify(request.options));
    }

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("상품 수정에 실패했습니다.");
    }

    const jsonData = await response.json();
    if (jsonData.success && jsonData.data) {
      return jsonData.data as Product;
    }
    throw new Error("상품 수정에 실패했습니다.");
  },

  getProductReviewImages: async (
    productId: number
  ): Promise<ProductReviewImagesResponse> => {
    // API 응답이 직접 페이지네이션 형태일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/products/${productId}/reviews/images`;

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
        throw new Error("리뷰 이미지 목록을 불러오는데 실패했습니다.");
      }

      const jsonData = await response.json();

      // 응답이 { success, data } 형식인지 확인
      if (jsonData.success && jsonData.data) {
        // data가 페이지네이션 형식인지 확인
        if (
          jsonData.data.count !== undefined &&
          jsonData.data.results !== undefined
        ) {
          return jsonData.data as ProductReviewImagesResponse;
        }
        // data가 직접 페이지네이션 형식인 경우
        return jsonData.data as ProductReviewImagesResponse;
      }

      // 직접 페이지네이션 형식인 경우
      if (jsonData.count !== undefined && jsonData.results !== undefined) {
        return jsonData as ProductReviewImagesResponse;
      }

      // 기본값 반환
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    } catch (error) {
      console.error("리뷰 이미지 목록 조회 실패:", error);
      // 에러 발생 시 기본값 반환
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
  },

  getRecommendedSearchTerms: async (): Promise<RecommendedSearchTerm[]> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/products/search-terms/recommended`;

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
      throw new Error("추천 검색어를 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as RecommendedSearchTerm[];
    }

    // 직접 배열 형식인 경우
    if (Array.isArray(jsonData)) {
      return jsonData as RecommendedSearchTerm[];
    }

    // 기본값 반환
    return [];
  },
};

export interface SellerManagementStatistics {
  total_count: number;
  active_count: number;
  out_of_stock_count: number;
}

export interface SellerManagementProduct {
  id: number;
  product_name: string;
  category_name: string;
  display_cost_price: number;
  display_price: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  sold_count: number;
  main_image: string | null;
}

export interface SellerManagementResponse {
  statistics: SellerManagementStatistics;
  products: PaginatedResponse<SellerManagementProduct>;
}

export interface CreateProductOption {
  name: string;
  price: number;
  cost_price: number;
  discount_rate: number;
}

export interface CreateProductRequest {
  category_id: number;
  product_name: string;
  product_description?: string;
  detail_content?: string;
  producer_name?: string;
  producer_location?: string;
  production_date?: string; // YYYY-MM-DD
  production_year?: number;
  expiry_type?: string;
  legal_notice?: string;
  product_composition?: string;
  handling_method?: string;
  customer_service_phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  images: string[]; // GCS paths
  options?: CreateProductOption[];
}

export type UpdateProductRequest = CreateProductRequest;

export interface RecommendedSearchTerm {
  id: number;
  term: string;
  created_at: string;
  updated_at: string;
}

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
  reviewImages: (productId: number) =>
    [...queryKeys.products.all, "review-images", productId] as const,
  sellerProducts: (farmId: number) =>
    [...queryKeys.products.all, "seller-products", farmId] as const,
  mySellerItems: () => [...queryKeys.products.all, "my-seller-items"] as const,
  sellerManagement: (params?: SellerManagementParams) =>
    [
      ...queryKeys.products.all,
      "seller-management",
      params?.q,
      params?.status,
    ] as const,
  recommendedSearchTerms: () =>
    [...queryKeys.products.all, "recommended-search-terms"] as const,
};
