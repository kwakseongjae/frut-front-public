"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CheckIcon from "@/assets/icon/ic_circle_green_check_white_60.svg";

export default function OrderCompletePage() {
  const router = useRouter();

  // 뒤로가기 시 결제 페이지로 가지 않도록 처리
  useEffect(() => {
    const handlePopState = () => {
      // 결제 완료 페이지에서 뒤로가기 시 홈으로 이동
      router.replace("/");
    };

    window.addEventListener("popstate", handlePopState);

    // 브라우저 히스토리에 현재 페이지를 추가하여 결제 페이지로 돌아가지 않도록 함
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleBackClick = () => {
    // 뒤로가기 버튼 클릭 시 홈으로 이동
    router.push("/");
  };

  const handleBrowseProducts = () => {
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/orders");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5 ">
        <button
          type="button"
          onClick={handleBackClick}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">결제 완료</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        {/* 성공 아이콘 */}
        <div className="relative mb-8">
          <CheckIcon className="w-[60px] h-[60px]" aria-label="결제 완료" />
        </div>

        {/* 완료 메시지 */}
        <div className="text-center mb-12">
          <h2 className="text-[22px] font-medium text-[#262626] mb-2">
            결제가 완료되었습니다
          </h2>
          <p className="text-sm font-normal text-[#262626]">
            주문이 정상적으로 접수되었습니다
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="w-full max-w-md space-y-3">
          <button
            type="button"
            onClick={handleViewOrders}
            className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm rounded-lg hover:bg-[#133A1B]/90 transition-colors"
          >
            주문내역 확인하기
          </button>
          <button
            type="button"
            onClick={handleBrowseProducts}
            className="w-full py-4 bg-white border-2 border-[#133A1B] text-[#133A1B] font-semibold text-sm rounded-lg hover:bg-[#133A1B]/5 transition-colors"
          >
            상품 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
