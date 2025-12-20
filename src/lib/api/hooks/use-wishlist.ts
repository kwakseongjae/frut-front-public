"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { productsQueryKeys } from "../products";
import { wishlistApi } from "../wishlist";

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      wishlistApi.addToWishlist({ product: productId }),
    onSuccess: () => {
      // 상품 목록 쿼리 무효화하여 is_wished 상태 업데이트
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists(),
      });
      // 찜목록 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
  });
};

export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
  });
};

export const useInfiniteWishlist = () => {
  return useInfiniteQuery({
    queryKey: ["wishlist", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await wishlistApi.getWishlist(pageParam);
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

export const useDeleteFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      wishlistApi.deleteFromWishlist(productId),
    onSuccess: () => {
      // 상품 목록 쿼리 무효화하여 is_wished 상태 업데이트
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists(),
      });
      // 찜목록 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
  });
};
