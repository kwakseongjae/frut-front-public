"use client";

import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import QuestionCircleIcon from "@/assets/icon/ic_question_circle_grey_15.svg";
import { usePointsBalance, usePointsHistory } from "@/lib/api/hooks/use-points";
import type { PointHistory } from "@/lib/api/points";

const PointsPage = () => {
	const { data: pointsData, isLoading: isPointsLoading } = usePointsBalance();
	const { data: historyData, isLoading: isHistoryLoading } = usePointsHistory();
	const currentPoints = pointsData?.balance || 0;
	const transactions = historyData?.results || [];

	// 날짜 포맷팅 함수
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date
			.toLocaleDateString("ko-KR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.replace(/\. /g, ".")
			.replace(/\.$/, "");
	};

	// 포인트 타입에 따라 색상 결정
	const getPointColor = (pointAmount: number): string => {
		return pointAmount > 0 ? "text-[#133A1B]" : "text-[#F73535]";
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
					<h1 className="text-lg font-semibold text-[#262626]">포인트</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 보유 포인트 섹션 */}
			<div className="flex items-center justify-between px-5 py-4">
				<span className="font-semibold text-[#262626]">보유 포인트</span>
				{isPointsLoading ? (
					<span className="text-lg font-semibold text-[#8C8C8C]">
						로딩 중...
					</span>
				) : (
					<span className="text-lg font-semibold text-[#262626]">
						{currentPoints.toLocaleString()}P
					</span>
				)}
			</div>

			{/* 디바이더 */}
			<div className="h-[10px] bg-[#F7F7F7]" />

			{/* 포인트 사용 / 적립 내역 섹션 */}
			<div className="flex flex-col">
				<div className="px-5 py-4 border-b border-[#E5E5E5]">
					<div className="flex items-center justify-between">
						<h2 className="text-base font-semibold text-[#262626]">
							포인트 사용 / 적립 내역
						</h2>
						<span className="text-xs text-[#8C8C8C]">
							*최근 30일 정보만 노출됩니다
						</span>
					</div>
				</div>

				{/* 내역 리스트 */}
				{isHistoryLoading ? (
					<div className="flex items-center justify-center py-10">
						<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
					</div>
				) : transactions.length === 0 ? (
					<div className="flex items-center justify-center py-10">
						<p className="text-sm text-[#8C8C8C]">포인트 내역이 없습니다.</p>
					</div>
				) : (
					<div className="flex flex-col">
						{transactions.map((transaction: PointHistory, index: number) => (
							<div key={transaction.id}>
								<div className="flex items-center justify-between px-5 py-3">
									<div className="flex flex-col gap-1 flex-1">
										<span className="text-sm text-[#262626]">
											{transaction.reason || transaction.point_type_display}
										</span>
										<span className="text-xs text-[#8C8C8C]">
											{formatDate(transaction.created_at)}
										</span>
									</div>
									<span
										className={`text-sm font-semibold ${getPointColor(
											transaction.point_amount,
										)}`}
									>
										{transaction.point_amount > 0 ? "+" : ""}
										{transaction.point_amount.toLocaleString()}P
									</span>
								</div>
								{index < transactions.length - 1 && (
									<div className="h-px bg-[#E5E5E5]" />
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* 포인트 적립 안내 섹션 */}
			<div className="flex-1 flex items-end">
				<div className="w-full bg-[#F7F7F7] px-5 py-6">
					<div className="flex items-center gap-2 mb-3">
						<div className="flex-shrink-0">
							<QuestionCircleIcon />
						</div>
						<h3 className="text-base font-semibold text-[#262626]">
							포인트 적립 안내
						</h3>
					</div>
					<ul className="flex flex-col gap-2 list-disc list-inside ml-4">
						<li className="text-sm text-[#8C8C8C]">
							구매액의 1%가 포인트로 적립됩니다.
						</li>
						<li className="text-sm text-[#8C8C8C]">리뷰 작성 시 50P 지급</li>
						<li className="text-sm text-[#8C8C8C]">
							포토 리뷰 작성 시 150P 지급
						</li>
						<li className="text-sm text-[#8C8C8C]">
							포인트 유효기간 : 적립일로 부터 1년
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default PointsPage;
