"use client";

import { useMemo, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";

type FAQCategory =
  | "전체"
  | "회원정보"
  | "주문/결제"
  | "배송"
  | "취소/환불"
  | "기타";

interface FAQItem {
  id: number;
  category: FAQCategory;
  title: string;
  date: string;
  content: string;
}

const FAQPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("전체");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // TODO: 실제 API에서 FAQ 데이터를 가져와야 함
  const faqs: FAQItem[] = [
    {
      id: 1,
      category: "회원정보",
      title: "[회원정보] 제목",
      date: "2024-01-01",
      content: "내용",
    },
    {
      id: 2,
      category: "주문/결제",
      title: "[주문/결제] 제목",
      date: "2024-01-02",
      content: "내용",
    },
    {
      id: 3,
      category: "배송",
      title: "[배송] 제목",
      date: "2024-01-03",
      content: "내용",
    },
    {
      id: 4,
      category: "취소/환불",
      title: "[취소/환불] 제목",
      date: "2024-01-04",
      content: "내용",
    },
    {
      id: 5,
      category: "기타",
      title: "[기타] 제목",
      date: "2024-01-05",
      content: "내용",
    },
    {
      id: 6,
      category: "회원정보",
      title: "[회원정보] 제목",
      date: "2024-01-06",
      content: "내용",
    },
    {
      id: 7,
      category: "주문/결제",
      title: "[주문/결제] 제목",
      date: "2024-01-07",
      content: "내용",
    },
  ];

  const categories: FAQCategory[] = [
    "전체",
    "회원정보",
    "주문/결제",
    "배송",
    "취소/환불",
    "기타",
  ];

  const filteredFAQs = useMemo(() => {
    if (selectedCategory === "전체") {
      return faqs;
    }
    return faqs.filter((faq) => faq.category === selectedCategory);
  }, [selectedCategory, faqs]);

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
          <h1 className="text-lg font-semibold text-[#262626]">
            자주묻는 질문
          </h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 필터 버튼 영역 */}
      <div className="px-5 py-4 border-b border-[#D9D9D9]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  isSelected
                    ? "border border-[#262626] text-[#262626] font-semibold"
                    : "border border-[#D9D9D9] text-[#8C8C8C]"
                }`}
                aria-label={`${category} 필터`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ 리스트 */}
      <div className="flex flex-col">
        {filteredFAQs.map((faq, index) => {
          const isExpanded = expandedItems.has(faq.id);
          return (
            <div key={faq.id}>
              <button
                type="button"
                onClick={() => handleToggle(faq.id)}
                className="w-full flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
                aria-label={`${faq.title} ${isExpanded ? "접기" : "펼치기"}`}
              >
                <div className="flex flex-col items-start gap-1 flex-1">
                  <span className="text-base font-semibold text-[#262626]">
                    {faq.title}
                  </span>
                  <span className="text-sm text-[#8C8C8C]">{faq.date}</span>
                </div>
                <div
                  className={`transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronUpIcon />
                </div>
              </button>
              {index < filteredFAQs.length - 1 && (
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
                      {faq.content}
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

export default FAQPage;
