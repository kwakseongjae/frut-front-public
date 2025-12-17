"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { useCancelOrder, useOrderDetail } from "@/lib/api/hooks/use-order";

const CancelRequestPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = use(params);
  const orderId = parseInt(id, 10);

  const { data: orderDetail, isLoading } = useOrderDetail(orderId);
  const cancelOrderMutation = useCancelOrder();

  const [cancelReason, setCancelReason] = useState<
    | "CHANGE_OF_MIND"
    | "WRONG_ADDRESS"
    | "REORDER_WITH_OTHER"
    | "WRONG_OPTION"
    | "OTHER"
    | ""
  >("");
  const [cancelReasonDetail, setCancelReasonDetail] = useState<string>("");

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

  const handleOrderDetailClick = () => {
    router.push(`/orders/${orderId}`);
  };

  const handleSubmit = async () => {
    if (!cancelReason) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({
        id: orderId,
        request: {
          cancel_reason: cancelReason,
          cancel_reason_detail: cancelReasonDetail || undefined,
        },
      });
      router.push(`/orders/${orderId}/cancel/complete`);
    } catch (error) {
      console.error("취소 신청 실패:", error);
      // TODO: 에러 처리
    }
  };

  const isFormValid = cancelReason !== "";

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">
            주문 정보를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const orderDate = formatDate(orderDetail.ordered_at);
  const productImageUrl = getImageUrl(orderDetail.product_main_image);

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
          <h1 className="text-lg font-semibold text-[#262626]">취소 신청</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 pb-20">
        {/* 주문 정보 섹션 */}
        <div className="px-5 py-4">
          {/* 날짜 라벨 */}
          <div className="mb-4">
            <span className="font-semibold text-[#262626]">
              {orderDate} 취소 신청
            </span>
          </div>
          <div className="border border-[#E5E5E5] bg-white flex flex-col">
            {/* 접수번호 및 주문상세 */}
            <div className="px-3.5 py-3 flex items-center justify-between border-b border-[#E5E5E5]">
              <span className="text-sm text-[#262626]">
                접수번호 {orderDetail.order_number}
              </span>
              <button
                type="button"
                onClick={handleOrderDetailClick}
                className="flex items-center text-xs text-medium text-[#8C8C8C] cursor-pointer"
                aria-label="주문상세"
              >
                <span>주문상세</span>
                <ChevronRightIcon />
              </button>
            </div>

            {/* 상품 정보 */}
            <div className="px-3.5 py-3">
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
                    {orderDetail.quantity}개
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
                {orderDetail.paid_amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 신청 사유 */}
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-[#262626] mb-3">
            신청 사유 <span className="text-[#F73535]">*</span>
          </h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="cancelReason"
                value="CHANGE_OF_MIND"
                checked={cancelReason === "CHANGE_OF_MIND"}
                onChange={(e) =>
                  setCancelReason(
                    e.target.value as
                      | "CHANGE_OF_MIND"
                      | "WRONG_ADDRESS"
                      | "REORDER_WITH_OTHER"
                      | "WRONG_OPTION"
                      | "OTHER"
                  )
                }
              />
              <span className="text-sm text-[#262626]">단순변심</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="cancelReason"
                value="WRONG_ADDRESS"
                checked={cancelReason === "WRONG_ADDRESS"}
                onChange={(e) =>
                  setCancelReason(
                    e.target.value as
                      | "CHANGE_OF_MIND"
                      | "WRONG_ADDRESS"
                      | "REORDER_WITH_OTHER"
                      | "WRONG_OPTION"
                      | "OTHER"
                  )
                }
              />
              <span className="text-sm text-[#262626]">
                배송지를 잘못 입력함
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="cancelReason"
                value="REORDER_WITH_OTHER"
                checked={cancelReason === "REORDER_WITH_OTHER"}
                onChange={(e) =>
                  setCancelReason(
                    e.target.value as
                      | "CHANGE_OF_MIND"
                      | "WRONG_ADDRESS"
                      | "REORDER_WITH_OTHER"
                      | "WRONG_OPTION"
                      | "OTHER"
                  )
                }
              />
              <span className="text-sm text-[#262626]">
                다른 상품 추가 후 재주문 예정
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="cancelReason"
                value="WRONG_OPTION"
                checked={cancelReason === "WRONG_OPTION"}
                onChange={(e) =>
                  setCancelReason(
                    e.target.value as
                      | "CHANGE_OF_MIND"
                      | "WRONG_ADDRESS"
                      | "REORDER_WITH_OTHER"
                      | "WRONG_OPTION"
                      | "OTHER"
                  )
                }
              />
              <span className="text-sm text-[#262626]">
                상품의 옵션 선택을 잘못함
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="cancelReason"
                value="OTHER"
                checked={cancelReason === "OTHER"}
                onChange={(e) =>
                  setCancelReason(
                    e.target.value as
                      | "CHANGE_OF_MIND"
                      | "WRONG_ADDRESS"
                      | "REORDER_WITH_OTHER"
                      | "WRONG_OPTION"
                      | "OTHER"
                  )
                }
              />
              <span className="text-sm text-[#262626]">기타</span>
            </label>
          </div>
        </div>

        {/* 상세 사유 */}
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-[#262626] mb-3">
            상세 사유
          </h2>
          <textarea
            value={cancelReasonDetail}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setCancelReasonDetail(e.target.value);
              }
            }}
            placeholder="상세 사유가 있다면 입력해주세요"
            maxLength={500}
            className="w-full min-h-[120px] p-3 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] resize-none focus:outline-none focus:border-[#133A1B]"
          />
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#E5E5E5] sm:left-auto sm:right-auto sm:w-[640px] sm:mx-auto">
        <div className="px-5 py-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || cancelOrderMutation.isPending}
            className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
              !isFormValid || cancelOrderMutation.isPending
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            aria-label="완료"
          >
            {cancelOrderMutation.isPending ? "처리 중..." : "완료"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRequestPage;
