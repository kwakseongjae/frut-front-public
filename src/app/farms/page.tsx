"use client";

import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import FarmCard from "@/components/FarmCard";

export default function FarmsPage() {
	// 더미 농장 데이터 - 초기에는 팔로잉한 농장만 있음
	const initialFarmData = [
		{ id: 1, name: "지혁이 농장", isFollowing: true },
		{ id: 2, name: "최시온 농장", isFollowing: true },
		{ id: 3, name: "민수 농장", isFollowing: true },
	];

	const [farmData, setFarmData] = useState(initialFarmData);
	// 초기 팔로잉 상태였던 농장 ID 추적
	const [initialFollowingIds] = useState(
		new Set(initialFarmData.map((farm) => farm.id))
	);

	const handleFollowToggle = (id: number) => {
		setFarmData((prev) =>
			prev.map((farm) =>
				farm.id === id ? { ...farm, isFollowing: !farm.isFollowing } : farm
			)
		);
	};

	// 초기 팔로잉 상태였던 농장은 언팔로우되어도 계속 표시
	const displayedFarms = farmData.filter(
		(farm) => farm.isFollowing || initialFollowingIds.has(farm.id)
	);

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
					<h1 className="text-lg font-semibold text-[#262626]">팔로우 농장</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 농장 목록 영역 */}
			{displayedFarms.length > 0 ? (
				<div className="px-5 py-4 flex flex-col divide-y divide-[#D9D9D9]">
					{displayedFarms.map((farm) => (
						<FarmCard
							key={farm.id}
							id={farm.id}
							name={farm.name}
							isFollowing={farm.isFollowing}
							onFollowToggle={handleFollowToggle}
						/>
					))}
				</div>
			) : (
				<div className="px-5 py-20 flex flex-col items-center justify-center text-center">
					<p className="font-medium text-[#8C8C8C]">
						팔로우한 농장이 없습니다.
					</p>
				</div>
			)}
		</div>
	);
}
