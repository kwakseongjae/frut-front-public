"use client";

import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";

const AdvertisingPage = () => {
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
          <h1 className="text-lg font-semibold text-[#262626]">광고문의</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 본문 영역 */}
      <div className="flex-1 flex items-center justify-center px-5">
        <p className="text-base text-[#262626]">광고문의 페이지입니다.</p>
      </div>
    </div>
  );
};

export default AdvertisingPage;
