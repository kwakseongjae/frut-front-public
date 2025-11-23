"use client";

import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import DownloadIcon from "@/assets/icon/ic_download_green_24.svg";

interface Coupon {
	id: number;
	discountRate: number;
	title: string;
	description: string;
	minOrderAmount: number;
	expiryDate: string;
	isUsed: boolean;
}

const CouponsPage = () => {
	const [activeTab, setActiveTab] = useState<"owned" | "available">("owned");

	const handleTabClick = (tab: "owned" | "available") => {
		setActiveTab(tab);
	};

	// 더미 데이터
	const availableCoupons: Coupon[] = [
		{
			id: 1,
			discountRate: 20,
			title: "여름 맞이 할인 20% 쿠폰",
			description: "더위를 시원하게 날릴 20% 할인쿠폰!",
			minOrderAmount: 20000,
			expiryDate: "2025.12.31",
			isUsed: false,
		},
		{
			id: 2,
			discountRate: 20,
			title: "여름 맞이 할인 20% 쿠폰",
			description: "더위를 시원하게 날릴 20% 할인쿠폰!",
			minOrderAmount: 20000,
			expiryDate: "2025.12.31",
			isUsed: false,
		},
	];

	const usedCoupons: Coupon[] = [
		{
			id: 3,
			discountRate: 20,
			title: "여름 맞이 할인 20% 쿠폰",
			description: "더위를 시원하게 날릴 20% 할인쿠폰!",
			minOrderAmount: 20000,
			expiryDate: "2025.12.31",
			isUsed: true,
		},
		{
			id: 4,
			discountRate: 20,
			title: "여름 맞이 할인 20% 쿠폰",
			description: "더위를 시원하게 날릴 20% 할인쿠폰!",
			minOrderAmount: 20000,
			expiryDate: "2025.12.31",
			isUsed: true,
		},
		{
			id: 5,
			discountRate: 20,
			title: "여름 맞이 할인 20% 쿠폰",
			description: "더위를 시원하게 날릴 20% 할인쿠폰!",
			minOrderAmount: 20000,
			expiryDate: "2025.12.31",
			isUsed: true,
		},
	];

	const renderCouponCard = (coupon: Coupon, showDownloadIcon = false) => {
		const isUsed = coupon.isUsed;
		const textColor = isUsed ? "text-[#8C8C8C]" : "text-[#262626]";
		const discountColor = isUsed ? "text-[#8C8C8C]" : "text-[#F73535]";

		return (
			<div
				key={coupon.id}
				className={`rounded-lg p-4 ${
					isUsed
						? "bg-[#F5F5F5] opacity-60"
						: "border border-[#E5E5E5] bg-white"
				}`}
			>
				<div className="flex items-center justify-between gap-4">
					<div className="flex flex-col gap-1.5 flex-1">
						<div className={`text-3xl font-bold ${discountColor} mb-1`}>
							{coupon.discountRate}%
						</div>
						<div className={`text-base font-medium ${textColor}`}>
							{coupon.title}
						</div>
						<div className={`text-sm ${textColor}`}>{coupon.description}</div>
						<div className={`text-sm ${textColor}`}>
							최소 주문금액 : {coupon.minOrderAmount.toLocaleString()}원
						</div>
						<div className={`text-sm ${textColor}`}>
							{coupon.expiryDate} 까지
						</div>
					</div>
					{showDownloadIcon && !isUsed && (
						<button
							type="button"
							className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E6F5E9] flex items-center justify-center"
							aria-label="쿠폰 다운로드"
						>
							<DownloadIcon />
						</button>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5 border-b border-[#E5E5E5]">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="p-1 cursor-pointer"
					aria-label="뒤로가기"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">쿠폰함</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 탭 내비게이션 */}
			<div className="sticky top-[52px] z-10 bg-white border-b-2 border-[#E5E5E5]">
				<div className="flex">
					<button
						type="button"
						onClick={() => handleTabClick("owned")}
						className={`flex-1 py-4 text-sm font-medium relative ${
							activeTab === "owned" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
						aria-label="보유쿠폰"
					>
						보유쿠폰(5)
						{activeTab === "owned" && (
							<div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
					<button
						type="button"
						onClick={() => handleTabClick("available")}
						className={`flex-1 py-4 text-sm font-medium relative ${
							activeTab === "available" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
						aria-label="쿠폰받기"
					>
						쿠폰받기(2)
						{activeTab === "available" && (
							<div className="absolute bottom-[-1px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
				</div>
			</div>

			{/* 콘텐츠 영역 */}
			<div className="flex-1">
				{activeTab === "owned" ? (
					<div className="flex flex-col">
						{/* 사용 가능 쿠폰 섹션 */}
						<div className="px-5 py-4">
							<div className="flex justify-between items-center mb-3">
								<h2 className="text-base font-semibold text-[#262626]">
									사용 가능 쿠폰
								</h2>
								<span className="text-sm text-[#8C8C8C]">
									총 {availableCoupons.length}장
								</span>
							</div>
							<div className="flex flex-col gap-3">
								{availableCoupons.map((coupon) => renderCouponCard(coupon))}
							</div>
						</div>

						{/* 구분선 */}
						<div className="h-[10px] bg-[#F7F7F7]" />

						{/* 사용 완료된 쿠폰 섹션 */}
						<div className="px-5 py-4 bg-white">
							<div className="flex justify-between items-center mb-3">
								<h2 className="text-base font-semibold text-[#262626]">
									사용 완료된 쿠폰
								</h2>
								<span className="text-sm text-[#8C8C8C]">
									총 {usedCoupons.length}장
								</span>
							</div>
							<div className="flex flex-col gap-3">
								{usedCoupons.map((coupon) => renderCouponCard(coupon))}
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col">
						<div className="px-5 py-4">
							<div className="flex justify-between items-center mb-3">
								<h2 className="text-base font-semibold text-[#262626]">
									다운로드 가능한 쿠폰
								</h2>
								<span className="text-sm text-[#8C8C8C]">
									총 {availableCoupons.length}장
								</span>
							</div>
							<div className="flex flex-col gap-3">
								{availableCoupons.map((coupon) =>
									renderCouponCard(coupon, true),
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CouponsPage;
