"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCancelDetail } from "@/lib/api/hooks/use-order";

const CancelDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = use(params);
  const orderItemId = parseInt(id, 10);

  const { data: cancelDetail, isLoading } = useCancelDetail(orderItemId);

  const handleBackClick = () => {
    router.back();
  };

  const handleOrderDetailClick = () => {
    // 주문 상세 페이지로 이동 (order_number를 사용하거나 order_item_id를 사용)
    // order_number에서 실제 order_id를 추출하거나, API에서 order_id를 받아야 할 수도 있음
    // 일단 order_item_id를 사용하여 주문 상세로 이동
    router.push(`/orders/${orderItemId}`);
  };

  const handleReceiptClick = () => {
    if (cancelDetail?.cancel_receipt_url) {
      window.open(
        cancelDetail.cancel_receipt_url,
        "_blank",
        "noopener,noreferrer"
      );
    }
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
                취소 상세
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

  if (!cancelDetail) {
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
                취소 상세
              </h1>
            </div>
            <div className="w-7" />
          </div>
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">
              취소 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const cancelDate = formatDate(cancelDetail.cancelled_at);
  const productImageUrl = getImageUrl(cancelDetail.product_main_image);

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
            <h1 className="text-lg font-semibold text-[#262626]">취소 상세</h1>
          </div>
          <div className="w-7" />
        </div>

        {/* 본문 */}
        <div className="flex-1">
          {/* 헤더: 날짜와 취소완료 상태 */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-semibold text-[#262626]">{cancelDate}</span>
              <span className="text-sm font-semibold text-[#F73535]">
                취소완료
              </span>
            </div>
          </div>

          {/* 주문 요약 카드 */}
          <div className="px-5 pb-4">
            <div className="border border-[#E5E5E5] bg-white flex flex-col">
              {/* 주문번호와 주문상세 */}
              <div className="px-3.5 py-3 border-b border-[#E5E5E5] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#262626]">주문번호</span>
                  <span className="text-sm font-medium text-[#262626]">
                    {cancelDetail.order_number}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOrderDetailClick}
                  className="flex items-center gap-1 cursor-pointer"
                  aria-label="주문상세"
                >
                  <span className="text-sm text-[#262626]">주문상세</span>
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
                        alt={cancelDetail.order_number}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9]" />
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-semibold text-[#262626] mb-2">
                      {cancelDetail.farm_name}
                    </p>
                    <p className="text-sm text-[#262626] mb-1">
                      {cancelDetail.product_name}
                    </p>
                    <p className="text-sm text-[#8C8C8C] mb-3">
                      {cancelDetail.option_name} x {cancelDetail.quantity}개
                    </p>
                  </div>

                  {/* 상품 금액 */}
                  <div className="flex items-center justify-end">
                    <p className="font-semibold text-[#262626]">
                      {cancelDetail.total_price.toLocaleString()}원
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
                  {cancelDetail.paid_amount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-[10px] bg-[#F7F7F7]" />

          {/* 취소 내역 섹션 */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-2">
              취소 내역
            </h2>
            {/* 제목 아래 구분선 */}
            <div className="border-t border-[#E0E0E0] mb-2" />
            <div className="flex flex-col gap-3">
              {/* 상품금액 */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">상품금액</span>
                <span className="text-sm font-semibold text-[#262626]">
                  {cancelDetail.total_price.toLocaleString()}원
                </span>
              </div>

              {/* 배송비 */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666666]">배송비</span>
                <span className="text-sm text-[#262626]">
                  {cancelDetail.delivery_fee === 0
                    ? "무료배송"
                    : `+${cancelDetail.delivery_fee.toLocaleString()}원`}
                </span>
              </div>

              {/* 배송비와 취소완료 사이 구분선 */}
              <div className="border-t border-[#E0E0E0]" />

              {/* 취소완료 금액 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#666666]">취소완료</span>
                  <span className="text-sm font-semibold text-[#262626]">
                    {cancelDetail.refund_amount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-[#666666]">
                    {cancelDetail.pay_method_display}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 취소 카드영수증 보기 버튼 */}
          {cancelDetail.cancel_receipt_url && (
            <div className="px-5 py-4">
              <button
                type="button"
                onClick={handleReceiptClick}
                className="w-full py-3 border border-[#E5E5E5] bg-white text-[#262626] font-medium text-sm"
                aria-label="취소 카드영수증 보기"
              >
                취소 카드영수증 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CancelDetailPage;
