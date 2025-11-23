"use client";

import Image from "next/image";
import { useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import KakaoPay from "@/assets/icon/ic_kakaopay.svg";
import Naverpay from "@/assets/icon/ic_naverpay.svg";
import { fruits } from "@/assets/images/dummy";

export default function OrderSheetPage() {
	const [selectedCoupon, setSelectedCoupon] = useState("none");
	const [usePoints, setUsePoints] = useState(false);
	const [pointsToUse, setPointsToUse] = useState(0);
	const [selectedPayment, setSelectedPayment] = useState("naver");
	const [agreements, setAgreements] = useState({
		terms: false,
		privacy: false,
		content1: false,
		content2: false,
	});

	const totalAmount = 200000;
	const availablePoints = 2500;
	const finalAmount = totalAmount - pointsToUse;

	const handleAgreementChange = (key: keyof typeof agreements) => {
		setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
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
						<div className="space-y-2">
							<label className="flex items-center gap-3 p-3 border border-[#E5E5E5] cursor-pointer">
								<input
									type="radio"
									name="coupon"
									value="none"
									checked={selectedCoupon === "none"}
									onChange={(e) => setSelectedCoupon(e.target.value)}
								/>
								<span className="text-sm text-[#262626]">쿠폰 사용 안함</span>
							</label>
							<label className="flex items-center gap-3 p-3 border border-[#E5E5E5] cursor-pointer">
								<input
									type="radio"
									name="coupon"
									value="first"
									checked={selectedCoupon === "first"}
									onChange={(e) => setSelectedCoupon(e.target.value)}
								/>
								<span className="text-sm text-[#262626]">첫 구매 15% 할인</span>
							</label>
							<label className="flex items-center gap-3 p-3 border border-[#E5E5E5] cursor-pointer">
								<input
									type="radio"
									name="coupon"
									value="other"
									checked={selectedCoupon === "other"}
									onChange={(e) => setSelectedCoupon(e.target.value)}
								/>
								<span className="text-sm text-[#262626]">쿠폰명</span>
							</label>
						</div>
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
		</div>
	);
}
