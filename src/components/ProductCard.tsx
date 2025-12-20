"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CartIcon from "@/assets/icon/ic_cart_green_24.svg";
import StarIcon from "@/assets/icon/ic_star_grey_15.svg";
import TimerIcon from "@/assets/icon/ic_timer_green_21.svg";
import { fruits } from "@/assets/images/dummy";
import CartSuccessModal from "@/components/CartSuccessModal";
import ProductOptionModal from "@/components/ProductOptionModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAddToCart } from "@/lib/api/hooks/use-cart";
import { useProductDetail } from "@/lib/api/hooks/use-product-detail";
import type { Product } from "@/lib/api/products";

interface ProductCardProps {
  id?: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountRate?: number;
  tags?: string[];
  isSpecialOffer?: boolean;
  hideCartButton?: boolean;
  farmId?: number;
  farmName?: string;
  // API 데이터를 받을 경우
  product?: Product;
}

function ProductCard({
  id = 1,
  originalPrice = 39800,
  discountedPrice = 17900,
  discountRate = 30,
  tags: _tags = [],
  isSpecialOffer = false,
  hideCartButton = false,
  farmId = 1,
  farmName = "최시온 농장",
  product,
}: ProductCardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isCartSuccessModalOpen, setIsCartSuccessModalOpen] = useState(false);

  // API 데이터가 있으면 사용, 없으면 더미 데이터 사용
  const displayId = product?.id || id;
  const displayFarmId = product?.farm_id || farmId;
  const displayFarmName = product?.farm_name || farmName;
  // API 응답 기준 (일반적인 네이밍과 반대):
  // display_cost_price: 판매가 (더 낮은 가격)
  // display_price: 원가 (더 높은 가격)
  const displayOriginalPrice = product?.display_price || originalPrice; // 원가
  const displayDiscountedPrice = product?.display_cost_price || discountedPrice; // 판매가
  const displayDiscountRate = product?.display_discount_rate || discountRate;
  const displayBadges = product?.badges || [];
  const displayIsSpecialOffer =
    (product?.days_remaining !== null &&
      product?.days_remaining !== undefined &&
      product.days_remaining > 0) ||
    isSpecialOffer;
  const displayImage = product?.main_image;
  const displayProductName =
    product?.product_name || "태국 A급 남독마이 골드망고";
  // 별점을 소수 둘째자리에서 반올림 (4.56 -> 4.6)
  const displayRating = product
    ? Math.round(parseFloat(product.rating_avg) * 10) / 10
    : 4.9;
  // review_count가 0일 수도 있으므로 null/undefined 체크만 수행
  const displayReviewCount =
    product?.review_count !== undefined ? product.review_count : 100;
  const displayFarmProfileImage = product?.farm_profile_image;
  const displayRank = product?.rank;

  const fruit = fruits[(displayId - 1) % fruits.length];
  const hasDiscount =
    displayDiscountRate > 0 && displayDiscountedPrice < displayOriginalPrice;

  // 상품 상세 정보 조회 (모달이 열렸을 때만)
  const { data: productDetail, isLoading: isLoadingProductDetail } =
    useProductDetail(isOptionModalOpen ? displayId : 0);

  // 장바구니 담기 mutation
  const addToCartMutation = useAddToCart();

  // 더미 데이터
  const dummyProductPrice = 39000;
  const dummyProductOptions = [
    { id: "option1", name: "5kg (중소과)", price: 0 },
    { id: "option2", name: "3kg (중과)", price: 5000 },
    { id: "option3", name: "2kg (대과)", price: 8000 },
  ];

  // API 데이터가 있으면 사용, 없으면 더미 데이터 사용
  const isApiData = !!productDetail;
  const productSalePrice =
    productDetail?.display_cost_price || dummyProductPrice;
  const productOptions =
    productDetail?.options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      price: opt.price,
      costPrice: opt.cost_price,
      discountRate: opt.discount_rate,
    })) || dummyProductOptions;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // product가 없으면 API 호출 불가
    if (!product) {
      return;
    }

    // 로그인 체크
    if (!isLoggedIn) {
      router.push(
        `/signin?redirect=${encodeURIComponent(`/products/${displayId}`)}`
      );
      return;
    }

    setIsOptionModalOpen(true);
  };

  const handleOptionModalClose = () => {
    setIsOptionModalOpen(false);
  };

  const handleAddToCart = async (
    selectedOptions: Array<{
      id: string | number;
      name: string;
      price: number;
      quantity: number;
    }>
  ) => {
    if (selectedOptions.length === 0) return;

    try {
      // API 요청 형식으로 변환
      const request = {
        items: selectedOptions.map((option) => ({
          product_option_id: Number(option.id),
          quantity: option.quantity,
        })),
      };

      // 장바구니에 추가
      await addToCartMutation.mutateAsync(request);

      // 성공 시 모달 닫고 장바구니 완료 모달 열기
      setIsOptionModalOpen(false);
      setIsCartSuccessModalOpen(true);
    } catch (error) {
      console.error("장바구니 담기 실패:", error);
      if (error instanceof Error) {
        alert(error.message || "장바구니 담기에 실패했습니다.");
      }
    }
  };

  const handleFarmProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/farms/${displayFarmId}`);
  };

  return (
    <>
      <Link
        href={`/products/${displayId}`}
        className="flex flex-col cursor-pointer"
      >
        {/* 이미지 영역 */}
        <div className="w-full aspect-[1/1] relative bg-[#D9D9D9]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={displayProductName}
              fill
              className="object-cover"
            />
          ) : (
            <Image
              src={fruit.image}
              alt={fruit.name}
              fill
              className="object-cover"
            />
          )}

          {/* Rank 표시 - 좌측 상단 */}
          {displayRank !== undefined && displayRank !== null && (
            <div className="absolute top-0 left-0 w-8 h-8 bg-[#133A1B] flex items-center justify-center z-10">
              <span className="text-white font-bold text-sm">
                {displayRank}
              </span>
            </div>
          )}

          {/* 특가인 경우 - 상단 중앙에 특가 마감 텍스트 */}
          {displayIsSpecialOffer && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 py-1 px-2 z-10">
              <div className="bg-white/80 flex items-center space-x-2 backdrop-blur-sm rounded-[14px] px-3 py-1 border border-white/20 shadow-lg whitespace-nowrap">
                <TimerIcon />
                <span className="text-sm font-bold text-[#133A1B]">
                  {product?.days_remaining !== null &&
                  product?.days_remaining !== undefined &&
                  product.days_remaining > 0
                    ? `${product.days_remaining}일 후 특가 마감`
                    : "3일 후 특가 마감"}
                </span>
              </div>
            </div>
          )}

          {/* 우측 하단에 장바구니 아이콘 */}
          {!hideCartButton && (
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                className="rounded-full bg-white/80 backdrop-blur-sm p-2 border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer"
                onClick={handleCartClick}
                aria-label="장바구니에 추가"
              >
                <CartIcon />
              </button>
            </div>
          )}
        </div>
        {/* 본문 영역 */}
        <div className="flex flex-col px-1 py-3 gap-2">
          {/* 농장 프로필 영역 */}
          <button
            type="button"
            onClick={handleFarmProfileClick}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity bg-transparent border-none p-0 text-left"
            aria-label={`${displayFarmName} 농장 프로필 보기`}
          >
            {displayFarmProfileImage ? (
              <div className="w-7 h-7 bg-[#D9D9D9] rounded-full relative overflow-hidden">
                <Image
                  src={displayFarmProfileImage}
                  alt={displayFarmName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 bg-[#D9D9D9] rounded-full"></div>
            )}
            <div className="text-sm font-semibold text-[#262626]">
              {displayFarmName}
            </div>
          </button>
          {/* 상품명 영역 */}
          <div className="text-[#262626]">{displayProductName}</div>
          {/* 가격 영역 */}
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                {/* 원가 표시 영역 */}
                <div className="text-sm text-[#8C8C8C] line-through">
                  {displayOriginalPrice.toLocaleString()}원
                </div>
                {/* 할인가 표시 영역 */}
                <div className="flex items-center gap-1">
                  {/* 할인율 표시 */}
                  <div className="text-[#FF5266] font-bold">
                    {displayDiscountRate}%
                  </div>
                  {/* 할인가 표시 */}
                  <div className="font-semibold text-[#262626]">
                    {displayDiscountedPrice.toLocaleString()}원
                  </div>
                </div>
              </>
            ) : (
              /* 할인가가 없는 경우 원가만 표시 */
              <div className="font-semibold text-[#262626]">
                {displayOriginalPrice.toLocaleString()}원
              </div>
            )}
          </div>
          {/* 뱃지 영역 */}
          {displayBadges.length > 0 && (
            <div className="flex gap-1">
              {displayBadges.map((badge, index) => (
                <div key={`badge-${badge.name}-${index}`} className="relative">
                  <Image
                    src={badge.image_url}
                    alt={badge.name || `뱃지 ${index + 1}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-auto h-auto max-h-[20px] object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
          {/* 별점 및 리뷰수 영역 */}
          <div className="flex items-center gap-1 text-xs font-medium text-[#8C8C8C]">
            <StarIcon />
            <span>{displayRating.toFixed(1)}</span>
            <span>({displayReviewCount.toLocaleString()})</span>
          </div>
        </div>
      </Link>

      {/* 옵션 선택 모달 */}
      <ProductOptionModal
        isOpen={isOptionModalOpen}
        onClose={handleOptionModalClose}
        productDetail={productDetail || null}
        productSalePrice={productSalePrice}
        productOptions={productOptions}
        isApiData={isApiData}
        onAddToCart={handleAddToCart}
        showPurchaseButton={false}
      />

      {/* 장바구니 담기 완료 모달 */}
      <CartSuccessModal
        isOpen={isCartSuccessModalOpen}
        onClose={() => setIsCartSuccessModalOpen(false)}
      />
    </>
  );
}

export default ProductCard;
