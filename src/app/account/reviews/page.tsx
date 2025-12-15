"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import BentRightDownIcon from "@/assets/icon/ic_bent_right_down_black_24.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_18.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import { fruits } from "@/assets/images/dummy";
import {
  useReviewableItems,
  useWrittenReviews,
} from "@/lib/api/hooks/use-reviews";
import type { WrittenReview as WrittenReviewType } from "@/lib/api/reviews";

interface PurchasedProduct {
  id: number;
  farmName: string;
  productName: string;
  option: string;
  purchaseDate: string;
  image?: string;
  orderItemId: number;
  productId: number;
}

const ReviewsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = (tabParam === "written" ? "written" : "write") as
    | "write"
    | "written";
  const [activeTab, setActiveTab] = useState<"write" | "written">(initialTab);

  const { data: reviewableData, isLoading: isLoadingReviewable } =
    useReviewableItems();
  const { data: writtenReviewsData, isLoading: isLoadingWritten } =
    useWrittenReviews();

  // URL 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const tab = tabParam === "written" ? "written" : "write";
    setActiveTab(tab);
  }, [tabParam]);

  const handleTabClick = (tab: "write" | "written") => {
    setActiveTab(tab);
    // URL 업데이트 (뒤로가기 지원)
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "written") {
      params.set("tab", "written");
    } else {
      params.delete("tab");
    }
    router.replace(`/account/reviews?${params.toString()}`);
  };

  // 작성 가능한 상품 목록 변환
  const availableProducts: PurchasedProduct[] = useMemo(() => {
    if (!reviewableData?.results) {
      return [];
    }

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };

    // 이미지 URL 처리
    const getImageUrl = (imageUrl: string | null) => {
      if (!imageUrl) return null;
      if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
        return imageUrl;
      }
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${imageUrl}`;
    };

    return reviewableData.results.map((item) => ({
      id: item.order_item_id,
      farmName: item.farm_name,
      productName: item.product_name,
      option: item.option_name,
      purchaseDate: formatDate(item.ordered_at),
      image: getImageUrl(item.product_image) || fruits[0]?.image,
      orderItemId: item.order_item_id,
      productId: item.product_id,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewableData]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 이미지 URL 처리
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      return imageUrl;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${imageUrl}`;
  };

  // 작성한 후기 목록 변환
  const writtenReviews: WrittenReviewType[] = useMemo(() => {
    if (!writtenReviewsData?.results) {
      return [];
    }
    return writtenReviewsData.results;
  }, [writtenReviewsData]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <div key={index.toString()} className="w-4 h-4">
        {index < rating ? <StarIcon /> : <EmptyStarIcon />}
      </div>
    ));
  };

  const handleWriteReview = (orderItemId: number) => {
    router.push(`/account/reviews/write/${orderItemId}`);
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
          <h1 className="text-lg font-semibold text-[#262626]">상품후기</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 탭 내비게이션 */}
      <div className="sticky top-[52px] z-10 bg-white border-b-2 border-[#E5E5E5]">
        <div className="flex">
          <button
            type="button"
            onClick={() => handleTabClick("write")}
            className={`flex-1 py-4 text-sm font-medium relative ${
              activeTab === "write" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="상품후기 작성"
          >
            상품후기 작성
            {activeTab === "write" && (
              <div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("written")}
            className={`flex-1 py-4 text-sm font-medium relative ${
              activeTab === "written" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="작성한 상품후기"
          >
            작성한 상품후기
            {activeTab === "written" && (
              <div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
            )}
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1">
        {activeTab === "write" ? (
          <div className="flex flex-col">
            {isLoadingReviewable ? (
              <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
                <p className="font-medium text-[#8C8C8C]">로딩 중...</p>
              </div>
            ) : availableProducts.length > 0 ? (
              <div className="flex flex-col divide-y divide-[#E5E5E5]">
                {availableProducts.map((product) => (
                  <div key={product.id} className="px-5 py-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        {/* 상품 이미지 */}
                        <div className="w-[100px] h-[100px] bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.productName}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* 상품 정보 */}
                        <div className="flex flex-col flex-1 gap-1">
                          <span className="text-sm text-[#262626]">
                            {product.farmName}
                          </span>
                          <span className="text-sm text-[#262626]">
                            {product.productName}
                          </span>
                          <span className="text-sm text-[#262626]">
                            {product.option}
                          </span>
                          <span className="text-sm text-[#8C8C8C]">
                            구매일: {product.purchaseDate}
                          </span>
                        </div>
                      </div>

                      {/* 후기 작성하기 버튼 */}
                      <button
                        type="button"
                        onClick={() => handleWriteReview(product.orderItemId)}
                        className="w-full py-2.5 bg-[#133A1B] text-white text-sm font-medium"
                        aria-label="후기 작성하기"
                      >
                        후기 작성하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
                <p className="font-medium text-[#8C8C8C]">
                  작성 가능한 상품후기가 없습니다.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {isLoadingWritten ? (
              <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
                <p className="font-medium text-[#8C8C8C]">로딩 중...</p>
              </div>
            ) : writtenReviews.length > 0 ? (
              <div className="flex flex-col">
                {writtenReviews.map((review, index) => (
                  <div key={review.id}>
                    <div className="px-5 py-4">
                      {/* 사용자명 */}
                      <div className="mb-2">
                        <span className="text-sm font-medium text-[#262626]">
                          {review.user_name}
                        </span>
                      </div>

                      {/* 별점과 날짜 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-xs text-[#8C8C8C]">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* 상품명 */}
                      <div className="mb-3">
                        <span className="text-sm text-[#8C8C8C]">
                          {review.product_name}
                        </span>
                      </div>

                      {/* 상품 이미지와 상세 정보 */}
                      <div className="flex gap-4 mb-3">
                        {/* 상품 이미지 */}
                        {review.image_url && (
                          <div className="w-20 h-20 bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
                            <Image
                              src={getImageUrl(review.image_url) || ""}
                              alt={review.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* 상품 상세 정보 */}
                        <div className="flex flex-col gap-1 flex-1">
                          {review.reply && (
                            <>
                              <span className="text-xs text-[#8C8C8C]">
                                {review.reply.farm_name}
                              </span>
                              <span className="text-xs text-[#8C8C8C]">
                                {review.product_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 후기 내용 */}
                      <p className="text-sm text-[#262626] leading-relaxed mb-3 whitespace-pre-line">
                        {review.review_content}
                      </p>

                      {/* 답변 (있는 경우) */}
                      {review.reply && (
                        <div className="mt-3">
                          <div className="flex items-start gap-2 mb-2">
                            {/* 휘어있는 아이콘 */}
                            <div className="flex-shrink-0 mt-0.5">
                              <BentRightDownIcon />
                            </div>
                            {/* 프로필 이미지와 농장명 */}
                            <div className="flex items-center gap-2">
                              {/* 농장 아바타 */}
                              <div className="w-8 h-8 rounded-full bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                                {review.reply.farm_image ? (
                                  <Image
                                    src={
                                      getImageUrl(review.reply.farm_image) || ""
                                    }
                                    alt={review.reply.farm_name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-[#D9D9D9]" />
                                )}
                              </div>
                              {/* 농장명 */}
                              <span className="text-sm font-medium text-[#262626]">
                                {review.reply.farm_name}
                              </span>
                            </div>
                          </div>
                          {/* 답변 내용 (회색 배경 박스) */}
                          <div className="ml-[32px] bg-[#F5F5F5] rounded p-3">
                            <p className="text-sm text-[#262626] leading-relaxed whitespace-pre-line">
                              {review.reply.reply_content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {index < writtenReviews.length - 1 && (
                      <div className="h-[10px] bg-[#F7F7F7]" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
                <p className="font-medium text-[#8C8C8C]">
                  작성한 상품 후기가 없습니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewsPageContent />
    </Suspense>
  );
};

export default ReviewsPage;
