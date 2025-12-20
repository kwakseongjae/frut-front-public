"use client";

import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";

interface NoticeItem {
  id: number;
  title: string;
  date: string;
  content: string;
}

const NoticePage = () => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // TODO: 실제 API에서 공지사항 데이터를 가져와야 함
  const notices: NoticeItem[] = [
    {
      id: 1,
      title: "[공지] 제목",
      date: "2024-01-01",
      content: "내용",
    },
    {
      id: 2,
      title: "[공지] 제목",
      date: "2024-01-01",
      content: "내용",
    },
    {
      id: 3,
      title: "[공지] 제목",
      date: "2024-01-01",
      content: "내용",
    },
  ];

  const handleToggle = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
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
          <h1 className="text-lg font-semibold text-[#262626]">공지사항</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 공지사항 리스트 */}
      <div className="flex flex-col">
        {notices.map((notice, index) => {
          const isExpanded = expandedItems.has(notice.id);
          return (
            <div key={notice.id}>
              <button
                type="button"
                onClick={() => handleToggle(notice.id)}
                className="w-full flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
                aria-label={`${notice.title} ${isExpanded ? "접기" : "펼치기"}`}
              >
                <div className="flex flex-col items-start gap-1 flex-1">
                  <span className="text-base font-semibold text-[#262626]">
                    {notice.title}
                  </span>
                  <span className="text-sm text-[#8C8C8C]">{notice.date}</span>
                </div>
                <div
                  className={`transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronUpIcon />
                </div>
              </button>
              {index < notices.length - 1 && (
                <div className="h-px bg-[#D9D9D9] mx-5" />
              )}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5">
                  <div className="bg-[#F7F7F7] px-5 py-4">
                    <p className="text-sm text-[#262626] whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoticePage;
