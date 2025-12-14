"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { type GetBannerAdsParams, operationsApi } from "../operations";

export const useBannerAds = (params?: GetBannerAdsParams) => {
  return useQuery({
    queryKey: ["banner-ads", params],
    queryFn: () => operationsApi.getBannerAds(params),
  });
};

export const useIncrementBannerView = () => {
  return useMutation({
    mutationFn: (id: number) => operationsApi.incrementBannerView(id),
  });
};

export const useIncrementBannerClick = () => {
  return useMutation({
    mutationFn: (id: number) => operationsApi.incrementBannerClick(id),
  });
};

