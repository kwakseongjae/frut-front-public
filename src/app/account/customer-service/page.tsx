"use client";

import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";

const CustomerServicePage = () => {
  const router = useRouter();

  const handleNoticeClick = () => {
    router.push("/account/customer-service/notice");
  };

  const handleFAQClick = () => {
    router.push("/account/customer-service/faq");
  };

  const handleAdvertisingClick = () => {
    window.alert("아직 준비중인 페이지입니다.");
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
    </div>
  );
};

export default CustomerServicePage;
