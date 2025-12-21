import { apiClient } from "./client";
import type { PaginatedResponse } from "./products";

export interface OrderPreviewRequest {
  order_type: "cart" | "direct";
  cart_item_ids?: number[];
  items?: Array<{
    product_option_id: number;
    quantity: number;
  }>;
  user_coupon_id?: number | null;
  point_used?: number;
}

export interface OrderPreviewItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderPreviewResponse {
  success: boolean;
  data: {
    items: OrderPreviewItem[];
    item_count: number;
    total_amount: number;
    coupon_discount: number;
    point_discount: number;
    total_discount: number;
    final_amount: number;
    coupon_applied: boolean;
    coupon_name: string | null;
    point_balance: number;
    max_point_usable: number;
    is_valid: boolean;
    message: string | null;
  };
  message: string;
}

export interface OrderCreateRequest {
  order_type: "cart" | "direct";
  cart_item_ids?: number[];
  items?: Array<{
    product_option_id: number;
    quantity: number;
  }>;
  delivery_info: {
    recipient_name: string;
    recipient_phone: string;
    delivery_address: string;
    delivery_memo?: string;
  };
  payment_method:
    | "CARD"
    | "TRANS"
    | "VBANK"
    | "PHONE"
    | "KAKAOPAY"
    | "NAVERPAY"
    | "TOSSPAY"
    | "PAYCO";
  user_coupon_id?: number | null;
  point_used?: number;
}

export interface OrderCreateResponse {
  success: boolean;
  data: {
    payment: {
      id: number;
      imp_uid: string | null;
      merchant_uid: string;
      user: number;
      pay_method: string;
      pay_method_display: string;
      total_amount: number;
      discount_amount: number;
      coupon_discount_amount: number;
      point_used: number;
      amount: number;
      status: string;
      status_display: string;
      paid_at: string | null;
    };
    order_items: Array<{
      id: number;
      order_number: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      total_price: number;
      item_status: string;
    }>;
    merchant_uid: string;
    total_order_count: number;
  };
  message: string;
}

export interface VerifyPaymentRequest {
  imp_uid: string;
  merchant_uid: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    payment: {
      id: number;
      imp_uid: string;
      merchant_uid: string;
      status: string;
      status_display: string;
      paid_at: string;
    };
    order_items: Array<unknown>;
  };
  message: string;
}

export interface OrderListItem {
  id: number;
  order_number: string;
  product_name: string;
  farm_name: string;
  product_main_image: string | null;
  option_name?: string;
  quantity: number;
  total_price: number;
  delivery_fee: number;
  point_used: number;
  coupon_discount_amount: number;
  paid_amount: number;
  item_status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  item_status_display: string;
  ordered_at: string;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderListItem[];
}

export interface OrderHistoryItem {
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED";
  status_display: string;
  timestamp: string;
}

export interface OrderDetailResponse {
  success: boolean;
  data: {
    id: number;
    order_number: string;
    user: number;
    seller: number;
    seller_name: string;
    farm_name: string;
    product_option: number;
    product_name: string;
    product_main_image: string | null;
    unit_price: number;
    quantity: number;
    total_price: number;
    recipient_name: string;
    recipient_phone: string;
    delivery_address: string;
    item_status: string;
    item_status_display: string;
    ordered_at: string;
    confirmed_at: string | null;
    pay_method: string;
    pay_method_display: string;
    delivery_fee: number;
    point_used: number;
    coupon_discount_amount: number;
    paid_amount: number;
    delivery_info: {
      id: number;
      order_item: number;
      order_number: string;
      delivery_company: string | null;
      tracking_number: string | null;
      delivery_status: string;
      delivery_status_display: string;
      shipped_at: string | null;
      delivered_at: string | null;
      delivery_fee: number;
      delivery_memo: string | null;
      created_at: string;
      updated_at: string;
    } | null;
    order_history: OrderHistoryItem[];
    created_at: string;
    updated_at: string;
  };
  message: string;
}

export interface RefundableItem {
  order_item_id: number;
  order_number: string;
  product_name: string;
  product_main_image: string;
  quantity: number;
  total_price: number;
  point_used: number;
  coupon_discount_amount: number;
  paid_amount: number;
  delivered_at: string;
  refund_deadline: string;
  can_refund: boolean;
  can_redeliver: boolean;
  payment_id: number;
}

export interface RefundableItemsResponse {
  success: boolean;
  data: RefundableItem[];
  message: string;
}

export interface RefundableItemsPaginatedResponse
  extends PaginatedResponse<RefundableItem> {}

export const ordersApi = {
  preview: async (
    request: OrderPreviewRequest
  ): Promise<OrderPreviewResponse["data"]> => {
    const data = await apiClient.post<OrderPreviewResponse["data"]>(
      "/api/orders/preview",
      request
    );
    return data;
  },
  create: async (
    request: OrderCreateRequest
  ): Promise<OrderCreateResponse["data"]> => {
    const data = await apiClient.post<OrderCreateResponse["data"]>(
      "/api/orders",
      request
    );
    return data;
  },
  verifyPayment: async (
    request: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse["data"]> => {
    const data = await apiClient.post<VerifyPaymentResponse["data"]>(
      "/api/orders/verify-payment",
      request
    );
    return data;
  },
  getOrders: async (page?: number): Promise<OrderListResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/orders${
      queryString ? `?${queryString}` : ""
    }`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("주문 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as OrderListResponse;
    }

    // 직접 데이터 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as OrderListResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },
  getOrderDetail: async (id: number): Promise<OrderDetailResponse["data"]> => {
    const data = await apiClient.get<OrderDetailResponse["data"]>(
      `/api/orders/${id}`
    );
    return data;
  },
  cancelOrder: async (
    id: number,
    request: {
      cancel_reason:
        | "CHANGE_OF_MIND"
        | "WRONG_ADDRESS"
        | "REORDER_WITH_OTHER"
        | "WRONG_OPTION"
        | "OTHER";
      cancel_reason_detail?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    const data = await apiClient.post<{ success: boolean; message: string }>(
      `/api/orders/${id}/cancel`,
      request
    );
    return data;
  },
  getRefundableItems: async (
    page?: number
  ): Promise<RefundableItemsPaginatedResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/orders/refundable-items${
      queryString ? `?${queryString}` : ""
    }`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("환불 가능한 상품 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      // data가 배열인 경우 (페이지네이션 없음)
      if (Array.isArray(jsonData.data)) {
        return {
          count: jsonData.data.length,
          next: null,
          previous: null,
          results: jsonData.data,
        };
      }
      // data가 페이지네이션 형식인 경우
      if (
        jsonData.data.count !== undefined &&
        jsonData.data.results !== undefined
      ) {
        return jsonData.data as RefundableItemsPaginatedResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as RefundableItemsPaginatedResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },
  getRefundableItemDetail: async (
    orderItemId: number
  ): Promise<RefundableItemDetail> => {
    const data = await apiClient.get<RefundableItemDetail>(
      `/api/orders/refundable-items/${orderItemId}`
    );
    return data;
  },
  getSellerOrders: async (page?: number): Promise<SellerOrderListResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/orders/seller/orders${
      queryString ? `?${queryString}` : ""
    }`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("판매자 주문 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      // data가 배열인 경우 (페이지네이션 없음)
      if (Array.isArray(jsonData.data)) {
        return {
          count: jsonData.data.length,
          next: null,
          previous: null,
          results: jsonData.data,
        };
      }
      // data가 페이지네이션 형식인 경우
      if (
        jsonData.data.count !== undefined &&
        jsonData.data.results !== undefined
      ) {
        return jsonData.data as SellerOrderListResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as SellerOrderListResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },
  getSellerOrderDetail: async (id: number): Promise<SellerOrderDetail> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/orders/seller/orders/${id}`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("판매자 주문 상세 정보를 불러오는데 실패했습니다.");
    }

    const jsonData: SellerOrderDetailResponse = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data;
    }

    throw new Error("판매자 주문 상세 정보를 불러오는데 실패했습니다.");
  },
  createRefund: async (
    request: RefundRequest
  ): Promise<{ success: boolean; message: string }> => {
    const data = await apiClient.post<{ success: boolean; message: string }>(
      "/api/orders/refunds",
      request
    );
    return data;
  },
  createRedelivery: async (
    request: RedeliveryRequest
  ): Promise<{ success: boolean; message: string }> => {
    const data = await apiClient.post<{ success: boolean; message: string }>(
      "/api/orders/redeliveries",
      request
    );
    return data;
  },
  updateSellerOrderStatus: async (
    id: number,
    request: {
      item_status: "CONFIRMED" | "SHIPPED" | "DELIVERED";
      delivery_company?: string;
      tracking_number?: string;
      delivery_memo?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/orders/seller/orders/${id}`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("주문 상태 변경에 실패했습니다.");
    }

    const jsonData: { success: boolean; message: string } =
      await response.json();
    return jsonData;
  },
  getClaimHistory: async (): Promise<ClaimHistoryItem[]> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/orders/claim-history`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("클레임 이력을 불러오는데 실패했습니다.");
    }

    const jsonData: ClaimHistoryResponse = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data;
    }

    // 직접 배열 형식인 경우
    if (Array.isArray(jsonData)) {
      return jsonData;
    }

    return [];
  },
  getCancelDetail: async (
    orderItemId: number
  ): Promise<CancelDetailResponse["data"]> => {
    const data = await apiClient.get<CancelDetailResponse["data"]>(
      `/api/orders/cancel/${orderItemId}`
    );
    return data;
  },
};

export interface RefundableItemDetail {
  id: number;
  order_number: string;
  product_name: string;
  farm_name: string;
  product_main_image: string;
  quantity: number;
  total_price: number;
  delivery_fee: number;
  point_used: number;
  coupon_discount_amount: number;
  paid_amount: number;
  pay_method: string;
  pay_method_display: string;
  item_status: string;
  item_status_display: string;
  ordered_at: string;
  payment_id: number;
}

export type RefundReasonType =
  | "PRODUCT_DEFECT"
  | "WRONG_PRODUCT"
  | "FRESHNESS_ISSUE"
  | "OTHER";

export interface ClaimHistoryItem {
  order_item_id: number;
  order_number: string;
  product_name: string;
  product_main_image: string | null;
  quantity: number;
  total_price: number;
  point_used: number;
  coupon_discount_amount: number;
  paid_amount: number;
  delivered_at: string | null;
  refund_deadline: string | null;
  can_refund: boolean;
  can_redeliver: boolean;
  payment_id: number;
  refund_id: number | null;
  redelivery_id: number | null;
  status: "CANCELLED" | "REFUND" | "REDELIVERY";
  cancelled_at: string | null;
  farm_name: string;
  option_name: string;
}

export interface ClaimHistoryResponse {
  success: boolean;
  data: ClaimHistoryItem[];
  message: string;
}

export interface CancelDetail {
  id: number;
  order_number: string;
  pay_method: string;
  pay_method_display: string;
  farm_name: string;
  product_name: string;
  option_name: string;
  quantity: number;
  product_main_image: string | null;
  total_price: number;
  point_used: number;
  coupon_discount_amount: number;
  delivery_fee: number;
  paid_amount: number;
  refund_amount: number;
  cancel_reason: string;
  cancel_reason_display: string;
  cancel_reason_detail: string | null;
  cancelled_at: string;
  cancel_receipt_url: string | null;
}

export interface CancelDetailResponse {
  success: boolean;
  data: CancelDetail;
  message: string;
}

export interface RefundRequest {
  payment_id: number;
  reason_type: RefundReasonType;
  reason_detail?: string;
  refund_images?: string[];
  refund_amount: number;
  refund_holder: string;
  refund_bank: string;
  refund_account: string;
}

export interface RedeliveryRequest {
  order_item_id: number;
  reason_type: RefundReasonType;
  reason_detail?: string;
  redelivery_images?: string[];
}

export interface SellerOrderItem {
  id: number;
  order_number: string;
  buyer_name: string;
  product_name: string;
  option_name: string;
  product_main_image: string | null;
  quantity: number;
  total_price: number;
  coupon_discount_amount: number;
  point_used: number;
  paid_amount: number;
  pay_method: string;
  pay_method_display: string;
  delivery_company: string | null;
  tracking_number: string | null;
  item_status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  item_status_display: string;
  recipient_name: string;
  delivery_address: string;
  ordered_at: string;
  confirmed_at: string | null;
}

export interface SellerOrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SellerOrderItem[];
}

export interface SellerOrderDetail {
  id: number;
  order_number: string;
  buyer_name: string;
  product_option: number;
  product_name: string;
  option_name: string;
  product_main_image: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  item_status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  item_status_display: string;
  ordered_at: string;
  confirmed_at: string | null;
  payment_info: {
    id: number;
    imp_uid: string;
    merchant_uid: string;
    pay_method: string;
    pay_method_display: string;
    total_amount: number;
    amount: number;
    delivery_fee: number;
    point_used: number;
    coupon_discount_amount: number;
    status: string;
    status_display: string;
    paid_at: string;
  };
  delivery_info: {
    id: number;
    order_item: number;
    order_number: string;
    delivery_company: string | null;
    tracking_number: string | null;
    delivery_status: string;
    delivery_status_display: string;
    shipped_at: string | null;
    delivered_at: string | null;
    delivery_fee: number;
    delivery_memo: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  order_history: OrderHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface SellerOrderDetailResponse {
  success: boolean;
  data: SellerOrderDetail;
  message: string;
}
