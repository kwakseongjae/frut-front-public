"use client";

import { useState } from "react";
import CalendarIcon from "@/assets/icon/ic_calendar_black_18.svg";
import CardIcon from "@/assets/icon/ic_card_blue.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import TrendUpIcon from "@/assets/icon/ic_trend_up_black_18.svg";
import WalletIcon from "@/assets/icon/ic_wallet_green_18.svg";

const SettlementPage = () => {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [isSettled, setIsSettled] = useState(false); // 정산 완료 여부

	// 더미 데이터
	const totalSales = 10000000; // 1,000만원
	const platformFeeRate = 8;
	const platformFee = Math.floor((totalSales * platformFeeRate) / 100); // 800,000원
	const vatRate = 10; // 수수료의 10%
	const vat = Math.floor((platformFee * vatRate) / 100); // 80,000원
	const totalDeduction = platformFee + vat; // 880,000원
	const estimatedSettlement = totalSales - totalDeduction; // 9,120,000원

	const handleYearMonthChange = (year: number, month: number) => {
		setSelectedYear(year);
		setSelectedMonth(month);
		// TODO: 실제 API 호출로 정산 완료 여부 확인
		setIsSettled(false);
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="p-1 cursor-pointer"
					aria-label="뒤로가기"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">정산관리</h1>
				</div>
				<div className="w-7" />
			</div>

			<div className="px-5 py-4 flex flex-col gap-3">
				{/* 정산 기간 섹션 */}
				<div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<CalendarIcon />
							<h2 className="text-base font-semibold text-[#262626]">
								정산 기간
							</h2>
						</div>
						<div className="relative flex items-center">
							<select
								value={`${selectedYear}-${selectedMonth}`}
								onChange={(e) => {
									const [year, month] = e.target.value.split("-").map(Number);
									handleYearMonthChange(year, month);
								}}
								className="text-sm text-[#262626] bg-transparent border-none outline-none appearance-none pr-6 cursor-pointer"
							>
								{Array.from({ length: 12 }, (_, i) => {
									const year = currentYear;
									const month = i + 1;
									return (
										<option key={`${year}-${month}`} value={`${year}-${month}`}>
											{year}년 {month}월
										</option>
									);
								})}
							</select>
							<div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
								<ChevronRightIcon className="rotate-90" />
							</div>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-[#8C8C8C] mb-1">정산일</p>
							<p className="text-sm font-medium text-[#262626]">
								{selectedYear}.{String(selectedMonth).padStart(2, "0")}.15
							</p>
						</div>
						<div
							className={`px-3 py-1.5 rounded ${
								isSettled
									? "bg-[#E6F5E9] text-[#133A1B]"
									: "bg-[#F5F5F5] text-[#8C8C8C]"
							}`}
						>
							<p className="text-xs font-medium">
								{isSettled ? "정산완료" : "미정산"}
							</p>
						</div>
					</div>
				</div>

				{/* 총 매출액 섹션 */}
				<div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
					<div className="flex items-center gap-2 mb-3">
						<TrendUpIcon />
						<h2 className="text-base font-semibold text-[#262626]">
							총 매출액
						</h2>
					</div>
					<p className="text-2xl font-bold text-[#262626] mb-1">
						{totalSales.toLocaleString()}원
					</p>
					<p className="text-sm text-[#8C8C8C]">
						{selectedYear}년 {selectedMonth}월 총 판매금액
					</p>
				</div>

				{/* 공제 내역 섹션 */}
				<div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
					<h2 className="text-base font-semibold text-[#262626] mb-4">
						공제 내역
					</h2>
					<div className="flex flex-col gap-3">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-[#262626] mb-1">
									플랫폼 수수료
								</p>
								<p className="text-xs text-[#8C8C8C]">{platformFeeRate}%</p>
							</div>
							<p className="text-sm font-medium text-[#262626]">
								-{platformFee.toLocaleString()}원
							</p>
						</div>
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-[#262626] mb-1">
									부가세
								</p>
								<p className="text-xs text-[#8C8C8C]">수수료의 {vatRate}%</p>
							</div>
							<p className="text-sm font-medium text-[#262626]">
								-{vat.toLocaleString()}원
							</p>
						</div>
						<div className="border-t border-[#E5E5E5] pt-3 mt-1">
							<div className="flex items-center justify-between">
								<p className="text-sm font-semibold text-[#262626]">
									총 공제액
								</p>
								<p className="text-sm font-semibold text-[#262626]">
									-{totalDeduction.toLocaleString()}원
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* 정산 예정금액 섹션 */}
				<div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
					<div className="flex items-center gap-2 mb-3">
						<WalletIcon />
						<h2 className="text-base font-semibold text-[#133A1B]">
							정산 예정금액
						</h2>
					</div>
					<p className="text-2xl font-bold text-[#262626] mb-1">
						{estimatedSettlement.toLocaleString()}원
					</p>
					<p className="text-sm text-[#8C8C8C]">
						매출액 {totalSales.toLocaleString()}원 - 공제액{" "}
						{totalDeduction.toLocaleString()}원
					</p>
				</div>

				{/* 정산 계산식 섹션 */}
				<div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
					<h2 className="text-base font-semibold text-[#262626] mb-4">
						정산 계산식
					</h2>
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<p className="text-sm text-[#262626]">총 매출액</p>
							<p className="text-sm font-medium text-[#262626]">
								{totalSales.toLocaleString()}원
							</p>
						</div>
						<div className="flex items-center justify-between">
							<p className="text-sm text-[#262626]">
								- 플랫폼 수수료 ({platformFeeRate}%)
							</p>
							<p className="text-sm font-medium text-[#262626]">
								-{platformFee.toLocaleString()}원
							</p>
						</div>
						<div className="flex items-center justify-between">
							<p className="text-sm text-[#262626]">
								- 부가세 (수수료의 {vatRate}%)
							</p>
							<p className="text-sm font-medium text-[#262626]">
								-{vat.toLocaleString()}원
							</p>
						</div>
						<div className="border-t border-[#E5E5E5] pt-3 mt-1">
							<div className="flex items-center justify-between">
								<p className="text-sm font-semibold text-[#262626]">
									= 정산 예정금액
								</p>
								<p className="text-sm font-semibold text-[#262626]">
									{estimatedSettlement.toLocaleString()}원
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* 카드 수수료 안내 섹션 */}
				<div className="px-4 py-4 bg-[#E6F2FF] border border-[#E5E5E5] rounded">
					<div className="flex items-start gap-2">
						<CardIcon />
						<div>
							<h3 className="text-sm font-semibold text-[#4A90E2] mb-1">
								카드 수수료 안내
							</h3>
							<p className="text-xs text-[#595959] leading-relaxed">
								위 정산 예정금액에서 카드 결제 수수료가 별도로 차감되어 최종
								입금됩니다.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettlementPage;
