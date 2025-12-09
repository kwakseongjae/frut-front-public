"use client";

import { useEffect, useRef, useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import ProductCard from "@/components/ProductCard";
import ProtectedRoute from "@/components/ProtectedRoute";

type SortOption = "latest" | "price" | "reviews" | "rating";

const sortOptions = [
	{ value: "latest", label: "최신순" },
	{ value: "price", label: "가격순" },
	{ value: "reviews", label: "리뷰많은순" },
	{ value: "rating", label: "별점높은순" },
];

function WishlistPage() {
	const [selectedSort, setSelectedSort] = useState<SortOption>("latest");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// 더미 데이터
	const userName = "김프룻프룻프룻";
	const wishlistCount = 10;
	const wishlistItems = Array.from({ length: 10 }, (_, index) => index + 1);

	// 외부 클릭으로 드롭다운 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDropdownOpen]);

	const handleSortChange = (sort: SortOption) => {
		setSelectedSort(sort);
		setIsDropdownOpen(false);
	};

	const selectedSortLabel =
		sortOptions.find((option) => option.value === selectedSort)?.label ||
		"최신순";

	return (
		<ProtectedRoute>
			<div className="flex flex-col min-h-screen">
				{/* 유저 정보 및 필터 영역 */}
				<div className="px-5 py-2">
					<div className="flex items-center justify-between">
						{/* 유저 정보 */}
						<div className="flex flex-col">
							<h2 className="text-lg font-semibold text-[#262626] flex items-center">
								<span className="text-[#277937] max-w-[80px] truncate">
									{userName}
								</span>
								<span>님이 찜한 상품</span>
							</h2>
							<p className="text-sm text-[#8C8C8C] mt-1">
								총 <span className="text-[#262626]">{wishlistCount}</span>개의
								상품이 찜해져 있습니다
							</p>
						</div>

						{/* 필터 드롭다운 */}
						<div className="relative" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="flex  justify-between items-center gap-2 w-30 px-3 py-2.5 border border-[#D9D9D9] rounded-lg text-sm text-[#262626] bg-white"
							>
								<span>{selectedSortLabel}</span>
								<ChevronRightIcon
									className={`transform transition-transform ${
										isDropdownOpen ? "rotate-270" : "rotate-90"
									}`}
								/>
							</button>

							{/* 드롭다운 메뉴 */}
							{isDropdownOpen && (
								<div className="absolute right-0 top-full mt-1 w-full bg-white border border-[#D9D9D9] rounded-lg shadow-lg z-20">
									{sortOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() =>
												handleSortChange(option.value as SortOption)
											}
											className={`w-full px-3 py-2.5 text-sm text-left first:rounded-t-lg last:rounded-b-lg ${
												selectedSort === option.value
													? "text-[#133A1B] font-medium bg-[#F0F8F0]"
													: "text-[#262626] hover:bg-[#F8F8F8]"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* 상품 목록 영역 */}
				<div className="flex-1 px-5 pt-3 pb-6">
					<div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
						{wishlistItems.map((itemId) => (
							<ProductCard key={itemId} id={itemId} />
						))}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}

export default WishlistPage;
