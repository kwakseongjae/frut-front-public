"use client";

import { useEffect, useState } from "react";

interface MaintenanceData {
  title: string;
  message: string;
  expected_end_time: string;
}

const MaintenancePage = () => {
  const [maintenanceData, setMaintenanceData] =
    useState<MaintenanceData | null>(null);

  useEffect(() => {
    // sessionStorage에서 점검 정보 가져오기
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("maintenanceData");
      if (storedData) {
        try {
          setMaintenanceData(JSON.parse(storedData));
        } catch (error) {
          console.error("점검 정보 파싱 실패:", error);
        }
      }
    }
  }, []);

  // 날짜 포맷팅 함수
  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      // 요일 계산
      const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
      const weekday = weekdays[date.getDay()];

      return `${year}년 ${month}월 ${day}일(${weekday}) ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 실패:", error);
      return dateString;
    }
  };

  const title = maintenanceData?.title || "서버 정기 점검";
  const message =
    maintenanceData?.message ||
    "서버 점검으로 서비스 이용이\n일시적으로 중단되오니 양해 부탁드립니다.";
  const expectedEndTime =
    maintenanceData?.expected_end_time || "2025-12-25T06:00:00+09:00";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 - 뒤로가기 버튼 없음 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-center py-3 px-5">
        <h1 className="text-lg font-semibold text-[#262626]">시스템 점검 중</h1>
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        {/* 아이콘 */}
        <div className="w-24 h-24 rounded-full bg-[#133A1B] flex items-center justify-center mb-8">
          <span className="text-white text-5xl font-bold">!</span>
        </div>

        {/* 메시지 */}
        <div className="text-center mb-8">
          <p className="text-base text-[#262626] mb-2">{title}</p>
          <p className="text-sm text-[#515151] whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* 점검 일시 */}
        {expectedEndTime && (
          <div className="w-full max-w-sm bg-[#F5F5F5] py-5 text-center">
            <div className="font-semibold text-[#515151]">점검 일시</div>
            <div className="text-sm font-semibold text-[#515151]">
              {formatDateTime(expectedEndTime)} 까지
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
