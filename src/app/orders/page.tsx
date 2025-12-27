"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { fruits } from "@/assets/images/dummy";
import OrderItem from "@/components/OrderItem";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useClaimHistory, useInfiniteOrders } from "@/lib/api/hooks/use-order";

type OrderStatus = "주문접수" | "주문확인" | "배송중" | "배송완료" | "취소완료";

interface OrderItemData {
  id: number;
  name: string;
  image: string;
  optionName: string | null;
  quantity: number;
  price: number;
  farmName: string;
}

interface Order {
  id: number;
  date: string;
  status: OrderStatus;
  originalStatus:
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  items: OrderItemData[];
  totalAmount: number;
  orderNumber: string;
  paymentInfo: {
    total_price: number;
    point_used: number;
    coupon_discount_amount: number;
    paid_amount: number;
  };
  claimInfo?: {
    refundId: number | null;
    redeliveryId: number | null;
    status: "CANCELLED" | "REFUND" | "REDELIVERY" | null;
    cancelledAt: string | null;
  };
}

const OrdersPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const {
    data: ordersData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteOrders();
  const { data: claimHistory } = useClaimHistory();
  const observerTarget = useRef<HTMLDivElement>(null);

  // 모든 페이지의 데이터를 평탄화
  const allOrders = useMemo(() => {
    if (!ordersData?.pages) return [];
    return ordersData.pages
      .flatMap((page) => page?.results || [])
      .filter((order) => order !== undefined && order !== null);
  }, [ordersData]);

  // 클레임 이력을 order_item_id로 매핑
  const claimHistoryMap = useMemo(() => {
    if (!claimHistory) return new Map();
    const map = new Map<
      number,
      {
        refundId: number | null;
        redeliveryId: number | null;
        status: "CANCELLED" | "REFUND" | "REDELIVERY" | null;
        cancelledAt: string | null;
      }
    >();
    claimHistory.forEach((claim) => {
      map.set(claim.order_item_id, {
        refundId: claim.refund_id,
        redeliveryId: claim.redelivery_id,
        status: claim.status,
        cancelledAt: claim.cancelled_at,
      });
    });
    return map;
  }, [claimHistory]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "주문접수":
        return "text-[#EB8C34]";
      case "주문확인":
        return "text-[#EB8C34]";
      case "배송중":
        return "text-[#8BC53F]";
      case "배송완료":
        return "text-[#133A1B]";
      case "취소완료":
        return "text-[#595959]";
      default:
        return "text-[#595959]";
    }
  };

  const handleTabClick = (tab: "ongoing" | "history") => {
    setActiveTab(tab);
  };

  const handleOrderDetailClick = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  const handleCancelOrder = (orderId: number) => {
    router.push(`/orders/${orderId}/cancel`);
  };

  const handleRefundExchange = (orderId: number) => {
    // 환불, 교환 신청 페이지로 이동 (orderId는 order_item_id)
    router.push(`/account/refund/${orderId}/request`);
  };

  const handleWriteReview = (orderId: number) => {
    router.push("/account/reviews");
  };

  const handleRefundDetail = (refundId: number) => {
    router.push(`/account/refund/${refundId}`);
  };

  const handleRedeliveryDetail = (redeliveryId: number) => {
    router.push(`/account/refund/${redeliveryId}`);
  };

  const handleCancelDetail = (orderId: number) => {
    router.push(`/orders/${orderId}/cancel-detail`);
  };

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // API 데이터를 개별 주문으로 변환 (그룹화 없이)
  const transformedOrders = useMemo((): Order[] => {
    if (!allOrders || allOrders.length === 0) {
      return [];
    }

    return allOrders.map((item) => {
      const status = item.item_status;

      // 상태 변환
      let displayStatus: OrderStatus;
      if (status === "PENDING") {
        displayStatus = "주문접수";
      } else if (status === "CONFIRMED") {
        displayStatus = "주문확인";
      } else if (status === "SHIPPED") {
        displayStatus = "배송중";
      } else if (status === "DELIVERED") {
        displayStatus = "배송완료";
      } else if (status === "CANCELLED") {
        displayStatus = "취소완료";
      } else {
        displayStatus = "주문접수"; // 기본값
      }

      // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
      const orderedDate = new Date(item.ordered_at);
      const formattedDate = `${orderedDate.getFullYear()}.${String(
        orderedDate.getMonth() + 1
      ).padStart(2, "0")}.${String(orderedDate.getDate()).padStart(2, "0")}`;

      // 이미지 URL 처리
      const getImageUrl = (imageUrl: string | null) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
          return imageUrl;
        }
        return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${imageUrl}`;
      };

      // 클레임 이력 조회
      const claimInfo = claimHistoryMap.get(item.id);

      return {
        id: item.id,
        date: formattedDate,
        status: displayStatus,
        originalStatus: status,
        items: [
          {
            id: item.id,
            name: item.product_name,
            image:
              getImageUrl(item.product_main_image) || fruits[0]?.image || "",
            optionName: item.option_name || null,
            quantity: item.quantity,
            price: item.total_price,
            farmName: item.farm_name,
          },
        ],
        totalAmount: item.paid_amount,
        orderNumber: item.order_number,
        paymentInfo: {
          total_price: item.total_price,
          point_used: item.point_used,
          coupon_discount_amount: item.coupon_discount_amount,
          paid_amount: item.paid_amount,
        },
        claimInfo: claimInfo
          ? {
              refundId: claimInfo.refundId,
              redeliveryId: claimInfo.redeliveryId,
              status: claimInfo.status,
              cancelledAt: claimInfo.cancelledAt,
            }
          : undefined,
      };
    });
  }, [allOrders, claimHistoryMap]);

  // 상태별로 필터링
  const ongoingOrders = useMemo(() => {
    return transformedOrders.filter(
      (order) =>
        order.status === "주문접수" ||
        order.status === "주문확인" ||
        order.status === "배송중"
    );
  }, [transformedOrders]);

  const historyOrders = useMemo(() => {
    return transformedOrders.filter(
      (order) => order.status === "배송완료" || order.status === "취소완료"
    );
  }, [transformedOrders]);

  const orders = activeTab === "ongoing" ? ongoingOrders : historyOrders;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* 탭 내비게이션 */}
        <div className="sticky top-0 z-10 bg-white border-b border-t border-[#E5E5E5]">
          <div className="flex">
            <button
              type="button"
              onClick={() => handleTabClick("ongoing")}
              className={`flex-1 py-4 text-sm font-medium relative ${
                activeTab === "ongoing" ? "text-[#133A1B]" : "text-[#8C8C8C]"
              }`}
              aria-label="진행중인 주문"
            >
              진행중인 주문
              {activeTab === "ongoing" && (
                <div className="absolute bottom-[-1px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleTabClick("history")}
              className={`flex-1 py-4 text-sm font-medium relative ${
                activeTab === "history" ? "text-[#133A1B]" : "text-[#8C8C8C]"
              }`}
              aria-label="주문내역"
            >
              주문내역
              {activeTab === "history" && (
                <div className="absolute bottom-[-1px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
              )}
            </button>
          </div>
        </div>

        {/* 주문 목록 */}
        <div className="flex-1">
          {isLoading ? (
            <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
              <p className="font-medium text-[#8C8C8C] mb-2">로딩 중...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="flex flex-col">
              {orders.map((order, index) => (
                <div key={order.id}>
                  {/* 각 주문 항목 (패딩 포함) */}
                  <div className="px-5 py-4">
                    {/* 날짜 (좌측 상단) */}
                    <div className="mb-4">
                      <span className="font-semibold text-[#262626]">
                        {order.date}
                      </span>
                    </div>
                    <div className="border border-[#E5E5E5] bg-white flex flex-col">
                      {/* 상태 및 주문상세 버튼 */}
                      <div className="px-3.5 py-3 flex items-center justify-between border-b border-[#E5E5E5]">
                        <span
                          className={`text-sm font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOrderDetailClick(order.id)}
                          className="flex items-center text-xs text-medium text-[#8C8C8C] cursor-pointer"
                          aria-label="주문상세"
                        >
                          <span>주문상세</span>
                          <ChevronRightIcon />
                        </button>
                      </div>

                      {/* 상품 목록 */}
                      <div className="px-3.5 py-3 space-y-4">
                        {order.items.map((item) => (
                          <OrderItem key={item.id} item={item} />
                        ))}
                      </div>

                      {/* 총 주문금액 (하단) */}
                      <div className="px-3.5 py-3 border-t border-[#E5E5E5] space-y-2">
                        {order.paymentInfo.point_used > 0 && (
                          <div className="flex justify-between items-center text-sm text-[#262626]">
                            <span>포인트</span>
                            <span className="text-[#8BC53F]">
                              -{order.paymentInfo.point_used.toLocaleString()}원
                            </span>
                          </div>
                        )}
                        {order.paymentInfo.coupon_discount_amount > 0 && (
                          <div className="flex justify-between items-center text-sm text-[#262626]">
                            <span>쿠폰</span>
                            <span className="text-[#8BC53F]">
                              -
                              {order.paymentInfo.coupon_discount_amount.toLocaleString()}
                              원
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex justify-between items-center ${
                            order.paymentInfo.point_used === 0 &&
                            order.paymentInfo.coupon_discount_amount === 0
                              ? ""
                              : "pt-2 border-t border-[#E5E5E5]"
                          }`}
                        >
                          <span className="text-sm font-medium text-[#262626]">
                            총 주문금액
                          </span>
                          <span className="font-semibold text-[#262626]">
                            {order.paymentInfo.paid_amount.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 주문 취소 버튼 (PENDING 상태일 때만 표시) */}
                    {order.originalStatus === "PENDING" && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          className="w-full py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                          aria-label="주문취소"
                        >
                          주문취소
                        </button>
                      </div>
                    )}

                    {/* 취소 완료 상태: 취소 상세 버튼 */}
                    {order.originalStatus === "CANCELLED" &&
                      order.claimInfo &&
                      order.claimInfo.status === "CANCELLED" &&
                      order.claimInfo.cancelledAt && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => handleCancelDetail(order.id)}
                            className="w-full py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                            aria-label="취소 상세"
                          >
                            취소 상세
                          </button>
                        </div>
                      )}

                    {/* 환불/교환 신청 및 후기 작성 버튼 (배송완료 상태일 때만 표시) */}
                    {order.originalStatus === "DELIVERED" && (
                      <div className="mt-3">
                        {/* 클레임 이력이 있는 경우: 취소/환불/교환 상세 버튼 */}
                        {order.claimInfo ? (
                          <>
                            {/* 취소한 주문: 취소 상세 버튼 */}
                            {order.claimInfo.status === "CANCELLED" &&
                              order.claimInfo.cancelledAt && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelDetail(order.id)}
                                  className="w-full py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                                  aria-label="취소 상세"
                                >
                                  취소 상세
                                </button>
                              )}
                            {/* 환불한 주문: 환불 상세 버튼 */}
                            {order.claimInfo.refundId !== null &&
                              order.claimInfo.refundId !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      order.claimInfo?.refundId !== null &&
                                      order.claimInfo?.refundId !== undefined
                                    ) {
                                      handleRefundDetail(
                                        order.claimInfo.refundId
                                      );
                                    }
                                  }}
                                  className="w-full py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                                  aria-label="환불 상세"
                                >
                                  환불 상세
                                </button>
                              )}
                            {/* 교환한 주문: 교환 상세 버튼 */}
                            {order.claimInfo.redeliveryId !== null &&
                              order.claimInfo.redeliveryId !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      order.claimInfo?.redeliveryId !== null &&
                                      order.claimInfo?.redeliveryId !==
                                        undefined
                                    ) {
                                      handleRedeliveryDetail(
                                        order.claimInfo.redeliveryId
                                      );
                                    }
                                  }}
                                  className="w-full py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                                  aria-label="교환 상세"
                                >
                                  교환 상세
                                </button>
                              )}
                          </>
                        ) : (
                          /* 클레임 이력이 없는 경우: 기존 버튼 표시 */
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRefundExchange(order.id)}
                              className="flex-1 py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                              aria-label="환불 / 교환 신청"
                            >
                              환불 / 교환 신청
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWriteReview(order.id)}
                              className="flex-1 py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                              aria-label="후기작성"
                            >
                              후기작성
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* 주문 박스 사이 디바이더 (전체 너비) */}
                  {index < orders.length - 1 && (
                    <div className="h-[10px] bg-[#F7F7F7]" />
                  )}
                </div>
              ))}
              {/* 무한 스크롤 감지용 요소 */}
              {hasNextPage && (
                <div
                  ref={observerTarget}
                  className="h-10 flex items-center justify-center"
                >
                  {isFetchingNextPage && (
                    <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
              <p className="font-medium text-[#8C8C8C] mb-2">
                {activeTab === "ongoing"
                  ? "진행중인 주문이 없습니다"
                  : "주문내역이 없습니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;
