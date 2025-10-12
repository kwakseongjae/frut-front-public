"use client";

import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";

// 카테고리 정보 타입 정의
interface CategoryInfo {
  title: string;
  description?: string;
}

// 카테고리 정보 매핑
const categoryMap: Record<string, CategoryInfo> = {
  "special-offers": {
    title: "특가",
  },
  "weekly-best": {
    title: "이번주 베스트",
  },
  "real-time-popular": {
    title: "실시간 인기상품",
  },
  recommended: {
    title: "추천상품",
  },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const categoryInfo = categoryMap[slug];

  // 카테고리가 존재하지 않는 경우
  if (!categoryInfo) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4">
          <button onClick={() => window.history.back()} className="p-1">
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

  // 더미 상품 데이터 (실제로는 API에서 가져올 데이터)
  const products = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `${categoryInfo.title} 상품 ${index + 1}`,
    price: Math.floor(Math.random() * 100000) + 10000,
    originalPrice: Math.floor(Math.random() * 150000) + 15000,
    discount: Math.floor(Math.random() * 50) + 10,
    image: "/placeholder-product.jpg",
    rating: Math.floor(Math.random() * 5) + 1,
    reviewCount: Math.floor(Math.random() * 1000) + 10,
  }));

  return (
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">
            {categoryInfo.title}
          </h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 상품 목록 영역 */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
      </div>
    </div>
  );
}
