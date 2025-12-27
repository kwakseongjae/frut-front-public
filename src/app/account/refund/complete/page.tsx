"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CheckIcon from "@/assets/icon/ic_circle_green_check_white_60.svg";

const RefundCompleteContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // "refund" or "return"

  // 뒤로가기 시 환불/교환 신청 페이지로 가지 않도록 처리
  useEffect(() => {
    const handlePopState = () => {
      // 환불/교환 완료 페이지에서 뒤로가기 시 홈으로 이동
      router.replace("/");
    };

    window.addEventListener("popstate", handlePopState);

    // 브라우저 히스토리에 현재 페이지를 추가하여 환불/교환 신청 페이지로 돌아가지 않도록 함
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleBackClick = () => {
    // 뒤로가기 버튼 클릭 시 홈으로 이동
    router.push("/");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // 환불 또는 교환에 따른 메시지
  const titleMessage =
    type === "refund"
      ? "환불 요청이 정상적으로 접수되었습니다."
      : "교환 요청이 정상적으로 접수되었습니다.";

  const pageTitle = type === "refund" ? "환불 신청 완료" : "교환 신청 완료";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={handleBackClick}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">{pageTitle}</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        {/* 성공 아이콘 */}
        <div className="relative mb-8">
          <CheckIcon className="w-[60px] h-[60px]" aria-label={pageTitle} />
        </div>

        {/* 완료 메시지 */}
        <div className="text-center mb-12">
          <h2 className="text-[22px] font-medium text-[#262626] mb-2">
            {titleMessage}
          </h2>
          <p className="text-sm font-normal text-[#262626] leading-relaxed">
            판매자가 요청 내용을 확인 후 처리 예정입니다.
            <br />
            처리 결과는 알림으로 안내드리겠습니다.
          </p>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          onClick={handleGoHome}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm cursor-pointer"
          aria-label="홈으로"
        >
          홈화면으로 이동
        </button>
      </div>
    </div>
  );
};

const RefundCompletePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-white">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
          </div>
        </div>
      }
    >
      <RefundCompleteContent />
    </Suspense>
  );
};

export default RefundCompletePage;
