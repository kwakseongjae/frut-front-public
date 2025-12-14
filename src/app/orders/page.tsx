"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { fruits } from "@/assets/images/dummy";
import OrderItem from "@/components/OrderItem";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrders } from "@/lib/api/hooks/use-order";

type OrderStatus = "상품준비중" | "배송중" | "배송완료" | "취소완료";

interface OrderItemData {
  id: number;
  name: string;
  image: string;
  option: string;
  price: number;
  farmName: string;
}

interface Order {
  id: number;
  date: string;
  status: OrderStatus;
  items: OrderItemData[];
  totalAmount: number;
  merchantUid: string;
  paymentInfo: {
    total_amount: number;
    point_used: number;
    coupon_discount_amount: number;
    amount: number;
  };
}

const OrdersPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const { data: ordersData, isLoading } = useOrders();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "배송중":
        return "text-[#8BC53F]";
      case "상품준비중":
        return "text-[#EB8C34]";
      case "배송완료":
        return "text-[#F73535]";
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

  // API 데이터를 개별 주문으로 변환 (그룹화 없이)
  const transformedOrders = useMemo((): Order[] => {
    if (!ordersData?.results) {
      return [];
    }

    return ordersData.results.map((item) => {
      const status = item.item_status;

      // 상태 변환
      let displayStatus: OrderStatus;
      if (status === "CONFIRMED") {
        displayStatus = "상품준비중";
      } else if (status === "SHIPPED") {
        displayStatus = "배송중";
      } else if (status === "DELIVERED") {
        displayStatus = "배송완료";
      } else if (status === "CANCELLED") {
        displayStatus = "취소완료";
      } else {
        displayStatus = "상품준비중"; // PENDING
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

      return {
        id: item.id,
        date: formattedDate,
        status: displayStatus,
        items: [
          {
            id: item.id,
            name: item.product_name,
            image:
              getImageUrl(item.product_main_image) || fruits[0]?.image || "",
            option: `${item.quantity}개`,
            price: item.total_price,
            farmName: item.farm_name,
          },
        ],
        totalAmount: item.payment_info.amount,
        merchantUid: item.payment_info.merchant_uid,
        paymentInfo: {
          total_amount: item.payment_info.total_amount,
          point_used: item.payment_info.point_used,
          coupon_discount_amount: item.payment_info.coupon_discount_amount,
          amount: item.payment_info.amount,
        },
      };
    });
  }, [ordersData]);

  // 상태별로 필터링
  const ongoingOrders = useMemo(() => {
    return transformedOrders.filter(
      (order) => order.status === "상품준비중" || order.status === "배송중"
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
                        <div className="flex justify-between items-center text-sm text-[#262626]">
                          <span>상품 금액</span>
                          <span>
                            {order.paymentInfo.total_amount.toLocaleString()}원
                          </span>
                        </div>
                        {order.paymentInfo.point_used > 0 && (
                          <div className="flex justify-between items-center text-sm text-[#262626]">
                            <span>포인트 사용</span>
                            <span className="text-[#8BC53F]">
                              -{order.paymentInfo.point_used.toLocaleString()}원
                            </span>
                          </div>
                        )}
                        {order.paymentInfo.coupon_discount_amount > 0 && (
                          <div className="flex justify-between items-center text-sm text-[#262626]">
                            <span>쿠폰 할인</span>
                            <span className="text-[#8BC53F]">
                              -
                              {order.paymentInfo.coupon_discount_amount.toLocaleString()}
                              원
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5]">
                          <span className="text-sm font-medium text-[#262626]">
                            총 주문금액
                          </span>
                          <span className="font-semibold text-[#262626]">
                            {order.paymentInfo.amount.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 주문 박스 사이 디바이더 (전체 너비) */}
                  {index < orders.length - 1 && (
                    <div className="h-[10px] bg-[#F7F7F7]" />
                  )}
                </div>
              ))}
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
