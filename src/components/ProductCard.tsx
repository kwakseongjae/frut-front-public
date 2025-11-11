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
import { fruits } from "@/assets/images/dummy";

gsap.registerPlugin(useGSAP);

interface ProductCardProps {
  id?: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountRate?: number;
  tags?: string[];
  isSpecialOffer?: boolean;
}

function ProductCard({
  id = 1,
  originalPrice = 39800,
  discountedPrice = 17900,
  discountRate = 30,
  tags = ["고당도", "특가"],
  isSpecialOffer = false,
}: ProductCardProps) {
  const fruit = fruits[(id - 1) % fruits.length];
  const hasDiscount = discountRate > 0 && discountedPrice < originalPrice;
  const [isInCart, setIsInCart] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: cartButtonRef });

  const handleCartClick = contextSafe((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart) {
      // 장바구니에서 제거 - 애니메이션 없이 즉시 변경
      setIsInCart(false);
      console.log("장바구니에서 제거:", id);
    } else if (!isAnimating) {
      // 장바구니에 추가 - GSAP 애니메이션과 함께
      setIsAnimating(true);
      if (cartIconRef.current) {
        // 인스타그램 좋아요 스타일 애니메이션 (CartFilledIcon으로)
        gsap.fromTo(
          cartIconRef.current,
          {
            scale: 1,
            rotation: 0,
          },
          {
            scale: 1.3,
            rotation: 10,
            duration: 0.1,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(cartIconRef.current, {
                scale: 0.9,
                rotation: -5,
                duration: 0.1,
                ease: "power2.out",
                onComplete: () => {
                  gsap.to(cartIconRef.current, {
                    scale: 1.1,
                    rotation: 3,
                    duration: 0.1,
                    ease: "power2.out",
                    onComplete: () => {
                      gsap.to(cartIconRef.current, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.2,
                        ease: "elastic.out(1, 0.3)",
                        onComplete: () => {
                          setIsInCart(true);
                          setIsAnimating(false);
                        },
                      });
                    },
                  });
                },
              });
            },
          }
        );
      }
      console.log("장바구니에 추가:", id);
    }
  });

  return (
    <Link href={`/products/${id}`} className="flex flex-col cursor-pointer">
      {/* 이미지 영역 */}
      <div className="w-full aspect-[1/1] relative">
        <Image
          src={fruit.image}
          alt={fruit.name}
          fill
          className="object-cover"
        />

        {/* 특가인 경우 - 상단 중앙에 특가 마감 텍스트 */}
        {isSpecialOffer && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 py-1 px-2">
            <div className="bg-white/80 flex items-center space-x-2 backdrop-blur-sm rounded-[14px] px-3 py-1 border border-white/20 shadow-lg whitespace-nowrap">
              <TimerIcon />
              <span className="text-sm font-bold text-[#133A1B]">
                3일 후 특가 마감
              </span>
            </div>
          </div>
        )}

        {/* 특가가 아닌 경우 - 우측 하단에 장바구니 아이콘 */}
        {!isSpecialOffer && (
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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#D9D9D9] rounded-full"></div>
          <div className="text-sm font-semibold text-[#262626]">
            최시온 농장
          </div>
        </div>
        {/* 상품명 영역 */}
        <div className="text-[#262626]">태국 A급 남독마이 골드망고</div>
        {/* 가격 영역 */}
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              {/* 원가 표시 영역 */}
              <div className="text-sm text-[#8C8C8C] line-through">
                {originalPrice.toLocaleString()}원
              </div>
              {/* 할인가 표시 영역 */}
              <div className="flex items-center gap-1">
                {/* 할인율 표시 */}
                <div className="text-[#FF5266] font-bold">{discountRate}%</div>
                {/* 할인가 표시 */}
                <div className="font-semibold text-[#262626]">
                  {discountedPrice.toLocaleString()}원
                </div>
              </div>
            </>
          ) : (
            /* 할인가가 없는 경우 원가만 표시 */
            <div className="font-semibold text-[#262626]">
              {originalPrice.toLocaleString()}원
            </div>
          )}
        </div>
        {/* 태그 목록 영역 */}
        {tags && tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map((tag, index) => {
              const tagColors = [
                "border-[#F58376] text-[#F58376]",
                "border-[#657BFF] text-[#657BFF]",
                "border-[#FF6B6B] text-[#FF6B6B]",
                "border-[#4ECDC4] text-[#4ECDC4]",
              ];
              const colorClass = tagColors[index % tagColors.length];

              return (
                <div key={`tag-${tag}`} className="flex justify-center">
                  <div
                    className={`border px-[6px] py-[2px] text-[8px] font-medium ${colorClass}`}
                  >
                    {tag}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* 별점 및 리뷰수 영역 */}
        <div className="flex items-center gap-1 text-xs font-medium text-[#8C8C8C]">
          <StarIcon />
          <span>4.9</span>
          <span>(100)</span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
