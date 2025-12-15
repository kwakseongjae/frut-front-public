"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_18.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import { fruits } from "@/assets/images/dummy";
import { useProductReviews } from "@/lib/api/hooks/use-product-reviews";
import ReviewImageViewer from "./ReviewImageViewer";

interface ProductReviewsProps {
  productId: number;
  reviewCount: number;
  ratingAvg: string;
}

const ProductReviews = ({
  productId,
  reviewCount,
  ratingAvg,
}: ProductReviewsProps) => {
  const router = useRouter();
  const [filterType, setFilterType] = useState<"all" | "photo" | "text">("all");
  const [sortBy, setSortBy] = useState<"latest" | "rating">("latest");
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 리뷰 목록 조회
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useProductReviews(productId);

  // 모든 페이지의 리뷰를 평탄화
  const allReviews = useMemo(() => {
    if (!reviewsData?.pages || reviewsData.pages.length === 0) {
      return [];
    }
    const reviews = reviewsData.pages.flatMap((page) => {
      if (!page || !page.results) return [];
      return Array.isArray(page.results) ? page.results : [];
    });
    return reviews;
  }, [reviewsData]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 평균 평점을 숫자로 변환
  const numericRatingAvg = useMemo(() => {
    return parseFloat(ratingAvg) || 0;
  }, [ratingAvg]);

  const renderStars = (rating: number) => {
    const flooredRating = Math.floor(rating);
    return Array.from({ length: 5 }, (_, index) => (
      <div key={index.toString()} className="w-4 h-4">
        {index < flooredRating ? <StarIcon /> : <EmptyStarIcon />}
      </div>
    ));
  };

  const handleFilterChange = (filterType: "all" | "photo" | "text") => {
    setFilterType(filterType);
  };

  const handleSortChange = (sortType: "latest" | "rating") => {
    setSortBy(sortType);
  };

  const handleImageClick = (images: string[], index: number) => {
    setViewerImages(images);
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  // 필터링된 리뷰
  const filteredReviews = useMemo(() => {
    return allReviews.filter((review) => {
      if (filterType === "photo") {
        return review.image_url !== null;
      } else if (filterType === "text") {
        return review.image_url === null;
      }
      return true; // all
    });
  }, [allReviews, filterType]);

  // 정렬된 리뷰
  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort((a, b) => {
      if (sortBy === "latest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return b.rating - a.rating;
      }
    });
  }, [filteredReviews, sortBy]);

  // 더미 이미지 생성 (20개)
  const dummyReviewImages = useMemo(() => {
    const images: string[] = [];
    for (let i = 0; i < 20; i++) {
      images.push(fruits[i % fruits.length]?.image || "");
    }
    return images.filter(Boolean);
  }, []);

  // 리뷰 이미지 수집 (이미지가 있는 리뷰만, 없으면 더미 이미지 사용)
  const reviewImages = useMemo(() => {
    const actualImages = allReviews
      .filter((review) => review.image_url !== null)
      .map((review) => review.image_url as string);

    // 실제 이미지가 없으면 더미 이미지 사용
    if (actualImages.length === 0) {
      return dummyReviewImages.slice(0, 4); // 최대 4개만 표시
    }

    return actualImages.slice(0, 4);
  }, [allReviews, dummyReviewImages]);

  // 전체 리뷰 이미지 개수
  const totalReviewImages = useMemo(() => {
    const actualCount = allReviews.filter(
      (review) => review.image_url !== null
    ).length;
    // 실제 이미지가 없으면 더미 이미지 개수 사용
    return actualCount > 0 ? actualCount : dummyReviewImages.length;
  }, [allReviews, dummyReviewImages]);

  const handleViewMoreImages = () => {
    router.push(`/products/${productId}/reviews`);
  };

  // 무한 스크롤을 위한 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
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
    <div className="flex flex-col">
      {/* 리뷰 통계 */}
      <div className="px-5 py-4 border-b border-[#D9D9D9]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[#262626]">
            상품후기 ({reviewCount.toLocaleString()})
          </h3>
        </div>

        {/* 평점 요약 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {renderStars(numericRatingAvg)}
          </div>
          <span className="text-lg font-bold text-[#262626]">
            {numericRatingAvg.toFixed(1)} / 5
          </span>
        </div>

        {/* 리뷰 이미지 미리보기 */}
        {reviewImages.length > 0 && (
          <div className="flex gap-2">
            {reviewImages.slice(0, 3).map((image) => {
              const imageIndex = reviewImages.indexOf(image);
              return (
                <button
                  key={`preview-${image}`}
                  type="button"
                  onClick={() => {
                    const actualImages = allReviews
                      .filter((r) => r.image_url !== null)
                      .map((r) => r.image_url as string);
                    const allImages =
                      actualImages.length > 0
                        ? actualImages
                        : dummyReviewImages;
                    handleImageClick(allImages, allImages.indexOf(image));
                  }}
                  className="w-[calc((100%-16px)/4)] aspect-square rounded relative overflow-hidden bg-[#D9D9D9] flex-shrink-0 cursor-pointer"
                  aria-label={`리뷰 이미지 미리보기 ${imageIndex + 1}`}
                >
                  <Image
                    src={image}
                    alt={`리뷰 이미지 미리보기 ${imageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              );
            })}
            {totalReviewImages >= 4 && (
              <button
                type="button"
                onClick={handleViewMoreImages}
                className="w-[calc((100%-16px)/4)] aspect-square rounded relative overflow-hidden bg-[#8C8C8C] flex-shrink-0 cursor-pointer flex items-center justify-center"
                aria-label="더보기"
              >
                <span className="text-white text-xs font-medium">+더보기</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 필터 및 정렬 옵션 */}
      <div className="px-5 py-3 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-between">
          {/* 좌측 필터 */}
          <div className="flex items-center gap-4">
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
            <span className="text-[#D9D9D9]">|</span>
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
            <span className="text-[#D9D9D9]">|</span>
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
        {(isLoading || (isFetching && !reviewsData)) &&
        sortedReviews.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#8C8C8C]">
            리뷰를 불러오는 중...
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#8C8C8C]">
            등록된 리뷰가 없습니다.
          </div>
        ) : (
          <>
            {sortedReviews.map((review) => {
              const reviewImages = review.image_url ? [review.image_url] : [];

              return (
                <div key={review.id} className="px-5 py-4">
                  {/* 리뷰 헤더 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#262626]">
                        {review.user_name}
                      </span>
                    </div>
                    <span className="text-xs text-[#8C8C8C]">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {/* 별점 */}
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>

                  {/* 구매 상품 정보 */}
                  <div className="mb-2">
                    <span className="text-xs text-[#8C8C8C]">
                      {review.product_name}
                    </span>
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-sm text-[#262626] mb-3 leading-relaxed whitespace-pre-line">
                    {review.review_content}
                  </p>

                  {/* 리뷰 이미지 */}
                  {reviewImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
                      {reviewImages.map((image, index) => (
                        <button
                          key={`${review.id}-${index}`}
                          type="button"
                          onClick={() => handleImageClick(reviewImages, index)}
                          className="w-20 h-20 rounded relative overflow-hidden flex-shrink-0 cursor-pointer aspect-square"
                          aria-label={`리뷰 이미지 ${index + 1} 보기`}
                        >
                          <Image
                            src={image}
                            alt={`리뷰 이미지 ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 판매자 답변 */}
                  {review.reply && (
                    <div className="mt-3 p-3 bg-[#F8F8F8] rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#133A1B]">
                          판매자
                        </span>
                        <span className="text-xs text-[#8C8C8C]">
                          {formatDate(review.reply.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#262626] leading-relaxed whitespace-pre-line">
                        {review.reply.reply_content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 무한 스크롤 트리거 */}
            {hasNextPage && (
              <div
                ref={observerTarget}
                className="h-10 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <span className="text-xs text-[#8C8C8C]">
                    더 불러오는 중...
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 전체화면 이미지 뷰어 */}
      <ReviewImageViewer
        images={viewerImages}
        initialIndex={viewerInitialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

export default ProductReviews;
