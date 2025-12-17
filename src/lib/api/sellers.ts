import { apiClient } from "./client";
import { queryKeys } from "./query-keys";

export interface BestFarm {
  farm_id: number;
  farm_name: string;
  farm_image: string | null;
  rank: number;
  is_following: boolean;
  sales_count: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BestFarmsAllResponse extends PaginatedResponse<BestFarm> {}

export interface BestFarmsAllParams {
  page_size?: number;
  page?: number;
}

export interface FollowFarmResponse {
  is_following: boolean;
  follower_count: number;
}

export interface FollowedFarm {
  id: number;
  farm_name: string;
  farm_image: string | null;
}

export interface FollowedFarmsResponse
  extends PaginatedResponse<FollowedFarm> {}

export interface FarmProfile {
  id: number;
  farm_name: string;
  farm_description: string;
  farm_image: string | null;
  farm_image_url: string;
  location: string;
  contact_phone: string;
  contact_email: string;
  follower_count: number;
  is_own_farm?: boolean;
  average_rating?: string;
  total_review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SellerProfile {
  id: number;
  farm_name: string;
  farm_description: string;
  farm_image: string | null;
  farm_image_url: string;
  location: string;
  contact_phone: string;
  contact_email: string;
  follower_count: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  average_rating?: string;
  total_review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GetFarmProfileParams {
  farm_id: number;
}

export interface FarmNewsImage {
  id: number;
  image_url: string;
}

export interface FarmNewsPath {
  id: number;
  path: string;
}

export interface FarmNews {
  id: number;
  farm_name: string;
  farm_image: string;
  title: string;
  content: string;
  images: FarmNewsImage[];
  paths?: FarmNewsPath[];
  created_at: string;
}

export interface GetFarmNewsParams {
  farm_id: number;
}

export const sellersApi = {
  getBestFarms: async (): Promise<BestFarm[]> => {
    const data = await apiClient.get<BestFarm[]>("/api/sellers/best-farms");
    return data;
  },
  getBestFarmsAll: async (
    params?: BestFarmsAllParams
  ): Promise<BestFarmsAllResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page_size) {
      searchParams.append("page_size", params.page_size.toString());
    }

    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/sellers/best-farms/all${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await apiClient.get<BestFarmsAllResponse>(endpoint);
    return data;
  },
  toggleFollowFarm: async (farmId: number): Promise<FollowFarmResponse> => {
    const data = await apiClient.post<FollowFarmResponse>(
      `/api/sellers/farms/${farmId}/follow`,
      {}
    );
    return data;
  },

  getFollowedFarms: async (): Promise<FollowedFarmsResponse> => {
    const data = await apiClient.get<FollowedFarmsResponse>(
      "/api/sellers/followed-farms"
    );
    return data;
  },

  getFarmProfile: async (
    params: GetFarmProfileParams
  ): Promise<FarmProfile> => {
    const searchParams = new URLSearchParams();
    searchParams.append("farm_id", params.farm_id.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/sellers/profile${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await apiClient.get<FarmProfile>(endpoint);
    return data;
  },

  getFarmNews: async (params: GetFarmNewsParams): Promise<FarmNews[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append("farm_id", params.farm_id.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/sellers/news${queryString ? `?${queryString}` : ""}`;

    const data = await apiClient.get<FarmNews[]>(endpoint);
    return data;
  },

  getMyProfile: async (): Promise<SellerProfile> => {
    const data = await apiClient.get<SellerProfile>("/api/sellers/profile");
    return data;
  },

  getMyFarmNews: async (): Promise<FarmNews[]> => {
    const data = await apiClient.get<FarmNews[]>("/api/sellers/news");
    return data;
  },

  updateProfile: async (
    request: UpdateProfileRequest
  ): Promise<SellerProfile> => {
    const data = await apiClient.patch<SellerProfile>(
      "/api/sellers/profile",
      request
    );
    return data;
  },

  createNews: async (request: CreateNewsRequest): Promise<FarmNews> => {
    const data = await apiClient.post<FarmNews>("/api/sellers/news", request);
    return data;
  },

  updateNews: async (
    newsId: number,
    request: CreateNewsRequest
  ): Promise<FarmNews> => {
    const data = await apiClient.patch<FarmNews>(
      `/api/sellers/news/${newsId}`,
      request
    );
    return data;
  },

  deleteNews: async (newsId: number): Promise<void> => {
    await apiClient.delete<void>(`/api/sellers/news/${newsId}`);
  },

  submitApplication: async (
    formData: FormData
  ): Promise<{ success: boolean; message?: string }> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/sellers/application`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
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
      const errorData = await response.json().catch(() => ({
        success: false,
        message: "요청 처리 중 오류가 발생했습니다.",
      }));
      throw new Error(errorData.message || "요청 처리 중 오류가 발생했습니다.");
    }

    const data = await response.json();
    return data;
  },

  getApplicationMe: async (): Promise<SellerApplication | null> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/sellers/application/me`;

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

      // 404 에러는 신청 내역이 없는 것으로 처리
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("신청 정보를 불러오는데 실패했습니다.");
      }

      const jsonData: SellerApplicationResponse = await response.json();

      if (jsonData.success && jsonData.data) {
        return jsonData.data;
      }

      return null;
    } catch (error) {
      // 네트워크 에러 등은 throw
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("신청 정보를 불러오는데 실패했습니다.");
    }
  },

  updateApplicationMe: async (
    request: UpdateApplicationRequest
  ): Promise<{ success: boolean; message?: string }> => {
    const data = await apiClient.patch<{ success: boolean; message?: string }>(
      "/api/sellers/application/me",
      request
    );
    return data;
  },
};

export interface UpdateProfileRequest {
  farm_name: string;
  location: string;
  farm_description: string;
  farm_image: string | null;
}

export interface UpdateApplicationRequest {
  business_name?: string;
  business_number?: string;
  representative_name?: string;
  business_address?: string;
  business_phone?: string;
  application_reason?: string;
  phone?: string;
  email?: string;
  farm_description?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  business_registration?: string;
  telecom_sales_report?: string;
  representative_id?: string;
  bank_account_copy?: string;
  farm_profile_photo?: string;
  gap_certificate?: string;
  organic_certificate?: string;
  haccp_certificate?: string;
  pesticide_test_report?: string;
}

export interface ApplicationFile {
  id: number;
  kinds: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  file_url: string;
  original_filename: string;
  rejected_reason: string | null;
}

export interface SellerApplication {
  application_id: number;
  business_name: string;
  business_number: string;
  representative_name: string;
  business_address: string;
  business_phone: string;
  application_reason: string;
  phone: string;
  email: string;
  farm_description: string;
  privacy_policy_agreed: boolean;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  status_display: string;
  applied_at: string;
  processed_at: string | null;
  files: ApplicationFile[];
}

export interface SellerApplicationResponse {
  success: boolean;
  data: SellerApplication;
  message: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  images: string[];
}

export const sellersQueryKeys = {
  all: queryKeys.sellers.all,
  bestFarms: () => [...queryKeys.sellers.all, "best-farms"] as const,
  bestFarmsAll: (params?: BestFarmsAllParams) =>
    [...queryKeys.sellers.all, "best-farms-all", params] as const,
  followedFarms: () => [...queryKeys.sellers.all, "followed-farms"] as const,
  farmProfile: (farmId: number) =>
    [...queryKeys.sellers.all, "profile", farmId] as const,
  farmNews: (farmId: number) =>
    [...queryKeys.sellers.all, "news", farmId] as const,
  myProfile: () => [...queryKeys.sellers.all, "my-profile"] as const,
  myFarmNews: () => [...queryKeys.sellers.all, "my-news"] as const,
  application: () => [...queryKeys.sellers.all, "application", "me"] as const,
};
