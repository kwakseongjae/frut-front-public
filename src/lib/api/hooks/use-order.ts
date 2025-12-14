"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type OrderCreateRequest,
  ordersApi,
  type VerifyPaymentRequest,
} from "../orders";
import { queryKeys } from "../query-keys";

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
    queryKey: queryKeys.orders.all,
    queryFn: () => ordersApi.getOrders(),
  });
};

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getOrderDetail(id),
    enabled: !!id,
  });
};
