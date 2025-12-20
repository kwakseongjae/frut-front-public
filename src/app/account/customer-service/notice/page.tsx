"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";
import {
  useInfiniteNotices,
  useNoticeDetail,
} from "@/lib/api/hooks/use-operations";

const NoticePage = () => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const {
    data: noticesData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotices();
  const observerTarget = useRef<HTMLDivElement>(null);

  // 모든 페이지의 공지사항 데이터를 평탄화
  const notices = useMemo(() => {
    if (!noticesData?.pages) return [];
    return noticesData.pages
      .flatMap((page) => page?.results || [])
      .filter((notice) => notice !== undefined && notice !== null);
  }, [noticesData]);

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

  const handleToggle = (id: number) => {
    const newExpanded = new Set(expandedItems);
    const wasExpanded = newExpanded.has(id);
    if (wasExpanded) {
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
          <h1 className="text-lg font-semibold text-[#262626]">공지사항</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 공지사항 리스트 */}
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-[#8C8C8C]">로딩 중...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-red-500">
              공지사항을 불러오는데 실패했습니다.{" "}
              {error instanceof Error ? error.message : ""}
            </span>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-[#8C8C8C]">공지사항이 없습니다.</span>
          </div>
        ) : (
          notices.map((notice, index) => {
            const isExpanded = expandedItems.has(notice.id);
            return (
              <NoticeItem
                key={notice.id}
                notice={notice}
                isExpanded={isExpanded}
                onToggle={() => handleToggle(notice.id)}
                isLast={index === notices.length - 1}
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

interface NoticeItemProps {
  notice: {
    id: number;
    title: string;
    created_at: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  formatDate: (dateString: string) => string;
}

const NoticeItem = ({
  notice,
  isExpanded,
  onToggle,
  isLast,
  formatDate,
}: NoticeItemProps) => {
  const { data: noticeDetail, isLoading: isLoadingDetail } = useNoticeDetail(
    notice.id,
    isExpanded
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
        aria-label={`${notice.title} ${isExpanded ? "접기" : "펼치기"}`}
      >
        <div className="flex flex-col items-start gap-1 flex-1">
          <span className="text-base font-semibold text-[#262626]">
            {notice.title}
          </span>
          <span className="text-sm text-[#8C8C8C]">
            {formatDate(notice.created_at)}
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
                공지사항 내용을 불러오는 중...
              </p>
            ) : noticeDetail ? (
              <p className="text-sm text-[#262626] whitespace-pre-wrap">
                {noticeDetail.content}
              </p>
            ) : (
              <p className="text-sm text-[#8C8C8C]">
                공지사항 내용을 불러올 수 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePage;
