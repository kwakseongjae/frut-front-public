"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePopups } from "@/lib/api/hooks/use-operations";

const HomePopupModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayDateString = useCallback((): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // 오늘 날짜 문자열
  const todayDateString = useMemo(
    () => getTodayDateString(),
    [getTodayDateString]
  );

  // 팝업 목록 조회
  const { data: popupsData } = usePopups(todayDateString);

  // popup_image와 popup_url이 모두 있는 팝업 중 랜덤 선택
  const selectedPopup = useMemo(() => {
    if (!popupsData?.results || popupsData.results.length === 0) {
      return null;
    }

    // popup_image와 popup_url이 모두 있는 팝업 필터링
    const validPopups = popupsData.results.filter(
      (popup) => popup.popup_image && popup.popup_url
    );

    if (validPopups.length === 0) {
      return null;
    }

    // 랜덤 선택
    const popupRandomIndex = Math.floor(Math.random() * validPopups.length);
    return validPopups[popupRandomIndex];
  }, [popupsData]);

  // 로컬스토리지에서 오늘 날짜의 팝업 숨김 여부 확인
  const checkShouldShowPopup = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    const todayDateString = getTodayDateString();
    const hiddenDate = localStorage.getItem("homePopupHiddenDate");

    // 저장된 날짜가 오늘 날짜와 다르면 팝업 표시
    if (hiddenDate !== todayDateString) {
      return true;
    }

    return false;
  }, [getTodayDateString]);

  // 컴포넌트 마운트 시 팝업 표시 여부 확인 (팝업 데이터가 있을 때만)
  useEffect(() => {
    if (selectedPopup) {
      const shouldShow = checkShouldShowPopup();
      setIsOpen(shouldShow);
    }
  }, [checkShouldShowPopup, selectedPopup]);

  // 자정 체크 및 초기화 (선택적 - 사용자가 페이지를 새로고침하거나 다시 방문하면 자동으로 초기화됨)
  useEffect(() => {
    const checkMidnightReset = () => {
      const todayDateString = getTodayDateString();
      const hiddenDate = localStorage.getItem("homePopupHiddenDate");

      // 저장된 날짜가 오늘 날짜와 다르면 초기화
      if (hiddenDate && hiddenDate !== todayDateString) {
        localStorage.removeItem("homePopupHiddenDate");
        setIsOpen(true);
      }
    };

    // 초기 체크
    checkMidnightReset();

    // 1분마다 체크 (자정 확인용)
    const interval = setInterval(checkMidnightReset, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [getTodayDateString]);

  const handleClose = useCallback(() => {
    if (dontShowToday) {
      // 오늘 날짜를 로컬스토리지에 저장
      const todayDateString = getTodayDateString();
      localStorage.setItem("homePopupHiddenDate", todayDateString);
    }
    setIsOpen(false);
  }, [dontShowToday, getTodayDateString]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDontShowToday(e.target.checked);
  };

  const handleImageClick = () => {
    if (selectedPopup?.popup_url) {
      window.open(selectedPopup.popup_url, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen || !selectedPopup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 백드롭 - 슬래시(/) 패턴으로 오파시티 부여 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 모달 컨텐츠 */}
      <div className="relative w-[320px] mx-4 bg-white flex flex-col z-10">
        {/* 이미지 영역 - 너비 320px, 원본 비율 유지 */}
        <button
          type="button"
          className="w-full bg-gray-100 cursor-pointer p-0 border-0"
          onClick={handleImageClick}
          aria-label={selectedPopup.popup_title}
        >
          {selectedPopup.popup_image ? (
            <img
              src={selectedPopup.popup_image}
              alt={selectedPopup.popup_title}
              className="w-full h-auto"
              style={{ display: "block" }}
            />
          ) : (
            <div className="w-full bg-gray-200 flex items-center justify-center" style={{ minHeight: "200px" }}>
              <span className="text-sm text-gray-400">이미지 영역</span>
            </div>
          )}
        </button>

        {/* 하단 푸터 */}
        <div className="border-t border-[#E5E5E5] px-4 py-3 flex items-center justify-between">
          {/* 체크박스 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={handleCheckboxChange}
              className="w-4 h-4 border border-[#E5E5E5] rounded cursor-pointer"
              aria-label="오늘 하루 보지 않기"
            />
            <span className="text-sm text-[#262626]">오늘 하루 보지 않기</span>
          </label>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-[#262626] cursor-pointer"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePopupModal;
