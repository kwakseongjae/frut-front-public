"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi, productsQueryKeys } from "../products";

export const useProductDetail = (id: number) => {
	return useQuery({
		queryKey: productsQueryKeys.detail(id),
		queryFn: () => productsApi.getProductDetail(id),
		enabled: !!id,
	});
};
