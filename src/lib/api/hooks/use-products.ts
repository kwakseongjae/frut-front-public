"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ProductListParams,
  productsApi,
  productsQueryKeys,
} from "../products";

export const useProducts = (params?: ProductListParams) => {
  return useQuery({
    queryKey: productsQueryKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
  });
};
