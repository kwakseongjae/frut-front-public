"use client";

import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import KakaoIcon from "@/assets/icon/ic_kakao_17.svg";

const CustomerServicePage = () => {
  const router = useRouter();

  const handleNoticeClick = () => {
    router.push("/account/customer-service/notice");
  };

  const handleFAQClick = () => {
    router.push("/account/customer-service/faq");
  };

  const handleAdvertisingClick = () => {
    router.push("/account/customer-service/advertising");
  };

  const handleChatClick = () => {
    // 채팅 상담 페이지로 이동
    console.log("채팅 상담");
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
          <h1 className="text-lg font-semibold text-[#262626]">고객센터</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 메뉴 아이템 그룹 */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={handleNoticeClick}
          className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
          aria-label="공지사항"
        >
          <span className="text-base text-[#262626]">공지사항</span>
          <ChevronRightIcon />
        </button>
        <button
          type="button"
          onClick={handleFAQClick}
          className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
          aria-label="FAQ"
        >
          <span className="text-base text-[#262626]">FAQ</span>
          <ChevronRightIcon />
        </button>
        <button
          type="button"
          onClick={handleAdvertisingClick}
          className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
          aria-label="광고문의"
        >
          <span className="text-base text-[#262626]">광고문의</span>
          <ChevronRightIcon />
        </button>
      </div>

      {/* 하단 고객센터 정보 영역 */}
      <div className="flex-1 flex items-end">
        <div className="w-full bg-[#F7F7F7] px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* 왼쪽: 채팅 문의 정보 */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="text-base font-semibold text-[#262626]">
                채팅 문의
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-[#595959]">
                  평일: 10:00 - 19:00 (점심시간 12:00 ~ 13:00)
                </div>
                <div className="text-sm text-[#595959]">주말/공휴일: 휴무</div>
              </div>
            </div>
            {/* 오른쪽: 채팅 상담 버튼 */}
            <button
              type="button"
              onClick={handleChatClick}
              className="flex items-center gap-2 p-4 bg-white border border-[#D9D9D9] hover:bg-gray-50 active:bg-gray-100 transition-colors"
              aria-label="채팅 상담"
            >
              <KakaoIcon />
              <span className="text-sm font-semibold text-[#262626]">
                채팅 상담
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServicePage;
