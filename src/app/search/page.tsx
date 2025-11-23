"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import SearchIcon from "@/assets/icon/ic_search_grey_22.svg";
import ProductCard from "@/components/ProductCard";

const SearchPageContent = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState("");
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [currentSearchTerm, setCurrentSearchTerm] = useState<string>("");
	const [isComposing, setIsComposing] = useState(false);

	// 추천 검색어 데이터
	const recommendedSearches = ["사과", "복숭아", "지혁이농장", "수박", "참외"];

	// 더미 검색 결과 데이터 생성
	const generateSearchResults = () => {
		const results = [];
		for (let i = 1; i <= 10; i++) {
			results.push({
				id: i,
				originalPrice: 39800 + i * 1000,
				discountedPrice: 17900 + i * 500,
				discountRate: 30 + (i % 20),
				tags: ["고당도", "특가", "신선함"].slice(0, 2 + (i % 2)),
				isSpecialOffer: i % 3 === 0,
			});
		}
		return results;
	};

	const searchResults = currentSearchTerm ? generateSearchResults() : [];
	const resultCount = searchResults.length;

	// localStorage에서 최근 검색어 불러오기 및 URL 파라미터 처리
	useEffect(() => {
		const savedSearches = localStorage.getItem("recentSearches");
		if (savedSearches) {
			setRecentSearches(JSON.parse(savedSearches));
		}

		// URL 파라미터에서 검색어 추출
		const queryParam = searchParams.get("q");
		if (queryParam) {
			setCurrentSearchTerm(queryParam);
		} else {
			// URL에 검색어가 없으면 초기화
			setCurrentSearchTerm("");
		}
	}, [searchParams]);

	// 최근 검색어 저장
	const saveRecentSearch = (query: string) => {
		if (!query.trim()) return;

		const updatedSearches = [
			query,
			...recentSearches.filter((item) => item !== query),
		].slice(0, 10);
		setRecentSearches(updatedSearches);
		localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
	};

	// 개별 검색어 삭제
	const handleDeleteSearch = (index: number) => {
		const updatedSearches = recentSearches.filter((_, i) => i !== index);
		setRecentSearches(updatedSearches);
		localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
	};

	// 전체 검색어 삭제
	const handleDeleteAllSearches = () => {
		setRecentSearches([]);
		localStorage.removeItem("recentSearches");
	};

	// 검색 실행
	const handleSearch = (query: string) => {
		if (query.trim()) {
			// URL에 검색어 반영 (히스토리에 추가)
			router.push(`/search?q=${encodeURIComponent(query.trim())}`);
			// 입력값 지우기
			setSearchQuery("");
			// 검색 결과가 보인 후 최근 검색어에 저장
			setTimeout(() => {
				saveRecentSearch(query.trim());
			}, 1000);
		}
	};

	// 추천 검색어 클릭
	const handleRecommendedClick = (query: string) => {
		setSearchQuery(query);
		handleSearch(query);
	};

	const handleBackClick = () => {
		// 브라우저의 실제 히스토리를 사용하여 뒤로가기
		window.history.back();
	};

	// 입력값 지우기
	const handleClearSearch = () => {
		setSearchQuery("");
	};

	// 한글 조합 시작
	const handleCompositionStart = () => {
		setIsComposing(true);
	};

	// 한글 조합 종료
	const handleCompositionEnd = () => {
		setIsComposing(false);
	};

	return (
		<div className="flex flex-col h-full">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
				<button
					type="button"
					onClick={handleBackClick}
					className="cursor-pointer"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">검색</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 검색 입력 필드 */}
			<div className="px-5 py-4">
				<div className="relative flex items-start px-2 pb-2 border-b-2 border-[#949494] ">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) =>
							e.key === "Enter" && !isComposing && handleSearch(searchQuery)
						}
						onCompositionStart={handleCompositionStart}
						onCompositionEnd={handleCompositionEnd}
						placeholder="상품명 혹은 농장명을 입력해 주세요"
						className="w-full  placeholder:text-[#949494] focus:outline-none font-medium"
					/>
					<button
						type="button"
						onClick={
							searchQuery ? handleClearSearch : () => handleSearch(searchQuery)
						}
						className="cursor-pointer"
					>
						{searchQuery ? <CloseIcon /> : <SearchIcon />}
					</button>
				</div>
			</div>

			{/* 검색 결과가 있을 때 */}
			{currentSearchTerm && (
				<>
					{/* 검색 결과 헤더 */}
					<div className="px-5 pb-3">
						<h2 className="text-lg font-semibold text-[#262626]">
							'{currentSearchTerm}' 검색 결과 {resultCount.toLocaleString()}개
						</h2>
					</div>

					{/* 검색 결과 목록 */}
					<div className="px-5 pb-4">
						<div className="grid grid-cols-2 gap-4">
							{searchResults.map((product) => (
								<ProductCard
									key={product.id}
									id={product.id}
									originalPrice={product.originalPrice}
									discountedPrice={product.discountedPrice}
									discountRate={product.discountRate}
									tags={product.tags}
									isSpecialOffer={product.isSpecialOffer}
								/>
							))}
						</div>
					</div>
				</>
			)}

			{/* 검색 결과가 없을 때만 최근 검색어와 추천 검색어 표시 */}
			{!currentSearchTerm && (
				<>
					{/* 최근 검색어 */}
					{recentSearches.length > 0 && (
						<div className="px-5 py-4">
							<div className="flex justify-between items-center mb-2">
								<h2 className="text-base font-semibold text-[#262626]">
									최근 검색어
								</h2>
								<button
									type="button"
									onClick={handleDeleteAllSearches}
									className="text-sm text-[#949494] cursor-pointer font-medium"
								>
									전체삭제
								</button>
							</div>
							<div className="space-y-0">
								{recentSearches.map((search, index) => (
									<div
										key={`recent-${search}-${Date.now()}`}
										className="flex justify-between items-center py-2.5 px-0.5 border-b border-[#F0F0F0]"
									>
										<button
											type="button"
											onClick={() => handleSearch(search)}
											className=" text-[#595959] cursor-pointer flex-1 text-left"
										>
											{search}
										</button>
										<button
											type="button"
											onClick={() => handleDeleteSearch(index)}
											className="cursor-pointer ml-2"
											aria-label={`${search} 삭제`}
										>
											<CloseIcon />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 추천 검색어 */}
					<div className="px-5 py-4">
						<h2 className="text-base font-semibold text-[#262626] mb-3">
							추천 검색어
						</h2>
						<div className="flex flex-wrap gap-2">
							{recommendedSearches.map((search) => (
								<button
									key={search}
									type="button"
									onClick={() => handleRecommendedClick(search)}
									className="px-4 py-2 bg-[#F0F8F0] text-[#133A1B] text-sm font-medium rounded-full cursor-pointer hover:bg-[#E8F5E8] transition-colors"
								>
									{search}
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

const SearchPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SearchPageContent />
		</Suspense>
	);
};

export default SearchPage;
