"use client";

import { useState } from "react";
import CalendarIcon from "@/assets/icon/ic_calendar_black_18.svg";
import CardIcon from "@/assets/icon/ic_card_blue.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import TrendUpIcon from "@/assets/icon/ic_trend_up_black_18.svg";
import WalletIcon from "@/assets/icon/ic_wallet_green_18.svg";
import { useMonthlySettlement } from "@/lib/api/hooks/use-settlements";

const SettlementPage = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // 월별 정산 조회
  const { data: settlementData, isLoading: isSettlementLoading } =
    useMonthlySettlement({
      year: selectedYear,
      month: selectedMonth,
    });

  // API 데이터 또는 기본값
  const totalSales = settlementData?.total_sales || 0;
  const commissionAmount = settlementData?.commission_amount || 0;
  const vatAmount = settlementData?.vat_amount || 0;
  const totalDeduction = settlementData?.total_deduction || 0;
  const expectedSettlement = settlementData?.expected_settlement || 0;
  const orderCount = settlementData?.order_count || 0;
  const isSettled = settlementData?.status === "COMPLETED";
  const settlementDate = settlementData?.settlement_date
    ? settlementData.settlement_date.split("-")
    : null;

  // 수수료 비율 계산 (표시용)
  const platformFeeRate =
    totalSales > 0 ? Math.round((commissionAmount / totalSales) * 100) : 0;
  const vatRate =
    commissionAmount > 0 ? Math.round((vatAmount / commissionAmount) * 100) : 0;

  const handleYearMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
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
                {Array.from({ length: 24 }, (_, i) => {
                  // 현재 연도부터 2년 전까지 (총 24개월)
                  const yearOffset = Math.floor(i / 12);
                  const year = currentYear - yearOffset;
                  const month = (i % 12) + 1;
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
                {settlementDate
                  ? `${settlementDate[0]}.${settlementDate[1]}.${settlementDate[2]}`
                  : `${selectedYear}.${String(selectedMonth).padStart(
                      2,
                      "0"
                    )}.15`}
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
                {isSettled ? "정산완료" : "정산대기"}
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
          {isSettlementLoading ? (
            <div className="h-8 bg-[#D9D9D9] rounded animate-pulse mb-1" />
          ) : (
            <>
              <p className="text-2xl font-bold text-[#262626] mb-1">
                {totalSales.toLocaleString()}원
              </p>
              <p className="text-sm text-[#8C8C8C]">
                {selectedYear}년 {selectedMonth}월 총 판매금액
                {orderCount > 0 && ` (주문 ${orderCount}건)`}
              </p>
            </>
          )}
        </div>

        {/* 공제 내역 섹션 */}
        <div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
          <h2 className="text-base font-semibold text-[#262626] mb-4">
            공제 내역
          </h2>
          {isSettlementLoading ? (
            <div className="flex flex-col gap-3">
              <div className="h-12 bg-[#D9D9D9] rounded animate-pulse" />
              <div className="h-12 bg-[#D9D9D9] rounded animate-pulse" />
              <div className="h-12 bg-[#D9D9D9] rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#262626] mb-1">
                    플랫폼 수수료
                  </p>
                  {platformFeeRate > 0 && (
                    <p className="text-xs text-[#8C8C8C]">{platformFeeRate}%</p>
                  )}
                </div>
                <p className="text-sm font-medium text-[#262626]">
                  -{commissionAmount.toLocaleString()}원
                </p>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#262626] mb-1">
                    부가세
                  </p>
                  {vatRate > 0 && (
                    <p className="text-xs text-[#8C8C8C]">
                      수수료의 {vatRate}%
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-[#262626]">
                  -{vatAmount.toLocaleString()}원
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
          )}
        </div>

        {/* 정산 예정금액 섹션 */}
        <div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
          <div className="flex items-center gap-2 mb-3">
            <WalletIcon />
            <h2 className="text-base font-semibold text-[#133A1B]">
              정산 예정금액
            </h2>
          </div>
          {isSettlementLoading ? (
            <div className="h-8 bg-[#D9D9D9] rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[#262626]">
              {expectedSettlement.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 정산 계산식 섹션 */}
        <div className="px-4 py-4 bg-white border border-[#E5E5E5] rounded">
          <h2 className="text-base font-semibold text-[#262626] mb-4">
            정산 계산식
          </h2>
          {isSettlementLoading ? (
            <div className="flex flex-col gap-3">
              <div className="h-6 bg-[#D9D9D9] rounded animate-pulse" />
              <div className="h-6 bg-[#D9D9D9] rounded animate-pulse" />
              <div className="h-6 bg-[#D9D9D9] rounded animate-pulse" />
              <div className="h-6 bg-[#D9D9D9] rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#262626]">총 매출액</p>
                <p className="text-sm font-medium text-[#262626]">
                  {totalSales.toLocaleString()}원
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#262626]">
                  - 플랫폼 수수료
                  {platformFeeRate > 0 && ` (${platformFeeRate}%)`}
                </p>
                <p className="text-sm font-medium text-[#262626]">
                  -{commissionAmount.toLocaleString()}원
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#262626]">
                  - 부가세
                  {vatRate > 0 && ` (수수료의 ${vatRate}%)`}
                </p>
                <p className="text-sm font-medium text-[#262626]">
                  -{vatAmount.toLocaleString()}원
                </p>
              </div>
              <div className="border-t border-[#E5E5E5] pt-3 mt-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#262626]">
                    = 정산 예정금액
                  </p>
                  <p className="text-sm font-semibold text-[#262626]">
                    {expectedSettlement.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          )}
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
