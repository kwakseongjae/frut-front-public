"use client";

import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import DownloadIcon from "@/assets/icon/ic_download_green_24.svg";
import type { AvailableCoupon, UserCoupon } from "@/lib/api/coupons";
import {
	useAvailableCoupons,
	useDownloadCoupon,
	useUserCoupons,
} from "@/lib/api/hooks/use-coupons";

interface Coupon {
	id: number;
	discountValue: number;
	couponType: "FIXED_AMOUNT" | "PERCENTAGE";
	title: string;
	description: string;
	minOrderAmount: number;
	expiryDate: string;
	isUsed: boolean;
}

interface AvailableCouponDisplay {
	id: number;
	discountValue: number;
	couponType: "FIXED_AMOUNT" | "PERCENTAGE";
	title: string;
	description: string;
	minOrderAmount: number;
	expiryDate: string;
	isDownloaded: boolean;
}

const CouponsPage = () => {
	const [activeTab, setActiveTab] = useState<"owned" | "available">("owned");
	const { data: userCouponsData, isLoading: isUserCouponsLoading } =
		useUserCoupons();
	const { data: availableCouponsData, isLoading: isAvailableCouponsLoading } =
		useAvailableCoupons();
	const downloadCouponMutation = useDownloadCoupon();

	const handleTabClick = (tab: "owned" | "available") => {
		setActiveTab(tab);
	};

	const handleDownloadCoupon = async (couponId: number) => {
		try {
			await downloadCouponMutation.mutateAsync(couponId);
		} catch (error) {
			console.error("쿠폰 다운로드 실패:", error);
		}
	};

	// API 데이터를 Coupon 형식으로 변환
	const convertToCoupon = (userCoupon: UserCoupon): Coupon => {
		// end_date를 "YYYY.MM.DD" 형식으로 변환
		const endDate = userCoupon.end_date
			? new Date(userCoupon.end_date)
					.toLocaleDateString("ko-KR", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})
					.replace(/\. /g, ".")
					.replace(/\.$/, "")
			: "";

		return {
			id: userCoupon.id,
			discountValue: userCoupon.discount_value,
			couponType: userCoupon.coupon_type,
			title: userCoupon.coupon_name,
			description: userCoupon.description,
			minOrderAmount: userCoupon.min_order_amount,
			expiryDate: endDate,
			isUsed:
				userCoupon.is_used || userCoupon.is_expired || !userCoupon.is_usable,
		};
	};

	const availableCoupons: Coupon[] =
		userCouponsData?.available_coupons.map(convertToCoupon) || [];
	const usedCoupons: Coupon[] =
		userCouponsData?.unavailable_coupons.map(convertToCoupon) || [];
	const availableCount = userCouponsData?.available_count || 0;

	// 다운로드 가능한 쿠폰을 표시 형식으로 변환
	const convertAvailableCoupon = (
		coupon: AvailableCoupon,
	): AvailableCouponDisplay => {
		const endDate = coupon.end_date
			? new Date(coupon.end_date)
					.toLocaleDateString("ko-KR", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})
					.replace(/\. /g, ".")
					.replace(/\.$/, "")
			: "";

		return {
			id: coupon.id,
			discountValue: coupon.discount_value,
			couponType: coupon.coupon_type,
			title: coupon.coupon_name,
			description: coupon.description,
			minOrderAmount: coupon.min_order_amount,
			expiryDate: endDate,
			isDownloaded: coupon.is_downloaded,
		};
	};

	const downloadableCoupons: AvailableCouponDisplay[] =
		availableCouponsData?.coupons.map(convertAvailableCoupon) || [];
	const downloadableCount = availableCouponsData?.count || 0;

	const renderCouponCard = (coupon: Coupon, showDownloadIcon = false) => {
		const isUsed = coupon.isUsed;
		const textColor = isUsed ? "text-[#8C8C8C]" : "text-[#262626]";
		const discountColor = isUsed ? "text-[#8C8C8C]" : "text-[#F73535]";

		// 쿠폰 타입에 따라 할인 표시 (퍼센트 또는 원)
		const discountDisplay =
			coupon.couponType === "PERCENTAGE"
				? `${coupon.discountValue}%`
				: `${coupon.discountValue.toLocaleString()}원`;

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
							{discountDisplay}
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

	const renderAvailableCouponCard = (coupon: AvailableCouponDisplay) => {
		const textColor = "text-[#262626]";
		const discountColor = "text-[#F73535]";

		// 쿠폰 타입에 따라 할인 표시 (퍼센트 또는 원)
		const discountDisplay =
			coupon.couponType === "PERCENTAGE"
				? `${coupon.discountValue}%`
				: `${coupon.discountValue.toLocaleString()}원`;

		return (
			<div
				key={coupon.id}
				className="rounded-lg p-4 border border-[#E5E5E5] bg-white"
			>
				<div className="flex items-center justify-between gap-4">
					<div className="flex flex-col gap-1.5 flex-1">
						<div className={`text-3xl font-bold ${discountColor} mb-1`}>
							{discountDisplay}
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
					{!coupon.isDownloaded && (
						<button
							type="button"
							onClick={() => handleDownloadCoupon(coupon.id)}
							disabled={downloadCouponMutation.isPending}
							className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E6F5E9] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
						보유쿠폰({availableCount})
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
						쿠폰받기({downloadableCount})
						{activeTab === "available" && (
							<div className="absolute bottom-[-1px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
				</div>
			</div>

			{/* 콘텐츠 영역 */}
			<div className="flex-1">
				{activeTab === "owned" ? (
					isUserCouponsLoading ? (
						<div className="flex items-center justify-center py-10">
							<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
						</div>
					) : (
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
								{availableCoupons.length === 0 ? (
									<div className="flex items-center justify-center py-10">
										<p className="text-sm text-[#8C8C8C]">
											사용 가능한 쿠폰이 없습니다.
										</p>
									</div>
								) : (
									<div className="flex flex-col gap-3">
										{availableCoupons.map((coupon) => renderCouponCard(coupon))}
									</div>
								)}
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
								{usedCoupons.length === 0 ? (
									<div className="flex items-center justify-center py-10">
										<p className="text-sm text-[#8C8C8C]">
											사용 완료된 쿠폰이 없습니다.
										</p>
									</div>
								) : (
									<div className="flex flex-col gap-3">
										{usedCoupons.map((coupon) => renderCouponCard(coupon))}
									</div>
								)}
							</div>
						</div>
					)
				) : isAvailableCouponsLoading ? (
					<div className="flex items-center justify-center py-10">
						<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
					</div>
				) : (
					<div className="flex flex-col">
						<div className="px-5 py-4">
							<div className="flex justify-between items-center mb-3">
								<h2 className="text-base font-semibold text-[#262626]">
									다운로드 가능한 쿠폰
								</h2>
								<span className="text-sm text-[#8C8C8C]">
									총 {downloadableCoupons.length}장
								</span>
							</div>
							{downloadableCoupons.length === 0 ? (
								<div className="flex items-center justify-center py-10">
									<p className="text-sm text-[#8C8C8C]">
										다운로드 가능한 쿠폰이 없습니다.
									</p>
								</div>
							) : (
								<div className="flex flex-col gap-3">
									{downloadableCoupons.map((coupon) =>
										renderAvailableCouponCard(coupon),
									)}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CouponsPage;
