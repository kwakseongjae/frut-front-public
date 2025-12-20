"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartIcon from "@/assets/icon/ic_cart_green_24.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_black_24.svg";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";
import SmallCloseIcon from "@/assets/icon/ic_close_grey_10.svg";
import HeartIcon from "@/assets/icon/ic_heart_24.svg";
import HeartGreenIcon from "@/assets/icon/ic_heart_green_24.svg";
import MinusIcon from "@/assets/icon/ic_minus_black_15.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_15.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import ShareIcon from "@/assets/icon/ic_upload_black_24.svg";
import { fruits } from "@/assets/images/dummy";
import ProductDetailImage from "@/assets/images/product_detail.png";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ProductReviews from "@/components/ProductReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useAddToCart } from "@/lib/api/hooks/use-cart";
import { useProductDetail } from "@/lib/api/hooks/use-product-detail";
import {
  useAddToWishlist,
  useDeleteFromWishlist,
} from "@/lib/api/hooks/use-wishlist";

gsap.registerPlugin(useGSAP);

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"detail" | "review">("detail");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{
      id: string | number;
      name: string;
      price: number;
      quantity: number;
    }>
  >([]);
  const [isOptionExpanded, setIsOptionExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const heartButtonRef = useRef<HTMLButtonElement>(null);
  const heartIconRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { contextSafe } = useGSAP({ scope: heartButtonRef });

  // API에서 상품 정보 가져오기
  const numericProductId = parseInt(productId, 10);
  const { data: productDetail, isLoading: isLoadingProduct } =
    useProductDetail(numericProductId);

  // 찜하기 mutation
  const addToWishlistMutation = useAddToWishlist();
  const deleteFromWishlistMutation = useDeleteFromWishlist();

  // 장바구니 담기 mutation
  const addToCartMutation = useAddToCart();

  // 더미 데이터 (API 데이터가 없을 때 사용)
  const dummyProductPrice = 39000;
  const dummyProductOptions = [
    { id: "option1", name: "5kg (중소과)", price: 0 },
    { id: "option2", name: "3kg (중과)", price: 5000 },
    { id: "option3", name: "2kg (대과)", price: 8000 },
  ];

  // API 데이터가 있으면 사용, 없으면 더미 데이터 사용
  const isApiData = !!productDetail;
  // API 응답 기준 (일반적인 네이밍과 반대):
  // display_cost_price: 판매가 (더 낮은 가격, 예: 700원)
  // display_price: 원가 (더 높은 가격, 예: 800원)
  // 옵션의 cost_price: 판매가 (예: 700원)
  // 옵션의 price: 원가 (예: 800원)
  const productSalePrice =
    productDetail?.display_cost_price || dummyProductPrice; // 판매가
  const productOriginalPrice =
    productDetail?.display_price || dummyProductPrice; // 원가
  const productOptions =
    productDetail?.options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      price: opt.price, // 옵션의 판매가 (test.html 기준)
      costPrice: opt.cost_price, // 옵션의 원가 (test.html 기준)
      discountRate: opt.discount_rate, // 옵션의 할인율
    })) || dummyProductOptions;
  // 이미지를 sort_order 순서로 정렬하고 ProductImageCarousel 형식으로 변환
  const productImages =
    productDetail?.images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        image: img.image_url,
      })) || [];
  const farmId = productDetail?.farm_id;
  const farmName = productDetail?.farm_name || "최시온 농장";
  const farmImage = productDetail?.farm_image;
  const productName =
    productDetail?.product_name || "태국 A급 남독마이 골드망고";
  const ratingAvg = productDetail ? parseFloat(productDetail.rating_avg) : 4.9;
  const reviewCount = productDetail?.review_count ?? 0;
  const isSpecial = productDetail?.is_special || false;
  const daysRemaining = productDetail?.days_remaining ?? null;

  // 찜하기 상태 초기화
  useEffect(() => {
    if (productDetail) {
      setIsFavorite(productDetail.is_wished);
    }
  }, [productDetail]);

  const handlePurchaseClick = () => {
    // 플로팅 구매하기 버튼은 로그인 체크 없이 옵션 선택 모달만 열기
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsOptionExpanded(false);
    setSelectedOptions([]);
  };

  const handleOptionSelect = (optionId: string | number) => {
    const option = productOptions.find((opt) => opt.id === optionId);
    if (option) {
      // 이미 선택된 옵션인지 확인
      const existingOption = selectedOptions.find((opt) => opt.id === optionId);
      if (existingOption) {
        // 이미 있으면 수량만 증가
        setSelectedOptions((prev) =>
          prev.map((opt) =>
            opt.id === optionId ? { ...opt, quantity: opt.quantity + 1 } : opt
          )
        );
      } else {
        // 새로 추가
        setSelectedOptions((prev) => [...prev, { ...option, quantity: 1 }]);
      }
    }
    setIsOptionExpanded(false);
  };

  const handleQuantityChange = (optionId: string | number, change: number) => {
    setSelectedOptions(
      (prev) =>
        prev
          .map((opt) => {
            if (opt.id === optionId) {
              const newQuantity = opt.quantity + change;
              if (newQuantity < 1) {
                // 수량이 0이 되면 해당 옵션을 제거
                return null;
              }
              return { ...opt, quantity: newQuantity };
            }
            return opt;
          })
          .filter((opt) => opt !== null) as Array<{
          id: string | number;
          name: string;
          price: number;
          quantity: number;
        }>
    );
  };

  const handleRemoveOption = (optionId: string | number) => {
    setSelectedOptions((prev) => prev.filter((opt) => opt.id !== optionId));
  };

  const handleAddToCart = async () => {
    // 로그인 체크
    if (!isLoggedIn) {
      // 상품 상세 페이지로 리다이렉트하도록 redirect 파라미터 설정
      router.push(
        `/signin?redirect=${encodeURIComponent(
          `/products/${numericProductId}`
        )}`
      );
      return;
    }

    // 옵션이 선택되지 않은 경우
    if (selectedOptions.length === 0) {
      return;
    }

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

      // 성공 시 모달 닫고 장바구니 모달 열기
      handleModalClose();
      setIsCartModalOpen(true);
    } catch (error) {
      console.error("장바구니 담기 실패:", error);
      // 에러 처리 (필요시 토스트 메시지 표시 등)
      if (error instanceof Error) {
        alert(error.message || "장바구니 담기에 실패했습니다.");
      }
    }
  };

  const handlePurchase = () => {
    // 옵션 상태를 sessionStorage에 저장 (로그인 여부와 관계없이)
    if (selectedOptions.length > 0) {
      // 직접 구매 모드이므로 장바구니 모드 정보 삭제
      sessionStorage.removeItem("pendingCartPurchase");
      sessionStorage.setItem(
        "pendingPurchase",
        JSON.stringify({
          productId: numericProductId,
          options: selectedOptions,
        })
      );
    }
    // 로그인 체크
    if (!isLoggedIn) {
      // 결제 페이지로 리다이렉트하도록 redirect 파라미터 설정
      router.push(`/signin?redirect=${encodeURIComponent("/ordersheet")}`);
      return;
    }
    // 구매하기 로직 - 결제 페이지로 이동
    router.push("/ordersheet");
  };

  const handleCartModalClose = () => {
    setIsCartModalOpen(false);
  };

  const handleContinueShopping = () => {
    setIsCartModalOpen(false);
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  const getTotalQuantity = () => {
    return selectedOptions.reduce((total, opt) => total + opt.quantity, 0);
  };

  const getTotalPrice = () => {
    if (isApiData && productDetail) {
      // API 데이터: 옵션의 cost_price가 판매가
      return selectedOptions.reduce((total, opt) => {
        const option = productDetail.options.find((o) => o.id === opt.id);
        return total + (option?.cost_price || 0) * opt.quantity;
      }, 0);
    } else {
      // 더미 데이터: 기본 가격 + 옵션 추가 가격
      return selectedOptions.reduce((total, opt) => {
        return total + (productSalePrice + opt.price) * opt.quantity;
      }, 0);
    }
  };

  const handleHeartClick = contextSafe(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 로그인 체크
    if (!isLoggedIn) {
      router.push(
        `/signin?redirect=${encodeURIComponent(
          `/products/${numericProductId}`
        )}`
      );
      return;
    }

    if (isFavorite) {
      // 찜하기에서 제거
      try {
        await deleteFromWishlistMutation.mutateAsync(numericProductId);
        setIsFavorite(false);
      } catch (error) {
        console.error("찜하기 취소 실패:", error);
      }
    } else if (!isAnimating) {
      // 찜하기에 추가 - GSAP 애니메이션과 함께
      setIsAnimating(true);
      if (heartIconRef.current) {
        // 인스타그램 좋아요 스타일 애니메이션 (HeartGreenIcon으로)
        gsap.fromTo(
          heartIconRef.current,
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
              gsap.to(heartIconRef.current, {
                scale: 0.9,
                rotation: -5,
                duration: 0.1,
                ease: "power2.out",
                onComplete: () => {
                  gsap.to(heartIconRef.current, {
                    scale: 1.1,
                    rotation: 3,
                    duration: 0.1,
                    ease: "power2.out",
                    onComplete: () => {
                      gsap.to(heartIconRef.current, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.2,
                        ease: "elastic.out(1, 0.3)",
                        onComplete: () => {
                          // 비동기 작업을 콜백 내부에서 처리
                          addToWishlistMutation
                            .mutateAsync(numericProductId)
                            .then(() => {
                              setIsFavorite(true);
                              setIsAnimating(false);
                            })
                            .catch((error) => {
                              console.error("찜하기 추가 실패:", error);
                              setIsAnimating(false);
                            });
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
    }
  });

  // 더미 이미지 데이터 (API 이미지가 없을 때 사용)
  const dummyProductImages = [...fruits];

  const handleFarmProfileClick = () => {
    if (farmId) {
      router.push(`/farms/${farmId}`);
    }
  };

  const handleShareClick = async () => {
    try {
      const productUrl = `${window.location.origin}/products/${productId}`;
      await navigator.clipboard.writeText(productUrl);
      setShowToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">상품상세</h1>
        </div>
        <div className="w-7" />
      </div>

      {isLoadingProduct ? (
        <ProductDetailSkeleton />
      ) : (
        <div className="flex flex-col divide-y divide-[#D9D9D9]">
          {/* 상품 이미지 캐러셀 */}
          <ProductImageCarousel
            images={
              productImages.length > 0 ? productImages : dummyProductImages
            }
            isSpecialOffer={isSpecial}
            daysRemaining={daysRemaining}
          />

          {/* 판매 농장명과 좋아요/공유하기 버튼 */}
          <div className="flex items-center justify-between px-5 py-[10px]">
            <button
              type="button"
              onClick={handleFarmProfileClick}
              className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
              aria-label={`${farmName} 농장 프로필 보기`}
            >
              {farmImage ? (
                <div className="w-8 h-8 bg-[#D9D9D9] rounded-full relative overflow-hidden">
                  <Image
                    src={farmImage}
                    alt={farmName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#D9D9D9] rounded-full"></div>
              )}
              <span className="text-sm font-bold text-[#262626]">
                {farmName}
              </span>
              <ChevronRightIcon />
            </button>
            <div className="flex items-center gap-3">
              <button
                ref={heartButtonRef}
                type="button"
                className="cursor-pointer"
                onClick={handleHeartClick}
                aria-label={isFavorite ? "찜하기 취소" : "찜하기"}
              >
                <div ref={heartIconRef}>
                  {isAnimating || isFavorite ? (
                    <HeartGreenIcon />
                  ) : (
                    <HeartIcon />
                  )}
                </div>
              </button>
              <button
                type="button"
                className="cursor-pointer"
                onClick={handleShareClick}
                aria-label="상품 공유"
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* 상품명 */}
            <h2 className="text-lg text-[#262626]">{productName}</h2>

            {/* 별점과 후기수 */}
            <div className="flex items-center gap-1">
              <StarIcon />
              <span className="text-sm text-[#8C8C8C]">
                {ratingAvg.toFixed(1)}
              </span>
              <button
                type="button"
                className="text-sm text-[#262626] underline cursor-pointer"
                onClick={() => setActiveTab("review")}
              >
                {reviewCount}개 후기보기
              </button>
            </div>

            {/* 가격 */}
            <div className="flex items-center gap-2">
              {(productDetail?.display_discount_rate ?? 0) > 0 ? (
                <>
                  <span className="text-sm text-[#8C8C8C] line-through">
                    {productOriginalPrice.toLocaleString()}원
                  </span>
                  <span className="text-2xl font-bold text-[#FF5266]">
                    {productSalePrice.toLocaleString()}원
                  </span>
                  <span className="text-sm font-bold text-[#FF5266]">
                    {productDetail?.display_discount_rate ?? 0}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-[#FF5266]">
                  {productOriginalPrice.toLocaleString()}원
                </span>
              )}
            </div>
          </div>

          {/* 상세정보/구매후기 탭 */}
          <div className="relative flex border-b-2 border-[#D9D9D9] px-5">
            <button
              type="button"
              onClick={() => setActiveTab("detail")}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === "detail"
                  ? "text-[#133A1B] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#133A1B]"
                  : "text-[#8C8C8C]"
              }`}
            >
              상세정보
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === "review"
                  ? "text-[#133A1B] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#133A1B]"
                  : "text-[#8C8C8C]"
              }`}
            >
              구매후기
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === "detail" && (
            <div className="flex flex-col divide-y divide-[#D9D9D9]">
              {/* 상세정보*/}
              {productDetail?.detail_content ? (
                <div
                  className="w-full p-5 [&_p]:mb-4 [&_p:last-child]:mb-0"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: API에서 받은 HTML 콘텐츠
                  dangerouslySetInnerHTML={{
                    __html: productDetail.detail_content.replace(
                      /\n/g,
                      "<br />"
                    ),
                  }}
                />
              ) : (
                <div className="w-full">
                  <Image
                    src={ProductDetailImage}
                    alt="상품 상세 정보"
                    className="w-full h-auto"
                  />
                </div>
              )}
              {/* 상품고시 정보 */}
              <div>
                <div className="px-5 py-4 border-b border-[#D9D9D9] ">
                  {/* 상품고시정보 제목 */}
                  <h3 className="text-sm font-semibold text-[#262626]">
                    상품고시정보
                  </h3>
                </div>
                {/* 상품고시정보 내용 */}
                <div className="bg-[#F8F8F8] p-5">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <span className="text-xs text-[#595959]">제품명</span>
                      <span className="text-xs text-[#262626] text-left">
                        {productDetail?.product_name || "제주 감귤 5kg"}
                      </span>
                    </div>
                    {productDetail?.producer_name && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">
                          생산자 및 소재지
                        </span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.producer_name}
                          {productDetail.producer_location &&
                            ` / ${productDetail.producer_location}`}
                        </span>
                      </div>
                    )}
                    {(productDetail?.production_date ||
                      productDetail?.production_year) && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">
                          제조연월일(포장일 또는 생산연도)
                        </span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.production_date ||
                            (productDetail.production_year &&
                              `${productDetail.production_year}년`)}
                        </span>
                      </div>
                    )}
                    {productDetail?.expiry_type && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">
                          유통기한 또는 품질유지기한
                        </span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.expiry_type}
                        </span>
                      </div>
                    )}
                    {productDetail?.legal_notice && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">
                          관련법상 표시사항
                        </span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.legal_notice}
                        </span>
                      </div>
                    )}
                    {productDetail?.product_composition && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">상품구성</span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.product_composition}
                        </span>
                      </div>
                    )}
                    {productDetail?.handling_method && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">
                          보관방법 또는 취급방법
                        </span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.handling_method}
                        </span>
                      </div>
                    )}
                    {productDetail?.customer_service_phone && (
                      <div className="grid grid-cols-2 gap-4">
                        <span className="text-xs text-[#595959]">
                          소비자상담 관련 전화번호
                        </span>
                        <span className="text-xs text-[#262626] text-left">
                          {productDetail.customer_service_phone}
                        </span>
                      </div>
                    )}
                    {/* 더미 데이터용 기본 정보 (API 데이터가 없을 때만 표시) */}
                    {!productDetail && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <span className="text-xs text-[#595959]">
                            유통기한 또는 품질유지기한
                          </span>
                          <span className="text-xs text-[#262626] text-left">
                            수령일 기준 5일 이내 (냉장보관 권장)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <span className="text-xs text-[#595959]">
                            관련법상 표시사항
                          </span>
                          <span className="text-xs text-[#262626] text-left">
                            농산물품질관리법에 따른 표시사항 준수
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <span className="text-xs text-[#595959]">
                            상품구성
                          </span>
                          <span className="text-xs text-[#262626] text-left">
                            감귤 중소과 5kg (약 45~50개입)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <span className="text-xs text-[#595959]">
                            보관방법 또는 취급방법
                          </span>
                          <span className="text-xs text-[#262626] text-left">
                            직사광선 및 고온다습한 곳 피해서 보관
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <span className="text-xs text-[#595959]">
                            소비자상담 관련 전화번호
                          </span>
                          <span className="text-xs text-[#262626] text-left">
                            070-1234-5678
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <ProductReviews
              productId={numericProductId}
              reviewCount={reviewCount}
              ratingAvg={ratingAvg.toString()}
            />
          )}
        </div>
      )}

      {/* 하단 구매하기 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          onClick={handlePurchaseClick}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
        >
          구매하기
        </button>
      </div>

      {/* 구매 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:justify-center">
          {/* 백드롭 */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={handleModalClose}
            aria-label="모달 닫기"
          />

          {/* 모달 컨텐츠 */}
          <div className="relative w-full sm:w-[640px] bg-white rounded-t-2xl transform transition-transform duration-300 ease-out">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
              <h3 className="text-lg font-semibold text-[#262626]">
                옵션 선택
              </h3>
              <button type="button" onClick={handleModalClose} className="p-1">
                <CloseIcon />
              </button>
            </div>

            {/* 옵션 선택 */}
            <div className="p-5 border-b border-[#E5E5E5]">
              <div className="">
                <h5 className="text-sm font-medium text-[#262626] mb-2">
                  옵션 선택
                </h5>
                <button
                  type="button"
                  onClick={() => setIsOptionExpanded(!isOptionExpanded)}
                  className="w-full p-3 border border-[#D9D9D9] flex items-center justify-between text-left"
                >
                  <span className="text-sm text-[#262626]">
                    옵션을 선택해주세요
                  </span>
                  <ChevronUpIcon
                    className={`transform transition-transform ${
                      isOptionExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* 옵션 리스트 */}
              {isOptionExpanded && (
                <div className="border-l border-b border-r border-[#D9D9D9] overflow-hidden">
                  {productOptions.map((option) => {
                    const apiOption = isApiData
                      ? productDetail?.options.find((o) => o.id === option.id)
                      : null;
                    const hasDiscount =
                      apiOption && apiOption.discount_rate > 0;

                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className="w-full p-3 text-left border-b border-[#D9D9D9] last:border-b-0 hover:bg-[#F8F8F8]"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#262626]">
                              {option.name}
                            </span>
                            {isApiData && apiOption ? (
                              hasDiscount ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-[#8C8C8C] line-through">
                                    {apiOption.price.toLocaleString()}원
                                  </span>
                                  <span className="text-sm font-bold text-[#FF5266]">
                                    {apiOption.cost_price.toLocaleString()}원
                                  </span>
                                  <span className="text-xs text-[#FF5266]">
                                    {apiOption.discount_rate}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-[#262626]">
                                  {apiOption.cost_price.toLocaleString()}원
                                </span>
                              )
                            ) : (
                              option.price > 0 && (
                                <span className="text-sm text-[#FF5266]">
                                  +{option.price.toLocaleString()}원
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 선택된 옵션들 */}
            {selectedOptions.length > 0 && (
              <div className="p-5 border-b border-[#E5E5E5]">
                <h5 className="text-sm font-medium text-[#262626] mb-3">
                  수량 선택
                </h5>
                {selectedOptions.map((option) => (
                  <div key={option.id} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#262626]">
                            {option.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(option.id)}
                            className="w-6 h-6 rounded-full hover:bg-[#D9D9D9] flex items-center justify-center"
                          >
                            <SmallCloseIcon />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* 수량 컨트롤 박스 */}
                          <div className="flex items-center border border-[#D9D9D9]/85 overflow-hidden px-3 py-2 justify-between w-30">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(option.id, -1)
                              }
                            >
                              <MinusIcon />
                            </button>
                            <div className="flex items-center justify-center ">
                              <span className="text-sm font-medium text-[#262626]">
                                {option.quantity}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(option.id, 1)}
                            >
                              <PlusIcon />
                            </button>
                          </div>

                          <div className="text-right">
                            {isApiData && productDetail ? (
                              (() => {
                                const apiOption = productDetail.options.find(
                                  (o) => o.id === option.id
                                );
                                const optionHasDiscount =
                                  apiOption && apiOption.discount_rate > 0;
                                return (
                                  <div className="flex flex-col items-end gap-0.5">
                                    {optionHasDiscount ? (
                                      <>
                                        <span className="text-xs text-[#8C8C8C] line-through">
                                          {apiOption.price.toLocaleString()}원
                                        </span>
                                        <span className="text-sm font-bold text-[#262626]">
                                          {apiOption.cost_price.toLocaleString()}
                                          원
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-sm text-[#262626]">
                                        {(
                                          apiOption?.cost_price || 0
                                        ).toLocaleString()}
                                        원
                                      </span>
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              <p className="text-sm text-[#262626]">
                                {(
                                  productSalePrice + option.price
                                ).toLocaleString()}
                                원
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 총 합계 */}
            {selectedOptions.length > 0 && (
              <div className="p-5 border-b border-[#E5E5E5]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#262626]">총 수량</span>
                    <span className="text-sm text-[#8C8C8C]">
                      {getTotalQuantity()}개
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#262626]">총 금액</span>
                    <span className="text-lg font-bold text-[#FF5266]">
                      {getTotalPrice().toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="p-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={selectedOptions.length === 0}
                  className="flex-1 py-3 border border-[#133A1B] text-[#133A1B] font-semibold text-sm  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  장바구니 담기
                </button>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={selectedOptions.length === 0}
                  className="flex-1 py-3 bg-[#133A1B] text-white font-semibold text-sm  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  구매하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 장바구니 담기 완료 모달 */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:justify-center">
          {/* 백드롭 */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={handleCartModalClose}
            aria-label="모달 닫기"
          />

          {/* 모달 컨텐츠 */}
          <div className="relative w-full sm:w-[640px] bg-white rounded-t-2xl transform transition-transform duration-300 ease-out">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-end p-5">
              <button
                type="button"
                onClick={handleCartModalClose}
                className="p-1"
              >
                <CloseIcon />
              </button>
            </div>

            {/* 메시지 텍스트 */}
            <div className="pt-2 pb-4 flex items-center justify-center space-x-2">
              <CartIcon />
              <p className="text-center text-lg font-medium text-[#262626]">
                장바구니에 상품을 담았습니다
              </p>
            </div>

            {/* 액션 버튼들 */}
            <div className="p-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="flex-1 py-3 border border-[#133A1B] text-[#133A1B] font-semibold text-sm"
                >
                  계속 둘러보기
                </button>
                <button
                  type="button"
                  onClick={handleGoToCart}
                  className="flex-1 py-3 bg-[#133A1B] text-white font-semibold text-sm"
                >
                  장바구니 바로가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-[#262626] text-white px-6 py-3 rounded-lg shadow-lg">
            <span className="text-sm font-medium">
              클립보드에 저장되었습니다
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
