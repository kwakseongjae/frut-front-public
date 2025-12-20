"use client";

import { useEffect, useState } from "react";
import ChevronUpIcon from "@/assets/icon/ic_chevron_up_19.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";
import SmallCloseIcon from "@/assets/icon/ic_close_grey_10.svg";
import MinusIcon from "@/assets/icon/ic_minus_black_15.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_15.svg";
import type { ProductDetail } from "@/lib/api/products";

interface SelectedOption {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

interface ProductOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productDetail: ProductDetail | null;
  productSalePrice: number;
  productOptions: Array<{
    id: string | number;
    name: string;
    price: number;
    costPrice?: number;
    discountRate?: number;
  }>;
  isApiData: boolean;
  onAddToCart: (selectedOptions: SelectedOption[]) => void;
  showPurchaseButton?: boolean;
  onPurchase?: () => void;
}

const ProductOptionModal = ({
  isOpen,
  onClose,
  productDetail,
  productSalePrice,
  productOptions,
  isApiData,
  onAddToCart,
  showPurchaseButton = false,
  onPurchase,
}: ProductOptionModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [isOptionExpanded, setIsOptionExpanded] = useState(false);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedOptions([]);
      setIsOptionExpanded(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedOptions([]);
    setIsOptionExpanded(false);
    onClose();
  };

  const handleOptionSelect = (optionId: string | number) => {
    const option = productOptions.find((opt) => opt.id === optionId);
    if (!option) return;

    // 이미 선택된 옵션인지 확인
    const existingIndex = selectedOptions.findIndex(
      (opt) => opt.id === optionId
    );
    if (existingIndex >= 0) {
      return; // 이미 선택된 옵션은 무시
    }

    // 새 옵션 추가
    setSelectedOptions([
      ...selectedOptions,
      {
        id: optionId,
        name: option.name,
        price: option.price,
        quantity: 1,
      },
    ]);
    setIsOptionExpanded(false);
  };

  const handleQuantityChange = (optionId: string | number, change: number) => {
    setSelectedOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId
          ? { ...opt, quantity: Math.max(1, opt.quantity + change) }
          : opt
      )
    );
  };

  const handleRemoveOption = (optionId: string | number) => {
    setSelectedOptions((prev) => prev.filter((opt) => opt.id !== optionId));
  };

  const handleAddToCartClick = () => {
    if (selectedOptions.length === 0) return;
    onAddToCart(selectedOptions);
    // 장바구니 담기 후 상태 초기화는 부모 컴포넌트에서 모달을 닫을 때 처리
  };

  const handlePurchaseClick = () => {
    if (selectedOptions.length === 0) return;
    if (onPurchase) {
      onPurchase();
    }
  };

  const getTotalQuantity = () => {
    return selectedOptions.reduce((total, opt) => total + opt.quantity, 0);
  };

  const getTotalPrice = () => {
    if (isApiData && productDetail) {
      return selectedOptions.reduce((total, opt) => {
        const option = productDetail.options.find((o) => o.id === opt.id);
        return total + (option?.cost_price || 0) * opt.quantity;
      }, 0);
    } else {
      return selectedOptions.reduce((total, opt) => {
        return total + (productSalePrice + opt.price) * opt.quantity;
      }, 0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:justify-center">
      {/* 백드롭 */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-label="모달 닫기"
      />

      {/* 모달 컨텐츠 */}
      <div
        className="relative w-full sm:w-[640px] bg-white rounded-t-2xl transform transition-transform duration-300 ease-out"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-[#262626]">옵션 선택</h3>
          <button type="button" onClick={handleClose} className="p-1">
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOptionExpanded(!isOptionExpanded);
              }}
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
                const hasDiscount = apiOption && apiOption.discount_rate > 0;

                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOptionSelect(option.id);
                    }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveOption(option.id);
                        }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuantityChange(option.id, -1);
                          }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuantityChange(option.id, 1);
                          }}
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
                                      {apiOption.cost_price.toLocaleString()}원
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
                            {(productSalePrice + option.price).toLocaleString()}
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
          {showPurchaseButton ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCartClick();
                }}
                disabled={selectedOptions.length === 0}
                className="flex-1 py-3 border border-[#133A1B] text-[#133A1B] font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                장바구니 담기
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePurchaseClick();
                }}
                disabled={selectedOptions.length === 0}
                className="flex-1 py-3 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                구매하기
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCartClick();
              }}
              disabled={selectedOptions.length === 0}
              className="w-full py-3 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              장바구니 담기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOptionModal;
