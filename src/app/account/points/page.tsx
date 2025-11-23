"use client";

import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import QuestionCircleIcon from "@/assets/icon/ic_question_circle_grey_15.svg";

interface PointTransaction {
	id: number;
	description: string;
	date: string;
	points: number; // 양수면 적립, 음수면 사용
}

const PointsPage = () => {
	// 더미 데이터
	const currentPoints = 2500;
	const transactions: PointTransaction[] = [
		{
			id: 1,
			description: "사과 5kg 구매",
			date: "2024.10.20",
			points: 2500,
		},
		{
			id: 2,
			description: "내용",
			date: "2024.10.18",
			points: -1000,
		},
		{
			id: 3,
			description: "내용",
			date: "2024.10.16",
			points: 1000,
		},
	];

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
				<span className="text-lg font-semibold text-[#262626]">
					{currentPoints.toLocaleString()}P
				</span>
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
				<div className="flex flex-col">
					{transactions.map((transaction, index) => (
						<div key={transaction.id}>
							<div className="flex items-center justify-between px-5 py-3">
								<div className="flex flex-col gap-1 flex-1">
									<span className="text-sm text-[#262626]">
										{transaction.description}
									</span>
									<span className="text-xs text-[#8C8C8C]">
										{transaction.date}
									</span>
								</div>
								<span
									className={`text-sm font-semibold ${
										transaction.points > 0 ? "text-[#133A1B]" : "text-[#F73535]"
									}`}
								>
									{transaction.points > 0 ? "+" : ""}
									{transaction.points.toLocaleString()}P
								</span>
							</div>
							{index < transactions.length - 1 && (
								<div className="h-px bg-[#E5E5E5]" />
							)}
						</div>
					))}
				</div>
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
							2025.07.12 이후 구매액의 1%가 포인트로 적립됩니다.
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
