"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { fruits } from "@/assets/images/dummy";
import CartItem from "@/components/CartItem";

const CartPage = () => {
  const router = useRouter();
  const [selectAll, setSelectAll] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3, 4]); // 모든 아이템 선택된 상태
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({
    1: 1,
    2: 1,
    3: 1,
    4: 1,
  });

  // 장바구니 아이템 데이터를 상태로 관리
  const [cartItems, setCartItems] = useState([
    // 이슬이 농장
    {
      id: 1,
      name: "키위",
      image: fruits[0].image,
      option: "옵션",
      originalPrice: 50000,
      discountedPrice: 45000,
      isSelected: true,
      farmName: "이슬이 농장",
    },
    {
      id: 2,
      name: "파인애플",
      image: fruits[1].image,
      option: "옵션",
      originalPrice: 50000,
      discountedPrice: 50000,
      isSelected: false,
      farmName: "이슬이 농장",
    },
    // 햇살이 농장
    {
      id: 3,
      name: "딸기",
      image: fruits[2].image,
      option: "옵션",
      originalPrice: 60000,
      discountedPrice: 55000,
      isSelected: false,
      farmName: "햇살이 농장",
    },
    {
      id: 4,
      name: "종합과일",
      image: fruits[3].image,
      option: "옵션",
      originalPrice: 70000,
      discountedPrice: 70000,
      isSelected: false,
      farmName: "햇살이 농장",
    },
  ]);

  const handleBackClick = () => {
    window.history.back();
  };

  const handleOrderClick = () => {
    router.push("/ordersheet");
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectFarm = (farmName: string) => {
    const farmItems = cartItems.filter((item) => item.farmName === farmName);
    const farmItemIds = farmItems.map((item) => item.id);
    const allFarmItemsSelected = farmItemIds.every((id) =>
      selectedItems.includes(id)
    );

    if (allFarmItemsSelected) {
      // 해당 농장의 모든 아이템 선택 해제
      setSelectedItems((prev) =>
        prev.filter((id) => !farmItemIds.includes(id))
      );
    } else {
      // 해당 농장의 모든 아이템 선택
      setSelectedItems((prev) => [...new Set([...prev, ...farmItemIds])]);
    }
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSelected = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      // 전체 선택 상태 업데이트
      setSelectAll(newSelected.length === cartItems.length);

      return newSelected;
    });
  };

  const handleQuantityChange = (itemId: number, change: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(1, (prev[itemId] || 1) + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleDeleteItem = (itemId: number) => {
    // 장바구니에서 아이템 제거
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));

    // 선택된 아이템에서도 제거
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));

    // 수량 정보에서도 제거
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });

    // 전체 선택 상태 업데이트
    setSelectAll(false);
  };

  const handleDeleteSelected = () => {
    // 선택된 아이템들을 장바구니에서 제거
    setCartItems((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id))
    );

    // 선택된 아이템 목록 초기화
    setSelectedItems([]);

    // 전체 선택 상태 초기화
    setSelectAll(false);

    // 선택된 아이템들의 수량 정보 제거
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      selectedItems.forEach((itemId) => {
        delete newQuantities[itemId];
      });
      return newQuantities;
    });
  };

  // 총 금액 계산
  const totalAmount = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const quantity = quantities[item.id] || 1;
      return sum + item.discountedPrice * quantity;
    }, 0);

  const totalDiscount = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const quantity = quantities[item.id] || 1;
      return sum + (item.originalPrice - item.discountedPrice) * quantity;
    }, 0);

  const selectedCount = selectedItems.length;
  const totalCount = cartItems.length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={handleBackClick}
          className="cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">장바구니</h1>
        </div>
        <div className="w-7" />
      </div>

      <div className="flex-1 px-5 pt-4 pb-8 flex flex-col gap-4">
        {/* 전체 선택 및 삭제 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="cursor-pointer"
              aria-label="전체 선택"
            >
              {selectAll ? <FilledCheckbox /> : <UnfilledCheckbox />}
            </button>
            <span className="font-semibold text-[#262626]">
              전체선택 ({selectedCount}/{totalCount})
            </span>
          </div>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0}
            className={`text-sm font-medium cursor-pointer ${
              selectedCount > 0
                ? "text-[#949494] hover:text-[#262626]"
                : "text-[#D9D9D9] cursor-not-allowed"
            }`}
          >
            선택삭제
          </button>
        </div>
        {/* 농장별 상품 목록 */}
        {cartItems.length > 0 ? (
          Array.from(new Set(cartItems.map((item) => item.farmName))).map(
            (farmName) => {
              const farmItems = cartItems.filter(
                (item) => item.farmName === farmName
              );
              const farmItemIds = farmItems.map((item) => item.id);
              const allFarmItemsSelected = farmItemIds.every((id) =>
                selectedItems.includes(id)
              );

              return (
                <div
                  key={farmName}
                  className="border border-[#E5E5E5] flex flex-col divide-y divide-[#E5E5E5]"
                >
                  {/* 농장명 */}
                  <div className="flex items-center gap-3 py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSelectFarm(farmName)}
                      className="cursor-pointer"
                      aria-label={`${farmName} 전체 선택`}
                    >
                      {allFarmItemsSelected ? (
                        <FilledCheckbox />
                      ) : (
                        <UnfilledCheckbox />
                      )}
                    </button>
                    <h3 className="font-medium text-[#262626]">{farmName}</h3>
                  </div>

                  {/* 상품 목록 */}
                  <div className="divide-y divide-[#D9D9D9]">
                    {farmItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        quantity={quantities[item.id] || 1}
                        onSelect={handleSelectItem}
                        onDelete={handleDeleteItem}
                        onQuantityChange={handleQuantityChange}
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-medium text-[#8C8C8C] mb-2">
              장바구니가 비어있습니다
            </p>
          </div>
        )}
      </div>

      {/* 구분선 */}
      {cartItems.length > 0 && <div className="h-[10px] bg-[#F7F7F7]" />}

      {/* 결제 예상 금액 */}
      {cartItems.length > 0 && (
        <div className="px-5 pt-8 pb-12">
          <h2 className="text-base font-semibold text-[#262626] mb-3">
            결제 예상 금액
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#262626]">상품 금액</span>
              <span className="text-sm font-semibold text-[#262626]">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#262626]">총 할인받은 금액</span>
              <span className="text-sm font-semibold text-[#FF6B6B]">
                -{totalDiscount.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-[1px] bg-[#262626] my-4" />

          {/* 결제예정금액 */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#262626]">결제예정금액</span>
            <span className="text-lg font-semibold text-[#262626]">
              {(totalAmount - totalDiscount).toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {/* 하단 주문 버튼 */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-5 py-3">
          <button
            type="button"
            onClick={handleOrderClick}
            disabled={selectedCount === 0}
            className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {totalAmount.toLocaleString()}원 주문하기
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
