"use client";

import ProductCard from "@/components/ProductCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserProfile } from "@/lib/api/hooks/use-users";
import { useWishlist } from "@/lib/api/hooks/use-wishlist";
import type { Product } from "@/lib/api/products";

function WishlistPage() {
  // 프로필 정보 조회
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  // 찜목록 조회
  const { data: wishlistItems, isLoading: isWishlistLoading } = useWishlist();

  const userName = profile?.username || "";
  const displayUserName =
    userName.length > 10 ? `${userName.slice(0, 10)}...` : userName;
  const wishlistCount = wishlistItems?.length || 0;

  // WishlistItem을 Product 타입으로 변환
  const products: Product[] =
    wishlistItems?.map((item) => ({
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
    })) || [];

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* 유저 정보 영역 */}
        <div className="px-5 py-2">
          <div className="flex flex-col">
            {isProfileLoading ? (
              <h2 className="text-lg font-semibold text-[#262626] flex items-center">
                <span className="text-[#8C8C8C]">로딩 중...</span>
              </h2>
            ) : (
              <h2 className="text-lg font-semibold text-[#262626] flex items-center">
                <span className="text-[#277937]">{displayUserName}</span>
                <span>님이 찜한 상품</span>
              </h2>
            )}
            <p className="text-sm text-[#8C8C8C] mt-1">
              총 <span className="text-[#262626]">{wishlistCount}</span>개의
              상품이 찜해져 있습니다
            </p>
          </div>
        </div>

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
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default WishlistPage;
