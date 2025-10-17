"use client";

import Image from "next/image";
import { useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_18.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import { fruits } from "@/assets/images/dummy";

interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  content: string;
  images?: string[];
  productName: string;
}

const ProductReviews = () => {
  const [filterType, setFilterType] = useState<"all" | "photo" | "text">("all");
  const [sortBy, setSortBy] = useState<"latest" | "rating">("latest");

  // 샘플 리뷰 데이터
  const sampleReviews: Review[] = [
    {
      id: 1,
      userName: "김**",
      rating: 5,
      date: "2024.01.15",
      content:
        "정말 달고 맛있어요! 가족들이 다 좋아하네요. 다음에도 주문할 예정입니다.",
      images: [fruits[0].image, fruits[1].image],
      productName: "제주 감귤 5kg",
    },
    {
      id: 2,
      userName: "이**",
      rating: 4,
      date: "2024.01.14",
      content: "품질이 좋고 신선해요. 포장도 깔끔하게 잘 되어있었습니다.",
      productName: "제주 감귤 5kg",
    },
    {
      id: 3,
      userName: "박**",
      rating: 5,
      date: "2024.01.13",
      content: "배송이 빠르고 상품 상태가 완벽했어요. 추천합니다!",
      images: [fruits[2].image],
      productName: "제주 감귤 5kg",
    },
    {
      id: 4,
      userName: "최**",
      rating: 3,
      date: "2024.01.12",
      content: "전반적으로 만족하지만 일부 과일이 작았어요.",
      productName: "제주 감귤 5kg",
    },
    {
      id: 5,
      userName: "정**",
      rating: 5,
      date: "2024.01.11",
      content: "가격 대비 품질이 정말 좋네요. 다음에도 주문할게요!",
      images: [fruits[3].image, fruits[4].image, fruits[5].image],
      productName: "제주 감귤 5kg",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <div key={index.toString()} className="w-4 h-4">
        {index < rating ? <StarIcon /> : <EmptyStarIcon />}
      </div>
    ));
  };

  const handleFilterChange = (filterType: "all" | "photo" | "text") => {
    setFilterType(filterType);
  };

  const handleSortChange = (sortType: "latest" | "rating") => {
    setSortBy(sortType);
  };

  // 필터링된 리뷰
  const filteredReviews = sampleReviews.filter((review) => {
    if (filterType === "photo") {
      return review.images && review.images.length > 0;
    } else if (filterType === "text") {
      return !review.images || review.images.length === 0;
    }
    return true; // all
  });

  // 정렬된 리뷰
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  return (
    <div className="flex flex-col">
      {/* 리뷰 통계 */}
      <div className="px-5 py-4 border-b border-[#D9D9D9]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[#262626]">
            상품후기 ({sampleReviews.length.toLocaleString()})
          </h3>
        </div>

        {/* 평점 요약 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">{renderStars(4)}</div>
          <span className="text-lg font-bold text-[#262626]">4.6 / 5</span>
        </div>
      </div>

      {/* 필터 및 정렬 옵션 */}
      <div className="px-5 py-3 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-between">
          {/* 좌측 필터 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className={`text-sm ${
                filterType === "all"
                  ? "text-[#133A1B] font-semibold"
                  : "text-[#8C8C8C]"
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("photo")}
              className={`text-sm ${
                filterType === "photo"
                  ? "text-[#133A1B] font-semibold"
                  : "text-[#8C8C8C]"
              }`}
            >
              포토
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("text")}
              className={`text-sm ${
                filterType === "text"
                  ? "text-[#133A1B] font-semibold"
                  : "text-[#8C8C8C]"
              }`}
            >
              일반
            </button>
          </div>

          {/* 우측 드롭다운 정렬 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as "latest" | "rating")
              }
              className="text-sm text-[#8C8C8C] bg-transparent border-none outline-none appearance-none pr-6"
            >
              <option value="latest">최신순</option>
              <option value="rating">평점순</option>
            </select>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRightIcon className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="flex flex-col divide-y divide-[#D9D9D9]">
        {sortedReviews.map((review) => (
          <div key={review.id} className="px-5 py-4">
            {/* 리뷰 헤더 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#262626]">
                  {review.userName}
                </span>
              </div>
              <span className="text-xs text-[#8C8C8C]">{review.date}</span>
            </div>

            {/* 별점 */}
            <div className="flex items-center gap-1 mb-1">
              {renderStars(review.rating)}
            </div>

            {/* 구매 상품 정보 */}
            <div className="mb-2">
              <span className="text-xs text-[#8C8C8C]">
                {review.productName}
              </span>
            </div>

            {/* 리뷰 내용 */}
            <p className="text-sm text-[#262626] mb-3 leading-relaxed">
              {review.content}
            </p>

            {/* 리뷰 이미지 */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2">
                {review.images.map((image, index) => (
                  <div
                    key={image}
                    className="w-16 h-16 rounded relative overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`리뷰 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
