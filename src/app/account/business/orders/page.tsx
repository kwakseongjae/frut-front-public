"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { useInfiniteSellerOrders } from "@/lib/api/hooks/use-order";

type OrderStatusTab =
  | "all"
  | "confirmed"
  | "preparing"
  | "shipping"
  | "delivered";

interface OrderItem {
  id: number;
  product_name: string;
  product_main_image: string | null;
  option_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: "주문확인" | "배송준비" | "배송중" | "배송완료";
  originalStatus:
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  ordered_at: string;
  items: OrderItem[];
  paid_amount: number;
  pay_method_display: string;
  delivery_company: string | null;
  tracking_number: string | null;
  delivery_address: string;
}

const BusinessOrdersPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderStatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: ordersData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSellerOrders();
  const observerTarget = useRef<HTMLDivElement>(null);

  // 모든 페이지의 데이터를 평탄화
  const allOrdersData = useMemo(() => {
    if (!ordersData?.pages) return [];
    return ordersData.pages
      .flatMap((page) => page?.results || [])
      .filter((order) => order !== undefined && order !== null);
  }, [ordersData]);

  // API 데이터를 Order 형식으로 변환
  const orders: Order[] = useMemo(() => {
    if (!allOrdersData || allOrdersData.length === 0) return [];

    return allOrdersData.map((item) => {
      // 상태 매핑
      let status: "주문확인" | "배송준비" | "배송중" | "배송완료";
      let originalStatus:
        | "PENDING"
        | "CONFIRMED"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED";

      switch (item.item_status) {
        case "PENDING":
          status = "주문확인";
          originalStatus = "PENDING";
          break;
        case "CONFIRMED":
          status = "배송준비";
          originalStatus = "CONFIRMED";
          break;
        case "SHIPPED":
          status = "배송중";
          originalStatus = "SHIPPED";
          break;
        case "DELIVERED":
        case "CANCELLED":
          status = "배송완료";
          originalStatus = item.item_status;
          break;
        default:
          status = "주문확인";
          originalStatus = "PENDING";
      }

      return {
        id: item.id,
        order_number: item.order_number,
        status,
        originalStatus,
        ordered_at: item.ordered_at,
        items: [
          {
            id: item.id,
            product_name: item.product_name,
            product_main_image: item.product_main_image,
            option_name: item.option_name || "",
            quantity: item.quantity,
            price: item.total_price,
          },
        ],
        paid_amount: item.paid_amount,
        pay_method_display: item.pay_method_display,
        delivery_company: item.delivery_company,
        tracking_number: item.tracking_number,
        delivery_address: item.delivery_address,
      };
    });
  }, [allOrdersData]);

  // 상태별 개수 계산
  const statusCounts = useMemo(() => {
    const counts = {
      confirmed: 0,
      preparing: 0,
      shipping: 0,
      delivered: 0,
    };

    orders.forEach((order) => {
      switch (order.originalStatus) {
        case "PENDING":
          counts.confirmed++;
          break;
        case "CONFIRMED":
          counts.preparing++;
          break;
        case "SHIPPED":
          counts.shipping++;
          break;
        case "DELIVERED":
        case "CANCELLED":
          counts.delivered++;
          break;
      }
    });

    return counts;
  }, [orders]);

  // 날짜/시간 포맷팅
  const formatDateTime = (
    dateString: string
  ): { date: string; time: string } => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  // 탭 필터링
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 탭 필터
    if (activeTab !== "all") {
      const statusMap: Record<OrderStatusTab, string[]> = {
        all: [],
        confirmed: ["PENDING"],
        preparing: ["CONFIRMED"],
        shipping: ["SHIPPED"],
        delivered: ["DELIVERED", "CANCELLED"],
      };
      filtered = filtered.filter((order) =>
        statusMap[activeTab].includes(order.originalStatus)
      );
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(query) ||
          order.items.some((item) =>
            item.product_name.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [activeTab, searchQuery, orders]);

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

  const handleOrderDetailClick = (orderId: number) => {
    router.push(`/account/business/orders/${orderId}/status`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">주문관리</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 상태별 개수 표시 */}
      <div className="px-5 py-4 bg-white">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-[#133A1B]">
              {statusCounts.confirmed}
            </span>
            <span className="text-sm font-medium text-[#133A1B]">주문확인</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-[#133A1B]">
              {statusCounts.preparing}
            </span>
            <span className="text-sm font-medium text-[#133A1B]">배송준비</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-[#133A1B]">
              {statusCounts.shipping}
            </span>
            <span className="text-sm font-medium text-[#133A1B]">배송중</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-[#133A1B]">
              {statusCounts.delivered}
            </span>
            <span className="text-sm font-medium text-[#133A1B]">배송완료</span>
          </div>
        </div>
      </div>

      {/* 검색바 */}
      <div className="px-5 pb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색"
          className="w-full px-4 py-2 bg-[#F5F5F5] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] border border-transparent focus:outline-none focus:bg-white focus:border-[#133A1B]"
        />
      </div>

      {/* 탭 네비게이션 */}
      <div className="px-5 border-b border-[#E5E5E5]">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "all" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="전체"
          >
            전체
            {activeTab === "all" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#133A1B]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("confirmed")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "confirmed" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="주문확인"
          >
            주문확인
            {activeTab === "confirmed" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#133A1B]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preparing")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "preparing" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="배송준비"
          >
            배송준비
            {activeTab === "preparing" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#133A1B]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "shipping" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="배송중"
          >
            배송중
            {activeTab === "shipping" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#133A1B]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("delivered")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "delivered" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="배송완료"
          >
            배송완료
            {activeTab === "delivered" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#133A1B]" />
            )}
          </button>
        </div>
      </div>

      {/* 주문 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
          <div className="flex flex-col">
            {filteredOrders.map((order) => {
              return (
                <div key={order.id} className="px-5 py-3">
                  {/* 주문 카드 */}
                  <div className="border border-[#E5E5E5] bg-white flex flex-col">
                    {/* 상태 및 주문상세 버튼 */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-[#E5E5E5]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#262626]">
                          {order.status}
                        </span>
                        <span className="text-sm font-semibold text-[#262626]">
                          {order.order_number}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOrderDetailClick(order.id)}
                        className="flex items-center text-xs font-medium text-[#8C8C8C] cursor-pointer"
                        aria-label="주문상세"
                      >
                        <span>주문상세</span>
                        <ChevronRightIcon />
                      </button>
                    </div>

                    {/* 상품 목록 */}
                    <div className="px-4 py-3 space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          {/* 상품 이미지 */}
                          <div className="w-20 h-20 bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                            {item.product_main_image ? (
                              <Image
                                src={item.product_main_image}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#D9D9D9]" />
                            )}
                          </div>

                          {/* 상품 정보 */}
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="text-sm text-[#262626]">
                              {item.product_name}
                            </span>
                            {item.option_name && (
                              <span className="text-sm text-[#8C8C8C]">
                                {item.option_name} x {item.quantity}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-[#262626]">
                              {item.price.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 구분선 */}
                    <div className="h-px bg-[#E5E5E5]" />

                    {/* 결제 정보 */}
                    <div className="px-4 py-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-[#262626]">
                          결제 정보
                        </span>
                        <span className="text-sm font-semibold text-[#262626]">
                          {order.paid_amount.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-[#949494]">
                        <div>{order.pay_method_display}</div>
                        {order.delivery_company && order.tracking_number && (
                          <div>
                            {order.delivery_company} {order.tracking_number}
                          </div>
                        )}
                        <div>{order.delivery_address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
          </>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">주문 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOrdersPage;
