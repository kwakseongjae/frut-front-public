"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type AddToCartRequest,
	cartApi,
	type UpdateCartItemRequest,
} from "../cart";
import { queryKeys } from "../query-keys";

export const useCart = () => {
	return useQuery({
		queryKey: queryKeys.cart.all,
		queryFn: () => cartApi.getCart(),
	});
};

export const useAddToCart = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: AddToCartRequest) => cartApi.addToCart(request),
		onSuccess: () => {
			// 장바구니 관련 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: queryKeys.cart.all,
			});
		},
	});
};

export const useDeleteCartItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => cartApi.deleteCartItem(id),
		onSuccess: () => {
			// 장바구니 관련 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: queryKeys.cart.all,
			});
		},
	});
};

export const useUpdateCartItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			request,
		}: {
			id: number;
			request: UpdateCartItemRequest;
		}) => cartApi.updateCartItem(id, request),
		onSuccess: () => {
			// 장바구니 관련 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: queryKeys.cart.all,
			});
		},
	});
};



















