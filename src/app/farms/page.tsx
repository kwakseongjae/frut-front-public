"use client";

import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import FarmCard from "@/components/FarmCard";

export default function FarmsPage() {
	// 더미 농장 데이터
	const farmData = [
		{ id: 1, name: "지혁이 농장", isFollowing: true },
		{ id: 2, name: "최시온 농장", isFollowing: false },
		{ id: 3, name: "민수 농장", isFollowing: true },
		{ id: 4, name: "서연 농장", isFollowing: false },
		{ id: 5, name: "동현 농장", isFollowing: true },
		{ id: 6, name: "예진 농장", isFollowing: false },
		{ id: 7, name: "준호 농장", isFollowing: true },
		{ id: 8, name: "소영 농장", isFollowing: false },
		{ id: 9, name: "태현 농장", isFollowing: true },
		{ id: 10, name: "미래 농장", isFollowing: false },
		{ id: 11, name: "성민 농장", isFollowing: true },
		{ id: 12, name: "하늘 농장", isFollowing: false },
		{ id: 13, name: "바다 농장", isFollowing: true },
		{ id: 14, name: "산 농장", isFollowing: false },
		{ id: 15, name: "강 농장", isFollowing: true },
	];

	return (
		<div className="flex flex-col">
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
					<h1 className="text-lg font-semibold text-[#262626]">
						이달의 베스트 농장
					</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 농장 목록 영역 */}
			<div className="px-5 py-4 flex flex-col divide-y divide-[#D9D9D9]">
				{farmData.map((farm) => (
					<FarmCard
						key={farm.id}
						id={farm.id}
						name={farm.name}
						isFollowing={farm.isFollowing}
					/>
				))}
			</div>
		</div>
	);
}
