"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type BestFarmsAllParams,
  type GetFarmNewsParams,
  type GetFarmProfileParams,
  sellersApi,
  sellersQueryKeys,
} from "../sellers";

export const useBestFarms = () => {
  return useQuery({
    queryKey: sellersQueryKeys.bestFarms(),
    queryFn: () => sellersApi.getBestFarms(),
  });
};

export const useBestFarmsAll = (params?: BestFarmsAllParams) => {
  return useQuery({
    queryKey: sellersQueryKeys.bestFarmsAll(params),
    queryFn: () => sellersApi.getBestFarmsAll(params),
  });
};

export const useBestFarmsAllInfinite = (pageSize = 100) => {
  return useInfiniteQuery({
    queryKey: [...sellersQueryKeys.all, "best-farms-all-infinite", pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      return await sellersApi.getBestFarmsAll({
        page_size: pageSize,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.next) {
        return undefined;
      }

      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = new URL(lastPage.next, baseUrl);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch {
        return undefined;
      }
    },
    initialPageParam: 1,
  });
};

export const useToggleFollowFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (farmId: number) => sellersApi.toggleFollowFarm(farmId),
    onSuccess: (_, farmId) => {
      // 베스트 농장 목록 쿼리 무효화하여 팔로우 상태 업데이트
      // 모든 파라미터 조합에 대해 무효화하기 위해 prefix 사용
      queryClient.invalidateQueries({
        queryKey: sellersQueryKeys.bestFarms(),
      });
      queryClient.invalidateQueries({
        queryKey: [sellersQueryKeys.all[0], "best-farms-all"],
      });
      queryClient.invalidateQueries({
        queryKey: [sellersQueryKeys.all[0], "best-farms-all-infinite"],
      });
      // 팔로우한 농장 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: sellersQueryKeys.followedFarms(),
      });
      // 해당 농장 프로필도 무효화하여 팔로워 수 업데이트
      queryClient.invalidateQueries({
        queryKey: sellersQueryKeys.farmProfile(farmId),
      });
    },
  });
};

export const useFollowedFarms = () => {
  return useQuery({
    queryKey: sellersQueryKeys.followedFarms(),
    queryFn: () => sellersApi.getFollowedFarms(),
  });
};

export const useFarmProfile = (params: GetFarmProfileParams) => {
  return useQuery({
    queryKey: sellersQueryKeys.farmProfile(params.farm_id),
    queryFn: () => sellersApi.getFarmProfile(params),
  });
};

export const useFarmNews = (params: GetFarmNewsParams) => {
  return useQuery({
    queryKey: sellersQueryKeys.farmNews(params.farm_id),
    queryFn: () => sellersApi.getFarmNews(params),
  });
};

export const useMySellerProfile = () => {
  return useQuery({
    queryKey: sellersQueryKeys.myProfile(),
    queryFn: () => sellersApi.getMyProfile(),
  });
};

export const useMyFarmNews = () => {
  return useQuery({
    queryKey: sellersQueryKeys.myFarmNews(),
    queryFn: () => sellersApi.getMyFarmNews(),
  });
};
