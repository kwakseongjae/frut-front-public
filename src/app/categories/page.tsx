"use client";

import { useMemo } from "react";
import ExpandableCategory from "@/components/ExpandableCategory";
import Footer from "@/components/Footer";
import { useCategories } from "@/lib/api/hooks/use-products";

function CategoriesPage() {
  // 활성화된 카테고리 조회
  const { data: categoriesData, isLoading } = useCategories(true);

  // 카테고리 데이터를 ExpandableCategory 컴포넌트에 맞는 형식으로 변환
  const categoryItems = useMemo(() => {
    if (!categoriesData) return [];

    return categoriesData.map((category, index) => ({
      title: category.category_name,
      content: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.category_name,
      })),
      isLast: index === categoriesData.length - 1,
    }));
  }, [categoriesData]);

  // 스켈레톤 로딩용 고유 ID 생성
  const skeletonIds = useMemo(
    () => Array.from({ length: 5 }, () => crypto.randomUUID()),
    []
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* 헤더 */}
        <div className="mt-[18px] mx-5 pb-[18px] border-b-2 border-[#949494]">
          <h1 className="font-semibold">카테고리</h1>
        </div>
        {/* 카테고리 목록 */}
        <div className="pb-10">
          {isLoading ? (
            <div className="flex flex-col">
              {skeletonIds.map((id) => (
                <div
                  key={id}
                  className="px-5 py-[18px] flex justify-between items-center animate-pulse"
                >
                  <div className="w-24 h-5 bg-[#D9D9D9] rounded" />
                  <div className="w-5 h-5 bg-[#D9D9D9] rounded" />
                </div>
              ))}
            </div>
          ) : categoryItems.length > 0 ? (
            categoryItems.map((item) => (
              <ExpandableCategory
                key={item.title}
                title={item.title}
                content={item.content}
                isLast={item.isLast}
              />
            ))
          ) : (
            <div className="px-5 py-10 flex items-center justify-center">
              <p className="text-sm text-[#8C8C8C]">카테고리가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      {/* 푸터 */}
      <Footer />
    </div>
  );
}

export default CategoriesPage;
