"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import CartIcon from "@/assets/icon/ic_cart_24.svg";
import CartFilledIcon from "@/assets/icon/ic_cart_green_filled_24.svg";
import StarIcon from "@/assets/icon/ic_star_grey_15.svg";
import TimerIcon from "@/assets/icon/ic_timer_green_21.svg";
import type { Product } from "@/lib/api/products";

gsap.registerPlugin(useGSAP);

interface ProductCardFromApiProps {
  product: Product;
  hideCartButton?: boolean;
}

const ProductCardFromApi = ({
  product,
  hideCartButton = false,
}: ProductCardFromApiProps) => {
  const hasDiscount =
    product.display_discount_rate > 0 &&
    product.display_price < product.display_cost_price;
  const [isInCart, setIsInCart] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: cartButtonRef });

  const handleCartClick = contextSafe((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart) {
      setIsInCart(false);
    } else if (!isAnimating) {
      setIsAnimating(true);
      if (cartIconRef.current) {
        gsap.fromTo(
          cartIconRef.current,
          { scale: 1, rotation: 0 },
          {
            scale: 1.3,
            rotation: 360,
            duration: 0.3,
            ease: "back.out(1.7)",
            onComplete: () => {
              setIsInCart(true);
              setIsAnimating(false);
            },
          }
        );
      } else {
        setIsInCart(true);
        setIsAnimating(false);
      }
    }
  });

  const handleFarmProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: 농장 프로필 페이지로 이동
  };

  const imageUrl = product.main_image;
  const discountRate = product.display_discount_rate;
  const originalPrice = product.display_cost_price;
  const discountedPrice = product.display_price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex flex-col cursor-pointer"
    >
      {/* 이미지 영역 */}
      <div className="w-full aspect-[1/1] relative bg-[#D9D9D9]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.product_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8C8C8C] text-sm">
            이미지 없음
          </div>
        )}

        {/* 특가인 경우 - 상단 중앙에 특가 마감 텍스트 */}
        {product.days_remaining !== null && product.days_remaining > 0 && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 py-1 px-2">
            <div className="bg-white/80 flex items-center space-x-2 backdrop-blur-sm rounded-[14px] px-3 py-1 border border-white/20 shadow-lg whitespace-nowrap">
              <TimerIcon />
              <span className="text-sm font-bold text-[#133A1B]">
                {product.days_remaining}일 후 특가 마감
              </span>
            </div>
          </div>
        )}

        {/* 우측 하단에 장바구니 아이콘 */}
        {!hideCartButton && (
          <div className="absolute right-3 bottom-3">
            <button
              ref={cartButtonRef}
              type="button"
              className="rounded-full bg-white/80 backdrop-blur-sm p-2 border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer"
              onClick={handleCartClick}
            >
              <div ref={cartIconRef}>
                {isAnimating || isInCart ? <CartFilledIcon /> : <CartIcon />}
              </div>
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
          className="flex items-center gap-2 self-start cursor-pointer hover:opacity-70 transition-opacity"
        >
          {product.farm_profile_image ? (
            <div className="w-6 h-6 rounded-full bg-[#D9D9D9] relative overflow-hidden">
              <Image
                src={product.farm_profile_image}
                alt={product.farm_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#D9D9D9]" />
          )}
          <span className="text-xs font-medium text-[#8C8C8C]">
            {product.farm_name}
          </span>
        </button>

        {/* 상품명 영역 */}
        <h3 className="text-sm font-medium text-[#262626] line-clamp-2">
          {product.product_name}
        </h3>

        {/* 가격 영역 */}
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-base font-semibold text-[#262626]">
                {discountedPrice.toLocaleString()}원
              </span>
              <span className="text-sm font-medium text-[#8C8C8C] line-through">
                {originalPrice.toLocaleString()}원
              </span>
              <span className="text-xs font-semibold text-[#F58376]">
                {discountRate}%
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-[#262626]">
              {originalPrice.toLocaleString()}원
            </span>
          )}
        </div>

        {/* 태그 목록 영역 */}
        {product.badges && product.badges.length > 0 && (
          <div className="flex gap-1">
            {product.badges.map((badge, index) => {
              const tagColors = [
                "border-[#F58376] text-[#F58376]",
                "border-[#657BFF] text-[#657BFF]",
                "border-[#FF6B6B] text-[#FF6B6B]",
                "border-[#4ECDC4] text-[#4ECDC4]",
              ];
              const colorClass = tagColors[index % tagColors.length];

              return (
                <div key={`tag-${badge}`} className="flex justify-center">
                  <div
                    className={`border px-[6px] py-[2px] text-[8px] font-medium ${colorClass}`}
                  >
                    {badge}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 별점 및 리뷰수 영역 */}
        <div className="flex items-center gap-1 text-xs font-medium text-[#8C8C8C]">
          <StarIcon />
          <span>{parseFloat(product.rating_avg).toFixed(1)}</span>
          <span>({product.review_count})</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCardFromApi;
