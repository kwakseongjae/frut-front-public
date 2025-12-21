"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProductCard from "@/components/ProductCard";
import { useInfiniteProducts } from "@/lib/api/hooks/use-products";

export default function CategoryDetailPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const child = params.child as string;
	const categoryId = searchParams.get("category_id");

	// 카테고리 ID로 상품 목록 조회
	const observerTarget = useRef<HTMLDivElement>(null);
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteProducts({
			category_id: categoryId ? parseInt(categoryId, 10) : undefined,
		});

	// 모든 페이지의 상품을 평탄화
	const products = data?.pages?.flatMap((page) => page?.results ?? []) ?? [];

	// 스켈레톤 로딩용 고유 ID 생성
	const skeletonIds = useMemo(
		() => Array.from({ length: 6 }, () => crypto.randomUUID()),
		[],
	);

	// Intersection Observer로 무한스크롤 구현
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				threshold: 0.1,
			},
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// 소메뉴 이름 디코딩
	const categoryName = decodeURIComponent(child);

	return (
		<div className="flex flex-col">
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
						{categoryName}
					</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 상품 목록 영역 */}
			<div className="px-5 py-4">
				{isLoading ? (
					<div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
						{skeletonIds.map((id) => (
							<div
								key={`category-skeleton-${id}`}
								className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded"
							/>
						))}
					</div>
				) : products.length > 0 ? (
					<>
						<div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
							{products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
						{/* 무한스크롤 트리거 */}
						<div
							ref={observerTarget}
							className="h-10 flex items-center justify-center py-4"
						>
							{isFetchingNextPage && (
								<div className="text-sm text-[#8C8C8C]">로딩 중...</div>
							)}
						</div>
					</>
				) : (
					<div className="flex items-center justify-center py-20">
						<p className="text-[#8C8C8C]">상품이 없습니다.</p>
					</div>
				)}
			</div>
		</div>
	);
}





















