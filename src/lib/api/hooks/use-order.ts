"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	type OrderCreateRequest,
	ordersApi,
	type VerifyPaymentRequest,
} from "../orders";

export const useCreateOrder = () => {
	return useMutation({
		mutationFn: (request: OrderCreateRequest) => ordersApi.create(request),
	});
};

export const useVerifyPayment = () => {
	return useMutation({
		mutationFn: (request: VerifyPaymentRequest) =>
			ordersApi.verifyPayment(request),
	});
};

export const useOrders = () => {
	return useQuery({
		queryKey: ["orders"],
		queryFn: () => ordersApi.getOrders(),
	});
};
