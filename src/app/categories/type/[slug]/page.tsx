"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProductCard from "@/components/ProductCard";
import { useInfiniteProducts } from "@/lib/api/hooks/use-products";
import type { ProductListType } from "@/lib/api/products";

// slug를 type으로 변환하는 함수 (slug가 유효한 type인지 확인)
const slugToType = (slug: string): ProductListType | null => {
  const validTypes: ProductListType[] = [
    "special",
    "weekly_best",
    "popular",
    "recommended",
  ];
  return validTypes.includes(slug as ProductListType)
    ? (slug as ProductListType)
    : null;
};

// type을 한글 제목으로 변환하는 함수
const typeToTitle = (type: ProductListType): string => {
  const typeToTitleMap: Record<Exclude<ProductListType, undefined>, string> = {
    special: "특가",
    weekly_best: "이번주 베스트",
    popular: "실시간 인기상품",
    recommended: "추천상품",
    search: "검색",
  };
  return type ? typeToTitleMap[type] : "카테고리";
};

// 카테고리가 있을 때만 상품 목록을 표시하는 컴포넌트
function CategoryContent({ type }: { type: ProductListType }) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // 무한스크롤로 상품 목록 조회
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts({ type });

  // 모든 페이지의 상품을 평탄화 (안전하게 처리)
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flatMap((page) => page?.results ?? [])
      .filter((product) => product !== undefined && product !== null);
  }, [data]);

  // 스켈레톤 로딩용 고유 ID 생성
  const skeletonIds = useMemo(
    () => Array.from({ length: 6 }, () => crypto.randomUUID()),
    []
  );

  // Intersection Observer로 무한스크롤 구현
  useEffect(() => {
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

  return (
    <div className="px-5 py-4">
      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
          {skeletonIds.map((id) => (
            <div
              key={`category-skeleton-${id}`}
              className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* 무한스크롤 트리거 */}
          <div
            ref={observerTarget}
            className="h-10 flex items-center justify-center py-4"
          >
            {isFetchingNextPage && (
              <div className="text-sm text-[#8C8C8C]">로딩 중...</div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-[#8C8C8C]">상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const type = slugToType(slug);
  const title = type ? typeToTitle(type) : "카테고리";

  // 카테고리가 존재하지 않는 경우
  if (!type) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-1 cursor-pointer"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-lg font-semibold text-[#262626]">
            카테고리를 찾을 수 없습니다
          </h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-[#8C8C8C]">존재하지 않는 카테고리입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-20 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">{title}</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 카테고리 컨텐츠 */}
      <CategoryContent type={type} />
    </div>
  );
}

