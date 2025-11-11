"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CartIcon from "@/assets/icon/ic_cart_green_24.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_black_24.svg";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";
import SmallCloseIcon from "@/assets/icon/ic_close_grey_10.svg";
import HeartIcon from "@/assets/icon/ic_heart_24.svg";
import MinusIcon from "@/assets/icon/ic_minus_black_15.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_15.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import ShareIcon from "@/assets/icon/ic_upload_black_24.svg";
import { fruits } from "@/assets/images/dummy";
import ProductDetailImage from "@/assets/images/product_detail.png";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ProductReviews from "@/components/ProductReviews";

export default function ProductDetailPage() {
  const router = useRouter();
  // const productId = params.id as string;
  const [activeTab, setActiveTab] = useState<"detail" | "review">("detail");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>
  >([]);
  const [isOptionExpanded, setIsOptionExpanded] = useState(false);

  // 상품 정보
  const productPrice = 39000;
  const productOptions = [
    { id: "option1", name: "5kg (중소과)", price: 0 },
    { id: "option2", name: "3kg (중과)", price: 5000 },
    { id: "option3", name: "2kg (대과)", price: 8000 },
  ];

  const handlePurchaseClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsOptionExpanded(false);
    setSelectedOptions([]);
  };

  const handleOptionSelect = (optionId: string) => {
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

  const handleQuantityChange = (optionId: string, change: number) => {
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
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>
    );
  };

  const handleRemoveOption = (optionId: string) => {
    setSelectedOptions((prev) => prev.filter((opt) => opt.id !== optionId));
  };

  const handleAddToCart = () => {
    // 장바구니 담기 로직
    console.log("장바구니에 담기:", selectedOptions);
    handleModalClose();
    setIsCartModalOpen(true);
  };

  const handlePurchase = () => {
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
    return selectedOptions.reduce((total, opt) => {
      return total + (productPrice + opt.price) * opt.quantity;
    }, 0);
  };

  // 상품 이미지 데이터 (10개 이미지)
  const productImages = [...fruits];

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

      {/* 상품 상세 내용 영역 */}
      <div className="flex flex-col divide-y divide-[#D9D9D9]">
        {/* 상품 이미지 캐러셀 */}
        <ProductImageCarousel images={productImages} />

        {/* 판매 농장명과 좋아요/공유하기 버튼 */}
        <div className="flex items-center justify-between px-5 py-[10px]">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-[#D9D9D9] rounded-full"></div>
            <span className="text-sm font-bold text-[#262626]">
              제주 감귤농원
            </span>
            <ChevronRightIcon />
          </button>
          <div className="flex items-center gap-3">
            <button type="button" className="cursor-pointer">
              <HeartIcon />
            </button>
            <button type="button" className="cursor-pointer">
              <ShareIcon />
            </button>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-3 px-5 py-4">
          {/* 상품명 */}
          <h2 className="text-lg text-[#262626]">세상에서 제일 달달한 수박</h2>

          {/* 별점과 후기수 */}
          <div className="flex items-center gap-1">
            <StarIcon />
            <span className="text-sm text-[#8C8C8C]">4.8</span>
            <button
              type="button"
              className="text-sm text-[#262626] underline cursor-pointer"
            >
              152개 후기보기
            </button>
          </div>

          {/* 가격 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#FF5266]">39,000원</span>
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
            <div className="w-full">
              <Image
                src={ProductDetailImage}
                alt="상품 상세 정보"
                className="w-full h-auto"
              />
            </div>
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
                      제주 감귤 5kg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      생산자 및 소재지
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      제주 감귤농원 / 제주특별자치도 서귀포시 남원읍
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      제조연월일(포장일 또는 생산연도)
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      2025년 6월 25일 포장
                    </span>
                  </div>
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
                    <span className="text-xs text-[#595959]">상품구성</span>
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
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "review" && <ProductReviews />}
      </div>

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
                  {productOptions.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className="w-full p-3 text-left border-b border-[#D9D9D9] last:border-b-0 hover:bg-[#F8F8F8]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#262626]">
                          {option.name}
                        </span>
                        {option.price > 0 && (
                          <span className="text-sm text-[#FF5266]">
                            +{option.price.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
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
                            <p className="text-sm text-[#262626]">
                              {(productPrice + option.price).toLocaleString()}원
                            </p>
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
    </div>
  );
}
