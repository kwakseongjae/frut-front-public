"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrderDetail } from "@/lib/api/hooks/use-order";

const OrderDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = use(params);
  const orderId = parseInt(id, 10);

  const { data: orderDetail, isLoading } = useOrderDetail(orderId);

  const handleBackClick = () => {
    router.back();
  };

  const handleCancelOrder = () => {
    // 주문 취소 로직 구현
    console.log("주문 취소");
  };

  // 상태에 따른 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case "배송중":
      case "SHIPPED":
        return "text-[#8BC53F]";
      case "상품준비중":
      case "PENDING":
      case "CONFIRMED":
        return "text-[#EB8C34]";
      case "배송완료":
      case "DELIVERED":
        return "text-[#F73535]";
      case "취소완료":
      case "CANCELLED":
        return "text-[#595959]";
      default:
        return "text-[#595959]";
    }
  };

  // 배송 현황 상태 매핑
  const getDeliveryStatuses = (status: string) => {
    const statusDisplay = orderDetail?.item_status_display || "";
    const isShipped = status === "SHIPPED" || statusDisplay === "배송중";
    const isDelivered = status === "DELIVERED" || statusDisplay === "배송완료";

    if (isShipped) {
      return [
        { label: "상품 발송", isActive: false, isCompleted: false },
        { label: "집화", isActive: false, isCompleted: false },
        { label: "배송중", isActive: true, isCompleted: false },
        { label: "배송완료", isActive: false, isCompleted: false },
      ];
    }
    if (isDelivered) {
      return [
        { label: "상품 발송", isActive: false, isCompleted: false },
        { label: "집화", isActive: false, isCompleted: false },
        { label: "배송중", isActive: false, isCompleted: false },
        { label: "배송완료", isActive: true, isCompleted: false },
      ];
    }
    return [
      { label: "상품 발송", isActive: false, isCompleted: false },
      { label: "집화", isActive: false, isCompleted: false },
      { label: "배송중", isActive: false, isCompleted: false },
      { label: "배송완료", isActive: false, isCompleted: false },
    ];
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 이미지 URL 처리
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      return imageUrl;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen">
          <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
            <button
              type="button"
              onClick={handleBackClick}
              className="cursor-pointer"
              aria-label="뒤로가기"
            >
              <ChevronLeftIcon />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[#262626]">
                주문 상세
              </h1>
            </div>
            <div className="w-7" />
          </div>
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!orderDetail) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen">
          <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
            <button
              type="button"
              onClick={handleBackClick}
              className="cursor-pointer"
              aria-label="뒤로가기"
            >
              <ChevronLeftIcon />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[#262626]">
                주문 상세
              </h1>
            </div>
            <div className="w-7" />
          </div>
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">
              주문 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const deliveryStatuses = getDeliveryStatuses(orderDetail.item_status);
  const isBeforeDelivery =
    orderDetail.item_status === "PENDING" ||
    orderDetail.item_status === "CONFIRMED" ||
    orderDetail.item_status_display === "상품준비중";

  const orderDate = formatDate(orderDetail.ordered_at);
  const productImageUrl = getImageUrl(orderDetail.product_main_image);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* 헤더 영역 */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
          <button
            type="button"
            onClick={handleBackClick}
            className="cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeftIcon />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#262626]">주문 상세</h1>
          </div>
          <div className="w-7" />
        </div>

        {/* 본문 */}
        <div className="flex-1 pb-20">
          {/* 배송 현황 섹션 */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-4">
              배송현황
            </h2>
            <div className="flex items-center justify-center gap-2">
              {deliveryStatuses.map((status) => (
                <div key={status.label} className="flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      status.isActive ? "text-[#133A1B]" : "text-[#8C8C8C]"
                    }`}
                  >
                    {status.label}
                  </span>
                  {deliveryStatuses.indexOf(status) <
                    deliveryStatuses.length - 1 && <ChevronRightIcon />}
                </div>
              ))}
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-[10px] bg-[#F7F7F7]" />

          {/* 주문 상품 상세 섹션 */}
          <div className="px-5 py-4">
            {/* 날짜 */}
            <div className="mb-4">
              <span className="font-semibold text-[#262626]">{orderDate}</span>
            </div>

            {/* 주문 박스 */}
            <div className="border border-[#E5E5E5] bg-white flex flex-col">
              {/* 상태 */}
              <div className="px-3.5 py-3 border-b border-[#E5E5E5]">
                <span
                  className={`text-sm font-semibold ${getStatusColor(
                    orderDetail.item_status
                  )}`}
                >
                  {orderDetail.item_status_display}
                </span>
              </div>

              {/* 상품 목록 */}
              <div className="px-3.5 py-3 space-y-4">
                <div className="flex items-start gap-3">
                  {/* 상품 이미지 */}
                  <div className="w-24 h-24 relative shrink-0 bg-gray-200">
                    {productImageUrl ? (
                      <Image
                        src={productImageUrl}
                        alt={orderDetail.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9]" />
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-medium text-[#262626] mb-2">
                      {orderDetail.farm_name}
                    </p>
                    <p className="text-sm text-[#262626] mb-1">
                      {orderDetail.product_name}
                    </p>
                    <p className="text-sm text-[#8C8C8C] mb-3">
                      수량: {orderDetail.quantity}개
                    </p>
                  </div>

                  {/* 상품 금액 */}
                  <div className="flex items-center justify-end">
                    <p className="font-semibold text-[#262626]">
                      {orderDetail.total_price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 총 주문금액 */}
              <div className="px-3.5 py-3 border-t border-[#E5E5E5] flex justify-between items-center">
                <span className="text-sm font-medium text-[#262626]">
                  총 주문금액
                </span>
                <span className="font-semibold text-[#262626]">
                  {orderDetail.total_price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-[10px] bg-[#F7F7F7]" />

          {/* 결제 정보 섹션 */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-4">
              결제 정보
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#262626]">결제 방법</span>
                <span className="text-sm font-medium text-[#262626]">
                  {orderDetail.payment_info.pay_method_display}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#262626]">상품금액</span>
                <span className="text-sm font-medium text-[#262626]">
                  {orderDetail.payment_info.total_amount.toLocaleString()}원
                </span>
              </div>
              {orderDetail.payment_info.discount_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#262626]">할인금액</span>
                  <span className="text-sm font-medium text-[#FF6B6B]">
                    -{orderDetail.payment_info.discount_amount.toLocaleString()}
                    원
                  </span>
                </div>
              )}
              {orderDetail.payment_info.coupon_discount_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#262626]">쿠폰 할인</span>
                  <span className="text-sm font-medium text-[#FF6B6B]">
                    -
                    {orderDetail.payment_info.coupon_discount_amount.toLocaleString()}
                    원
                  </span>
                </div>
              )}
              {orderDetail.payment_info.point_used > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#262626]">포인트 사용</span>
                  <span className="text-sm font-medium text-[#FF6B6B]">
                    -{orderDetail.payment_info.point_used.toLocaleString()}원
                  </span>
                </div>
              )}
              {orderDetail.delivery_info?.delivery_fee &&
                orderDetail.delivery_info.delivery_fee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#262626]">배송비</span>
                    <span className="text-sm font-medium text-[#262626]">
                      {orderDetail.delivery_info?.delivery_fee.toLocaleString()}
                      원
                    </span>
                  </div>
                )}
              <div className="h-[1px] bg-[#262626] my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#262626]">
                  최종 결제금액
                </span>
                <span className="text-lg font-semibold text-[#262626]">
                  {orderDetail.payment_info.amount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-[10px] bg-[#F7F7F7]" />

          {/* 배송지 정보 섹션 */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-4">
              배송지 정보
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-[#262626]">받는분</span>
                <span className="text-sm font-medium text-[#262626] text-right">
                  {orderDetail.recipient_name}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-[#262626]">주소</span>
                <span className="text-sm font-medium text-[#262626] text-right flex-1 ml-4">
                  {orderDetail.delivery_address}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#262626]">연락처</span>
                <span className="text-sm font-medium text-[#262626]">
                  {orderDetail.recipient_phone}
                </span>
              </div>
              {orderDetail.delivery_info?.delivery_memo && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-[#262626]">배송 요청사항</span>
                  <span className="text-sm font-medium text-[#262626] text-right flex-1 ml-4">
                    {orderDetail.delivery_info.delivery_memo}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 플로팅 주문취소 버튼 (배송전일 때만 표시) */}
        {isBeforeDelivery && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] px-5 py-3 z-20">
            <button
              type="button"
              onClick={handleCancelOrder}
              className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
              aria-label="주문취소"
            >
              주문취소
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default OrderDetailPage;
