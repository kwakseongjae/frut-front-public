"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";
import { useFAQDetail, useInfiniteFAQs } from "@/lib/api/hooks/use-operations";
import type { FAQType } from "@/lib/api/operations";

type FAQCategory =
  | "전체"
  | "회원정보"
  | "주문/결제"
  | "배송"
  | "취소/환불"
  | "기타";

const categoryToFAQType: Record<FAQCategory, FAQType | undefined> = {
  전체: undefined,
  회원정보: "ACCOUNT",
  "주문/결제": "ORDER",
  배송: "DELIVERY",
  "취소/환불": "CANCEL",
  기타: "ETC",
};

const FAQPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("전체");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqType = categoryToFAQType[selectedCategory];
  const {
    data: faqsData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFAQs(faqType);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 모든 페이지의 FAQ 데이터를 평탄화
  const faqs = useMemo(() => {
    if (!faqsData?.pages) return [];
    return faqsData.pages
      .flatMap((page) => page?.results || [])
      .filter((faq) => faq !== undefined && faq !== null);
  }, [faqsData]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const categories: FAQCategory[] = [
    "전체",
    "회원정보",
    "주문/결제",
    "배송",
    "취소/환불",
    "기타",
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

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
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
          onClick={() => router.back()}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-[#8C8C8C]">로딩 중...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-red-500">
              FAQ 목록을 불러오는데 실패했습니다.{" "}
              {error instanceof Error ? error.message : ""}
            </span>
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-[#8C8C8C]">FAQ가 없습니다.</span>
          </div>
        ) : (
          faqs.map((faq, index) => {
            const isExpanded = expandedItems.has(faq.id);
            return (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={isExpanded}
                onToggle={() => handleToggle(faq.id)}
                isLast={index === faqs.length - 1}
                formatDate={formatDate}
              />
            );
          })
        )}
        {/* 무한 스크롤 감지용 요소 */}
        {hasNextPage && (
          <div
            ref={observerTarget}
            className="h-10 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <span className="text-sm text-[#8C8C8C]">로딩 중...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface FAQItemProps {
  faq: {
    id: number;
    title: string;
    created_at: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  formatDate: (dateString: string) => string;
}

const FAQItem = ({
  faq,
  isExpanded,
  onToggle,
  isLast,
  formatDate,
}: FAQItemProps) => {
  const { data: faqDetail, isLoading: isLoadingDetail } = useFAQDetail(
    faq.id,
    isExpanded
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
        aria-label={`${faq.title} ${isExpanded ? "접기" : "펼치기"}`}
      >
        <div className="flex flex-col items-start gap-1 flex-1">
          <span className="text-base font-semibold text-[#262626]">
            {faq.title}
          </span>
          <span className="text-sm text-[#8C8C8C]">
            {formatDate(faq.created_at)}
          </span>
        </div>
        <div
          className={`transition-transform duration-300 ${
            isExpanded ? "" : "rotate-180"
          }`}
        >
          <ChevronUpIcon />
        </div>
      </button>
      {!isLast && <div className="h-px bg-[#D9D9D9] mx-5" />}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5">
          <div className="bg-[#F7F7F7] px-5 py-4">
            {isLoadingDetail ? (
              <p className="text-sm text-[#8C8C8C]">
                FAQ 내용을 불러오는 중...
              </p>
            ) : faqDetail ? (
              <p className="text-sm text-[#262626] whitespace-pre-wrap">
                {faqDetail.content}
              </p>
            ) : (
              <p className="text-sm text-[#8C8C8C]">
                FAQ 내용을 불러올 수 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
