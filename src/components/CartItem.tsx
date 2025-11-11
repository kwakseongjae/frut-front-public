"use client";

import Image from "next/image";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import CloseIcon from "@/assets/icon/ic_close_grey_10.svg";
import MinusIcon from "@/assets/icon/ic_minus_black_15.svg";
import MinusDisabledIcon from "@/assets/icon/ic_minus_grey_15.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_15.svg";

interface CartItemData {
  id: number;
  name: string;
  image: string;
  option: string;
  originalPrice: number;
  discountedPrice: number;
  farmName: string;
}

interface CartItemProps {
  item: CartItemData;
  isSelected: boolean;
  quantity: number;
  onSelect: (itemId: number) => void;
  onDelete: (itemId: number) => void;
  onQuantityChange: (itemId: number, change: number) => void;
}

const CartItem = ({
  item,
  isSelected,
  quantity,
  onSelect,
  onDelete,
  onQuantityChange,
}: CartItemProps) => {
  const { id, name, image, option, originalPrice, discountedPrice } = item;
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
          옵션명
        </div>

        {/* 상품 금액 */}
        <div className="flex flex-1 justify-between items-center">
          <p className="text-sm font-medium text-[#595959]">상품 금액</p>
          <div className="flex items-center gap-2">
            {originalPrice !== discountedPrice ? (
              <>
                <span className="text-xs text-[#8C8C8C] line-through">
                  {originalPrice.toLocaleString()}원
                </span>
                <span className="text-sm font-semiblod text-[#262626]">
                  {discountedPrice.toLocaleString()}원
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-[#262626]">
                {discountedPrice.toLocaleString()}원
              </span>
            )}
          </div>
        </div>

        {/* 옵션 변경 및 수량 조절 */}
        <div className="flex items-center gap-3 flex-1">
          <button
            type="button"
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
    </div>
  );
};

export default CartItem;
