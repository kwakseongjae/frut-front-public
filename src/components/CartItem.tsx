"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import CloseBlackIcon from "@/assets/icon/ic_close_black_24.svg";
import CloseIcon from "@/assets/icon/ic_close_grey_10.svg";
import MinusIcon from "@/assets/icon/ic_minus_black_15.svg";
import MinusDisabledIcon from "@/assets/icon/ic_minus_grey_15.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_15.svg";
import { useUpdateCartItem } from "@/lib/api/hooks/use-cart";
import { useProductDetail } from "@/lib/api/hooks/use-product-detail";

interface CartItemData {
  id: number;
  name: string;
  image: string;
  option: string;
  originalPrice: number;
  discountedPrice: number;
  farmName: string;
  productId: number;
  productOptionId: number;
}

interface CartItemProps {
  item: CartItemData;
  isSelected: boolean;
  quantity: number;
  onSelect: (itemId: number) => void;
  onDelete: (itemId: number) => void;
  onQuantityChange: (itemId: number, change: number) => void;
  onOptionChange: (
    itemId: number,
    optionId: number,
    newQuantity: number
  ) => void;
}

const CartItem = ({
  item,
  isSelected,
  quantity,
  onSelect,
  onDelete,
  onQuantityChange,
  onOptionChange,
}: CartItemProps) => {
  const {
    id,
    name,
    image,
    option,
    originalPrice,
    discountedPrice,
    productId,
    productOptionId,
  } = item;

  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    productOptionId
  );
  const [tempQuantity, setTempQuantity] = useState(quantity);
  const modalTitleId = useId();

  // quantity prop이 변경될 때 tempQuantity도 업데이트
  useEffect(() => {
    setTempQuantity(quantity);
  }, [quantity]);

  const { data: productDetail, isLoading: isLoadingOptions } =
    useProductDetail(productId);
  const updateCartItemMutation = useUpdateCartItem();

  const handleOptionModalOpen = () => {
    setSelectedOptionId(productOptionId);
    setTempQuantity(quantity);
    setIsOptionModalOpen(true);
  };

  const handleOptionModalClose = () => {
    setIsOptionModalOpen(false);
    setSelectedOptionId(productOptionId);
    setTempQuantity(quantity);
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
  };

  const handleTempQuantityChange = (change: number) => {
    setTempQuantity((prev) => Math.max(1, prev + change));
  };

  const handleOptionConfirm = async () => {
    if (!selectedOptionId) return;

    const hasChanged =
      selectedOptionId !== productOptionId || tempQuantity !== quantity;

    if (hasChanged) {
      try {
        await updateCartItemMutation.mutateAsync({
          id,
          request: {
            product_option_id: selectedOptionId,
            quantity: tempQuantity,
          },
        });
        onOptionChange(id, selectedOptionId, tempQuantity);
        setIsOptionModalOpen(false);
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "옵션 변경에 실패했습니다."
        );
      }
    } else {
      setIsOptionModalOpen(false);
    }
  };
  return (
    <div className="flex items-start gap-3 px-3 py-4 ">
      {/* 체크박스 */}
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="cursor-pointer"
        aria-label={`${name} 선택`}
      >
        {isSelected ? <FilledCheckbox /> : <UnfilledCheckbox />}
      </button>

      <div className="flex flex-col flex-1 gap-4">
        <div className="flex space-x-3">
          {/* 상품 이미지 */}
          <div className="w-20 h-20 relative shrink-0">
            <Image src={image} alt={name} fill className="object-cover" />
          </div>

          {/* 상품 정보 */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm truncate text-[#262626]">{name}</p>
                <p className="text-sm truncate text-[#8C8C8C]">{option}</p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="cursor-pointer mt-1"
                aria-label={`${name} 삭제`}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        {/* 옵션명 표시 박스 */}
        <div className="p-2 border border-[#D9D9D9] text-sm font-medium text-[#262626]">
          {option}
        </div>

        {/* 상품 금액 */}
        <div className="flex flex-1 justify-between items-center">
          <p className="text-sm font-medium text-[#595959]">상품 금액</p>
          <div className="flex items-center gap-2">
            {originalPrice !== discountedPrice ? (
              <>
                <span className="text-xs text-[#8C8C8C] line-through">
                  {(originalPrice * quantity).toLocaleString()}원
                </span>
                <span className="text-sm font-semiblod text-[#262626]">
                  {(discountedPrice * quantity).toLocaleString()}원
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-[#262626]">
                {(discountedPrice * quantity).toLocaleString()}원
              </span>
            )}
          </div>
        </div>

        {/* 옵션 변경 및 수량 조절 */}
        <div className="flex items-center gap-3 flex-1">
          <button
            type="button"
            onClick={handleOptionModalOpen}
            className="py-2 border border-[#D9D9D9] text-sm text-[#595959] font-semibold cursor-pointer w-full"
          >
            옵션 변경
          </button>

          <div className="flex items-center justify-between gap-2 w-full border border-[#D9D9D9] px-3 py-2">
            <button
              type="button"
              onClick={
                quantity > 1 ? () => onQuantityChange(id, -1) : undefined
              }
              className={`cursor-pointer ${
                quantity <= 1 ? "cursor-not-allowed" : ""
              }`}
              aria-label="수량 감소"
              disabled={quantity <= 1}
            >
              {quantity > 1 ? <MinusIcon /> : <MinusDisabledIcon />}
            </button>
            <span className="text-sm text-[#595959] text-center font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(id, 1)}
              className="cursor-pointer"
              aria-label="수량 증가"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* 옵션 변경 모달 */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:justify-center">
          {/* 배경 오버레이 */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50 border-0 p-0 cursor-default"
            onClick={handleOptionModalClose}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleOptionModalClose();
              }
            }}
            aria-label="모달 닫기"
            tabIndex={-1}
          />
          {/* 모달 컨텐츠 */}
          <div
            className="relative w-full sm:w-[640px] bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleOptionModalClose();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-5 py-4 flex items-center justify-between">
              <h2
                id={modalTitleId}
                className="text-lg font-semibold text-[#262626]"
              >
                옵션 변경
              </h2>
              <button
                type="button"
                onClick={handleOptionModalClose}
                className="cursor-pointer"
                aria-label="닫기"
              >
                <CloseBlackIcon />
              </button>
            </div>

            {/* 옵션 목록 */}
            <div className="px-5 py-4">
              {isLoadingOptions ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
                </div>
              ) : productDetail?.options && productDetail.options.length > 0 ? (
                <div className="flex flex-col gap-3 mb-6">
                  {productDetail.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionSelect(opt.id)}
                        className={`p-4 border-2 rounded text-left ${
                          isSelected
                            ? "border-[#133A1B] bg-[#F0F7F2]"
                            : "border-[#D9D9D9] bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#262626] mb-1">
                              {opt.name}
                            </p>
                            <div className="flex items-center gap-2">
                              {opt.price !== opt.cost_price ? (
                                <>
                                  <span className="text-xs text-[#8C8C8C] line-through">
                                    {opt.price.toLocaleString()}원
                                  </span>
                                  <span className="text-sm font-semibold text-[#262626]">
                                    {opt.cost_price.toLocaleString()}원
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-semibold text-[#262626]">
                                  {opt.cost_price.toLocaleString()}원
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="ml-2 flex-shrink-0">
                              <FilledCheckbox />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <p className="text-sm text-[#8C8C8C]">
                    선택 가능한 옵션이 없습니다.
                  </p>
                </div>
              )}

              {/* 수량 조절 */}
              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#262626]">
                    수량
                  </span>
                  <div className="flex items-center justify-between gap-2 border border-[#D9D9D9] px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleTempQuantityChange(-1)}
                      disabled={tempQuantity <= 1}
                      className={`cursor-pointer ${
                        tempQuantity <= 1 ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      aria-label="수량 감소"
                    >
                      {tempQuantity > 1 ? <MinusIcon /> : <MinusDisabledIcon />}
                    </button>
                    <span className="text-sm text-[#595959] text-center font-semibold min-w-[30px]">
                      {tempQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTempQuantityChange(1)}
                      className="cursor-pointer"
                      aria-label="수량 증가"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* 확인 버튼 */}
              <button
                type="button"
                onClick={handleOptionConfirm}
                disabled={
                  !selectedOptionId ||
                  updateCartItemMutation.isPending ||
                  (selectedOptionId === productOptionId &&
                    tempQuantity === quantity)
                }
                className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
                  !selectedOptionId ||
                  updateCartItemMutation.isPending ||
                  (selectedOptionId === productOptionId &&
                    tempQuantity === quantity)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {updateCartItemMutation.isPending
                  ? "변경 중..."
                  : "옵션 변경하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;
