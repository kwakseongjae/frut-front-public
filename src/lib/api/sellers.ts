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
};

export const sellersQueryKeys = {
  all: queryKeys.sellers.all,
  bestFarms: () => [...queryKeys.sellers.all, "best-farms"] as const,
  bestFarmsAll: (params?: BestFarmsAllParams) =>
    [...queryKeys.sellers.all, "best-farms-all", params] as const,
  followedFarms: () => [...queryKeys.sellers.all, "followed-farms"] as const,
};
