"use client";

import { useMemo } from "react";

const ProductDetailSkeleton = () => {
	const skeletonKeys = useMemo(
		() => Array.from({ length: 6 }, (_, i) => `skeleton-${i}-${Date.now()}`),
		[],
	);

	return (
		<div className="flex flex-col divide-y divide-[#D9D9D9]">
			{/* 이미지 캐러셀 스켈레톤 */}
			<div className="w-full aspect-square bg-[#D9D9D9] animate-pulse" />

			{/* 농장명 및 버튼 스켈레톤 */}
			<div className="flex items-center justify-between px-5 py-[10px]">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-[#D9D9D9] rounded-full animate-pulse" />
					<div className="w-24 h-4 bg-[#D9D9D9] rounded animate-pulse" />
				</div>
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 bg-[#D9D9D9] rounded animate-pulse" />
					<div className="w-6 h-6 bg-[#D9D9D9] rounded animate-pulse" />
				</div>
			</div>

			{/* 상품 정보 스켈레톤 */}
			<div className="flex flex-col gap-3 px-5 py-4">
				<div className="w-3/4 h-6 bg-[#D9D9D9] rounded animate-pulse" />
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 bg-[#D9D9D9] rounded animate-pulse" />
					<div className="w-16 h-4 bg-[#D9D9D9] rounded animate-pulse" />
				</div>
				<div className="w-32 h-8 bg-[#D9D9D9] rounded animate-pulse" />
			</div>

			{/* 탭 스켈레톤 */}
			<div className="flex border-b-2 border-[#D9D9D9] px-5">
				<div className="flex-1 py-3">
					<div className="w-16 h-4 bg-[#D9D9D9] rounded animate-pulse mx-auto" />
				</div>
				<div className="flex-1 py-3">
					<div className="w-16 h-4 bg-[#D9D9D9] rounded animate-pulse mx-auto" />
				</div>
			</div>

			{/* 상세정보 스켈레톤 */}
			<div className="flex flex-col divide-y divide-[#D9D9D9]">
				<div className="w-full h-96 bg-[#D9D9D9] animate-pulse" />
				<div>
					<div className="px-5 py-4 border-b border-[#D9D9D9]">
						<div className="w-24 h-4 bg-[#D9D9D9] rounded animate-pulse" />
					</div>
					<div className="bg-[#F8F8F8] p-5">
						<div className="space-y-3">
							{skeletonKeys.map((key) => (
								<div key={key} className="grid grid-cols-2 gap-4">
									<div className="w-24 h-3 bg-[#D9D9D9] rounded animate-pulse" />
									<div className="w-32 h-3 bg-[#D9D9D9] rounded animate-pulse" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetailSkeleton;
