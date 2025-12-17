"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import QuestionCircleIcon from "@/assets/icon/ic_question_circle_grey_15.svg";
import { useRefundableItems } from "@/lib/api/hooks/use-order";

const RefundPage = () => {
  const router = useRouter();
  const { data: refundableItems, isLoading } = useRefundableItems();

  const handleRefundRequestClick = (orderItemId: number) => {
    router.push(`/account/refund/${orderItemId}/request`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">환불 / 반품</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 환불 가능 내역 섹션 */}
      <div className="flex flex-col">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-[#262626]">
            신청 가능 내역
          </h2>
        </div>

        {/* 환불 가능 아이템 리스트 */}
        <div className="flex flex-col px-5 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
            </div>
          ) : refundableItems && refundableItems.length > 0 ? (
            refundableItems.map((item) => (
              <div
                key={item.order_item_id}
                className="flex flex-col border border-[#E5E5E5] bg-white mb-4 last:mb-0"
              >
                {/* 상태 및 날짜 */}
                <div className="px-4 py-3 border-b border-[#E5E5E5]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F73535]">
                        배송완료
                      </span>
                      <span className="text-sm text-[#262626]">
                        {formatDate(item.delivered_at)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleRefundRequestClick(item.order_item_id)
                      }
                      className="flex items-center text-xs font-medium text-[#8C8C8C] cursor-pointer"
                      aria-label="환불 / 반품 신청하기"
                    >
                      <span>환불 / 반품 신청하기</span>
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="px-4 py-3">
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <div className="w-20 h-20 bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                      {item.product_main_image && (
                        <Image
                          src={item.product_main_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* 상품 상세 정보 */}
                    <div className="flex flex-col flex-1 gap-2">
                      {/* 총 가격 */}
                      <div className="flex justify-end">
                        <span className="text-base font-semibold text-[#262626]">
                          {item.paid_amount.toLocaleString()}원
                        </span>
                      </div>

                      {/* 상품 정보 */}
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-[#262626]">
                          {item.product_name} | 수량: {item.quantity}개
                        </div>
                        {item.point_used > 0 && (
                          <div className="text-xs text-[#8C8C8C]">
                            포인트 사용: {item.point_used.toLocaleString()}원
                          </div>
                        )}
                        {item.coupon_discount_amount > 0 && (
                          <div className="text-xs text-[#8C8C8C]">
                            쿠폰 할인:{" "}
                            {item.coupon_discount_amount.toLocaleString()}원
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#8C8C8C]">
                신청 가능한 내역이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 환불 / 반품 주의사항 섹션 */}
      <div className="flex-1 flex items-end">
        <div className="w-full bg-[#F7F7F7] px-5 py-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0">
              <QuestionCircleIcon />
            </div>
            <h3 className="text-base font-semibold text-[#262626]">
              환불 / 반품 주의사항
            </h3>
          </div>
          <ul className="flex flex-col gap-2 list-disc list-inside ml-4">
            <li className="text-sm text-[#8C8C8C]">
              상품 도착 후 2일 이내 가능합니다
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RefundPage;
