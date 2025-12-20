"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import type {
  CreateReviewReplyRequest,
  CreateReviewRequest,
  SellerReviewsParams,
} from "../reviews";
import { reviewsApi } from "../reviews";

export const useReviewableItems = () => {
  return useQuery({
    queryKey: queryKeys.reviews.reviewable(),
    queryFn: () => reviewsApi.getReviewableItems(),
  });
};

export const useInfiniteReviewableItems = () => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.reviews.reviewable(), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await reviewsApi.getReviewableItems(pageParam);
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

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReviewRequest) =>
      reviewsApi.createReview(request),
    onSuccess: () => {
      // 작성 가능한 리뷰 목록 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.reviewable(),
      });
      // 작성한 리뷰 목록 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.written(),
      });
    },
  });
};

export const useWrittenReviews = () => {
  return useQuery({
    queryKey: queryKeys.reviews.written(),
    queryFn: () => reviewsApi.getWrittenReviews(),
  });
};

export const useInfiniteWrittenReviews = () => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.reviews.written(), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await reviewsApi.getWrittenReviews(pageParam);
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

export const useSellerReviews = (
  params: SellerReviewsParams & { enabled?: boolean }
) => {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: queryKeys.reviews.seller(queryParams.farm_id),
    queryFn: () => reviewsApi.getSellerReviews(queryParams),
    enabled,
  });
};

export const useMySellerReviews = () => {
  return useQuery({
    queryKey: queryKeys.reviews.mySeller(),
    queryFn: () => reviewsApi.getMySellerReviews(),
  });
};

export const useCreateReviewReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      request,
    }: {
      reviewId: number;
      request: CreateReviewReplyRequest;
    }) => reviewsApi.createReviewReply(reviewId, request),
    onSuccess: () => {
      // 내 농장 리뷰 목록 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.mySeller(),
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      // 작성한 리뷰 목록 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.written(),
      });
    },
  });
};
