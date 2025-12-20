"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
