"use client";

import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import BestFarmCard from "@/components/BestFarmCard";

export default function BestFarmsPage() {
	// 더미 농장 데이터 - 이달의 베스트 농장 (고정 데이터)
	// 팔로우 상태는 사용자의 실제 팔로우 상태를 반영
	const initialBestFarmData = [
		{ id: 1, name: "농장명", isFollowing: true },
		{ id: 2, name: "농장명", isFollowing: false },
		{ id: 3, name: "농장명", isFollowing: true },
		{ id: 4, name: "농장명", isFollowing: true },
		{ id: 5, name: "농장명", isFollowing: true },
		{ id: 6, name: "농장명", isFollowing: true },
		{ id: 7, name: "농장명", isFollowing: true },
	];

	const [bestFarmData, setBestFarmData] = useState(initialBestFarmData);

	const handleFollowToggle = (id: number) => {
		setBestFarmData((prev) =>
			prev.map((farm) =>
				farm.id === id ? { ...farm, isFollowing: !farm.isFollowing } : farm,
			),
		);
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
					<h1 className="text-lg font-semibold text-[#262626]">
						이달의 베스트 농장
					</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 농장 목록 영역 */}
			<div className="px-5 py-4 flex flex-col divide-y divide-[#E5E5E5]">
				{bestFarmData.map((farm, index) => (
					<BestFarmCard
						key={farm.id}
						id={farm.id}
						name={farm.name}
						rank={index + 1}
						isFollowing={farm.isFollowing}
						onFollowToggle={handleFollowToggle}
					/>
				))}
			</div>
		</div>
	);
}
