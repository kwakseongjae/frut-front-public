"use client";

import { useRouter } from "next/navigation";
import CartIcon from "@/assets/icon/ic_cart_green_24.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";

interface CartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSuccessModal = ({ isOpen, onClose }: CartSuccessModalProps) => {
  const router = useRouter();

  const handleContinueShopping = () => {
    onClose();
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:justify-center">
      {/* 백드롭 */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="모달 닫기"
      />

      {/* 모달 컨텐츠 */}
      <div className="relative w-full sm:w-[640px] bg-white rounded-t-2xl transform transition-transform duration-300 ease-out">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-end p-5">
          <button type="button" onClick={onClose} className="p-1">
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
  );
};

export default CartSuccessModal;
