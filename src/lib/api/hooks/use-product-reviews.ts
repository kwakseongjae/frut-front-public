"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { productsApi, productsQueryKeys } from "../products";

export const useProductReviews = (productId: number) => {
  return useInfiniteQuery({
    queryKey: productsQueryKeys.reviews(productId),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await productsApi.getProductReviews(productId, pageParam);
      return result;
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
    enabled: !!productId,
  });
};




