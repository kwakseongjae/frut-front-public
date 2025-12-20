"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type OrderCreateRequest,
  ordersApi,
  type RedeliveryRequest,
  type RefundableItem,
  type RefundableItemDetail,
  type RefundRequest,
  type SellerOrderDetail,
  type SellerOrderListResponse,
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

export const useInfiniteOrders = () => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.orders.all, "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await ordersApi.getOrders(pageParam);
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

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getOrderDetail(id),
    enabled: !!id,
  });
};

export const useCancelOrder = () => {
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: {
        cancel_reason:
          | "CHANGE_OF_MIND"
          | "WRONG_ADDRESS"
          | "REORDER_WITH_OTHER"
          | "WRONG_OPTION"
          | "OTHER";
        cancel_reason_detail?: string;
      };
    }) => ordersApi.cancelOrder(id, request),
  });
};

export const useRefundableItems = () => {
  return useQuery({
    queryKey: [...queryKeys.orders.all, "refundable-items"],
    queryFn: () => ordersApi.getRefundableItems(),
  });
};

export const useInfiniteRefundableItems = () => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.orders.all, "refundable-items", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await ordersApi.getRefundableItems(pageParam);
      return response;
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

export const useRefundableItemDetail = (orderItemId: number) => {
  return useQuery<RefundableItemDetail>({
    queryKey: [...queryKeys.orders.all, "refundable-items", orderItemId],
    queryFn: () => ordersApi.getRefundableItemDetail(orderItemId),
    enabled: !!orderItemId,
  });
};

export const useSellerOrders = () => {
  return useQuery<SellerOrderListResponse>({
    queryKey: [...queryKeys.orders.all, "seller"],
    queryFn: () => ordersApi.getSellerOrders(),
  });
};

export const useInfiniteSellerOrders = () => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.orders.all, "seller", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await ordersApi.getSellerOrders(pageParam);
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

export const useCreateRefund = () => {
  return useMutation({
    mutationFn: (request: RefundRequest) => ordersApi.createRefund(request),
  });
};

export const useCreateRedelivery = () => {
  return useMutation({
    mutationFn: (request: RedeliveryRequest) =>
      ordersApi.createRedelivery(request),
  });
};

export const useSellerOrderDetail = (id: number) => {
  return useQuery<SellerOrderDetail>({
    queryKey: [...queryKeys.orders.all, "seller", "detail", id],
    queryFn: () => ordersApi.getSellerOrderDetail(id),
    enabled: !!id,
  });
};

export const useUpdateSellerOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: {
        item_status: "CONFIRMED" | "SHIPPED" | "DELIVERED";
        delivery_company?: string;
        tracking_number?: string;
        delivery_memo?: string;
      };
    }) => ordersApi.updateSellerOrderStatus(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.orders.all, "seller", "detail", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.orders.all, "seller"],
      });
    },
  });
};
