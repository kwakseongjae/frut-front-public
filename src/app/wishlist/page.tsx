"use client";

import { useEffect, useMemo, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserProfile } from "@/lib/api/hooks/use-users";
import { useInfiniteWishlist } from "@/lib/api/hooks/use-wishlist";
import type { Product } from "@/lib/api/products";

function WishlistPage() {
  // 프로필 정보 조회
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  // 찜목록 조회 (무한 스크롤)
  const {
    data: wishlistData,
    isLoading: isWishlistLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteWishlist();

  const observerTarget = useRef<HTMLDivElement>(null);

  const userName = profile?.username || "";
  const displayUserName =
    userName.length > 10 ? `${userName.slice(0, 10)}...` : userName;

  // 모든 페이지의 데이터를 평탄화
  const wishlistItems = useMemo(() => {
    if (!wishlistData?.pages) return [];
    return wishlistData.pages
      .flatMap((page) => page?.results || [])
      .filter((item) => item !== undefined && item !== null);
  }, [wishlistData]);
  const wishlistCount = wishlistItems.length;

  // WishlistItem을 Product 타입으로 변환
  const products: Product[] = wishlistItems
    .filter((item) => item !== undefined && item !== null)
    .map((item) => ({
      id: item.product_id,
      farm_id: item.farm_id,
      farm_name: item.farm_name,
      farm_profile_image: item.farm_image || null,
      category_name: "",
      product_name: item.product_name,
      display_price: item.price,
      display_cost_price: item.cost_price,
      display_discount_rate: item.discount_rate,
      status: "ACTIVE" as const,
      is_recommended: false,
      badges: item.badges || [],
      rating_avg: item.rating_avg,
      review_count: item.review_count,
      view_count: 0,
      days_remaining: null,
      main_image: item.image_url,
      is_wished: true, // 찜목록에 있는 상품은 항상 찜한 상태
      created_at: item.created_at,
      updated_at: item.created_at,
    }));

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

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* 상품 목록 영역 */}
        <div className="flex-1 px-5 pt-3 pb-6">
          {isWishlistLoading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-[#8C8C8C]">찜한 상품이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* 무한 스크롤 감지용 요소 */}
              {hasNextPage && (
                <div
                  ref={observerTarget}
                  className="h-10 flex items-center justify-center"
                >
                  {isFetchingNextPage && (
                    <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default WishlistPage;
