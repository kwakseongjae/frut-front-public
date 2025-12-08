"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_black_24.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";
import KakaoPay from "@/assets/icon/ic_kakaopay.svg";
import Naverpay from "@/assets/icon/ic_naverpay.svg";
import { fruits } from "@/assets/images/dummy";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderSheetPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("naver");
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    content1: false,
    content2: false,
  });

  // 로그인 체크
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/signin");
    }
  }, [isLoggedIn, router]);

  const totalAmount = 200000;
  const availablePoints = 2500;

  // 사용 가능한 쿠폰 데이터 (이미지 형태)
  const availableCoupons = [
    {
      id: "summer1",
      discountRate: 20,
      title: "여름 맞이 할인 20% 쿠폰",
      description: "더위를 시원하게 날릴 20% 할인쿠폰!",
      minOrderAmount: 20000,
      expiryDate: "2025.12.31",
    },
    {
      id: "summer2",
      discountRate: 20,
      title: "여름 맞이 할인 20% 쿠폰",
      description: "더위를 시원하게 날릴 20% 할인쿠폰!",
      minOrderAmount: 20000,
      expiryDate: "2025.12.31",
    },
  ];

  const availableCouponsCount = availableCoupons.length;

  const selectedCouponData = availableCoupons.find(
    (coupon) => coupon.id === selectedCoupon
  );

  // 쿠폰 할인 금액 계산
  const couponDiscount = selectedCouponData
    ? Math.floor((totalAmount * selectedCouponData.discountRate) / 100)
    : 0;

  const finalAmount = totalAmount - pointsToUse - couponDiscount;

  const handleCouponSelect = (couponId: string) => {
    // 같은 쿠폰을 다시 선택하면 해제
    if (selectedCoupon === couponId) {
      setSelectedCoupon(null);
    } else {
      setSelectedCoupon(couponId);
    }
    setIsCouponModalOpen(false);
  };

  const handleCouponModalOpen = () => {
    if (availableCouponsCount > 0) {
      setIsCouponModalOpen(true);
    }
  };

  const handleCouponModalClose = () => {
    setIsCouponModalOpen(false);
  };

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    const allSelected = allAgreed;
    setAgreements({
      terms: !allSelected,
      privacy: !allSelected,
      content1: !allSelected,
      content2: !allSelected,
    });
  };

  const handleUseAllPoints = () => {
    setPointsToUse(availablePoints);
  };

  const allAgreed = Object.values(agreements).every(Boolean);

  // 주문 상품 데이터 (더미)
  const orderItems = [
    { id: 1, name: "키위", image: fruits[0].image, price: 100000 },
    { id: 2, name: "파인애플", image: fruits[1].image, price: 100000 },
  ];

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
          <h1 className="text-lg font-semibold text-[#262626]">결제</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 본문 */}
      <div className="flex-1">
        {/* 주문상품 */}
        <div className="bg-white">
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-3">
              주문상품 2개
            </h2>
            <div className="mb-3 border border-[#E5E5E5] flex flex-col divide-y divide-[#E5E5E5]">
              <h3 className="text-sm font-medium text-[#262626] py-3 px-4">
                지혀기 농장
              </h3>
              <div className="space-y-3 px-4 py-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-20 h-20 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#262626]">{item.name}</p>
                      <p className="text-sm text-[#8C8C8C]">옵션</p>
                      <p className="mt-2 text-sm font-semibold text-[#262626]">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className=" font-medium text-[#8C8C8C]">총 주문금액</span>
                <span className="font-medium text-[#262626]">200,000원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 배송지 정보 */}
        <div className="bg-white">
          <div className="px-5 py-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-[#262626]">
                배송지 정보
              </h2>
              <button type="button" className="text-sm text-[#262626]">
                변경하기
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#262626]">이름</p>
              <p className="text-sm font-medium text-[#262626]">
                010-0000-0000
              </p>
              <p className="text-sm font-medium text-[#262626]">
                서울시 강남구 테헤란로 123 456호
              </p>
            </div>
            <input
              type="text"
              placeholder="배송 시 요청사항을 입력해주세요"
              className="mt-4 w-full p-3 border border-[#D9D9D9] text-sm"
            />
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 쿠폰 적용 */}
        <div className="bg-white">
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-3">
              쿠폰 적용
            </h2>
            {selectedCouponData ? (
              <button
                type="button"
                onClick={handleCouponModalOpen}
                className="w-full flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#FF5266]">
                    {selectedCouponData.discountRate}%
                  </span>
                  <span className="text-sm font-semibold text-[#262626]">
                    {selectedCouponData.title}
                  </span>
                </div>
                <ChevronRightIcon />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCouponModalOpen}
                className="w-full flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                <span className="text-sm text-[#262626]">
                  {availableCouponsCount === 0
                    ? "사용가능한 쿠폰이 없어요"
                    : `사용 가능한 쿠폰이 ${availableCouponsCount}개 있어요`}
                </span>
                <ChevronRightIcon />
              </button>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 포인트 */}
        <div className="bg-white">
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-3">
              포인트
            </h2>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-[#262626]">보유 포인트</span>
              <span className=" font-semibold text-[#262626]">2500P</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUsePoints(!usePoints)}
                className="cursor-pointer"
                aria-label="포인트 사용"
              >
                {usePoints ? <FilledCheckbox /> : <UnfilledCheckbox />}
              </button>
              <button
                type="button"
                onClick={() => setUsePoints(!usePoints)}
                className="text-sm text-[#262626] cursor-pointer"
                aria-label="포인트 사용"
              >
                포인트 사용
              </button>
            </div>
            {usePoints && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-[#262626]">
                      사용
                    </span>
                    <input
                      type="text"
                      value={
                        pointsToUse === 0 ? "" : pointsToUse.toLocaleString()
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue) && numValue >= 0) {
                          if (numValue > availablePoints) {
                            setPointsToUse(0);
                            alert("보유 금액 이상 사용은 불가능 합니다.");
                          } else {
                            setPointsToUse(numValue);
                          }
                        }
                      }}
                      className="w-full p-3 pl-12 pr-6 border border-[#D9D9D9] text-sm text-right"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-[#262626]">
                      원
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseAllPoints}
                    className="px-4 py-3 border border-[#D9D9D9] text-sm text-[#262626]"
                  >
                    전액사용
                  </button>
                </div>
                <p className="text-xs text-[#8C8C8C] text-right">
                  남은 포인트 :{" "}
                  {(availablePoints - pointsToUse).toLocaleString()}P
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 결제 수단 */}
        <div className="bg-white">
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-[#262626] mb-3">
              결제 수단
            </h2>
            <div className=" divide-y divide-[#D9D9D9]">
              <label className="flex items-center gap-1.5 py-3 px-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="naver"
                  checked={selectedPayment === "naver"}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <Naverpay />
                <span className="text-sm text-[#262626]">네이버페이</span>
              </label>
              <label className="flex items-center gap-1.5 py-3 px-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="kakao"
                  checked={selectedPayment === "kakao"}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <KakaoPay />
                <span className="text-sm text-[#262626]">카카오페이</span>
              </label>
              <label className="flex items-center gap-3 py-3 px-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={selectedPayment === "card"}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <span className="text-sm text-[#262626]">신용/체크카드</span>
              </label>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 주문내용 확인 및 결제 동의 */}
        <div className="bg-white">
          <div className="px-5 pt-4 pb-8">
            <h2 className="text-base font-semibold text-[#262626] mb-4">
              주문내용 확인 및 결제 동의
            </h2>
            <div className="space-y-3">
              {/* 전체 동의 */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="cursor-pointer"
                  aria-label="전체 동의"
                >
                  {allAgreed ? <FilledCheckbox /> : <UnfilledCheckbox />}
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm font-semibold text-[#262626] cursor-pointer"
                  aria-label="전체 동의"
                >
                  전체 동의
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAgreementChange("terms")}
                  className="cursor-pointer"
                  aria-label="이용약관 동의"
                >
                  {agreements.terms ? <FilledCheckbox /> : <UnfilledCheckbox />}
                </button>
                <button
                  type="button"
                  onClick={() => handleAgreementChange("terms")}
                  className="text-sm text-[#262626] cursor-pointer"
                  aria-label="이용약관 동의"
                >
                  이용약관 동의 (필수)
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAgreementChange("privacy")}
                  className="cursor-pointer"
                  aria-label="개인정보 처리 방침 동의"
                >
                  {agreements.privacy ? (
                    <FilledCheckbox />
                  ) : (
                    <UnfilledCheckbox />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleAgreementChange("privacy")}
                  className="text-sm text-[#262626] cursor-pointer"
                  aria-label="개인정보 처리 방침 동의"
                >
                  개인정보 처리 방침 동의 (필수)
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAgreementChange("content1")}
                  className="cursor-pointer"
                  aria-label="내용 동의"
                >
                  {agreements.content1 ? (
                    <FilledCheckbox />
                  ) : (
                    <UnfilledCheckbox />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleAgreementChange("content1")}
                  className="text-sm text-[#262626] cursor-pointer"
                  aria-label="내용 동의"
                >
                  내용 (필수)
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAgreementChange("content2")}
                  className="cursor-pointer"
                  aria-label="내용 동의"
                >
                  {agreements.content2 ? (
                    <FilledCheckbox />
                  ) : (
                    <UnfilledCheckbox />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleAgreementChange("content2")}
                  className="text-sm text-[#262626] cursor-pointer"
                  aria-label="내용 동의"
                >
                  내용 (선택)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 결제 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          disabled={!allAgreed}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {finalAmount.toLocaleString()}원 결제하기
        </button>
      </div>

      {/* 쿠폰 선택 모달 */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:justify-center">
          {/* 백드롭 */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={handleCouponModalClose}
            aria-label="모달 닫기"
          />

          {/* 모달 컨텐츠 */}
          <div className="relative w-full sm:w-[640px] bg-white rounded-t-2xl transform transition-transform duration-300 ease-out max-h-[80vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
              <h3 className="text-lg font-semibold text-[#262626]">쿠폰함</h3>
              <button
                type="button"
                onClick={handleCouponModalClose}
                className="p-1"
                aria-label="모달 닫기"
              >
                <CloseIcon />
              </button>
            </div>

            {/* 쿠폰 리스트 */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* 사용 가능 쿠폰 라벨 */}
              <div className="mb-3">
                <span className="text-[#262626]">
                  사용 가능 쿠폰 총{" "}
                  <span className="text-[#133A1B] font-semibold">
                    {availableCouponsCount}
                  </span>
                  장
                </span>
              </div>
              <div className="space-y-3">
                {availableCoupons.map((coupon) => {
                  const isSelected = selectedCoupon === coupon.id;
                  return (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => handleCouponSelect(coupon.id)}
                      className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
                        isSelected
                          ? "border-[#133A1B] bg-[#133A1B]/5"
                          : "border-[#E5E5E5] bg-white hover:border-[#133A1B]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-[#FF5266]">
                              {coupon.discountRate}%
                            </span>
                            <span className="text-sm font-semibold text-[#262626]">
                              {coupon.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#262626] mb-1">
                            {coupon.description}
                          </p>
                          <p className="text-xs text-[#262626]">
                            최소 주문금액 :{" "}
                            {coupon.minOrderAmount.toLocaleString()}원
                          </p>
                          <p className="text-xs text-[#262626]">
                            {coupon.expiryDate} 까지
                          </p>
                        </div>
                        {isSelected && (
                          <div className="text-[#133A1B] font-semibold text-sm">
                            선택됨
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
