"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { fruits } from "@/assets/images/dummy";
import ReviewImageViewer from "@/components/ReviewImageViewer";
import { useProductReviews } from "@/lib/api/hooks/use-product-reviews";

const ProductReviewImagesPage = () => {
	const router = useRouter();
	const params = useParams();
	const productId = parseInt(params.id as string, 10);
	const [viewerImages, setViewerImages] = useState<string[]>([]);
	const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
	const [isViewerOpen, setIsViewerOpen] = useState(false);

	// 리뷰 목록 조회
	const {
		data: reviewsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useProductReviews(productId);

	// 모든 페이지의 리뷰를 평탄화
	const allReviews = useMemo(() => {
		if (!reviewsData?.pages || reviewsData.pages.length === 0) {
			return [];
		}
		return reviewsData.pages.flatMap((page) => {
			if (!page || !page.results) return [];
			return Array.isArray(page.results) ? page.results : [];
		});
	}, [reviewsData]);

	// 더미 이미지 생성 (20개)
	const dummyReviewImages = useMemo(() => {
		const images: string[] = [];
		for (let i = 0; i < 20; i++) {
			images.push(fruits[i % fruits.length]?.image || "");
		}
		return images.filter(Boolean);
	}, []);

	// 리뷰 이미지 수집 (이미지가 있는 리뷰만, 없으면 더미 이미지 사용)
	const reviewImages = useMemo(() => {
		const actualImages = allReviews
			.filter((review) => review.image_url !== null)
			.map((review) => review.image_url as string);

		// 실제 이미지가 없으면 더미 이미지 사용
		return actualImages.length > 0 ? actualImages : dummyReviewImages;
	}, [allReviews, dummyReviewImages]);

	const handleImageClick = (_image: string, index: number) => {
		setViewerImages(reviewImages);
		setViewerInitialIndex(index);
		setIsViewerOpen(true);
	};

	// 무한 스크롤을 위한 Intersection Observer
	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
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

	return (
		<div className="flex flex-col min-h-screen">
			{/* 헤더 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
				<button
					type="button"
					onClick={() => router.back()}
					className="p-1 cursor-pointer"
					aria-label="뒤로가기"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">상품후기</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 리뷰 이미지 격자 */}
			<div className="p-2">
				{reviewImages.length === 0 ? (
					<div className="px-5 py-8 text-center text-sm text-[#8C8C8C]">
						등록된 리뷰 이미지가 없습니다.
					</div>
				) : (
					<div className="grid grid-cols-3 gap-2">
						{reviewImages.map((image, index) => {
							// 고유한 key 생성 (이미지 URL과 인덱스 조합)
							const uniqueKey = `review-image-${index}-${image}`;
							return (
								<button
									key={uniqueKey}
									type="button"
									onClick={() => handleImageClick(image, index)}
									className="aspect-square rounded relative overflow-hidden bg-[#D9D9D9] cursor-pointer"
									aria-label={`리뷰 이미지 ${index + 1}`}
								>
									<Image
										src={image}
										alt={`리뷰 이미지 ${index + 1}`}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 33vw, 33vw"
									/>
								</button>
							);
						})}
						{/* 무한 스크롤 트리거 */}
						{hasNextPage && (
							<div
								ref={observerTarget}
								className="aspect-square flex items-center justify-center"
							>
								{isFetchingNextPage && (
									<span className="text-xs text-[#8C8C8C]">불러오는 중...</span>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* 전체화면 이미지 뷰어 */}
			<ReviewImageViewer
				images={viewerImages}
				initialIndex={viewerInitialIndex}
				isOpen={isViewerOpen}
				onClose={() => setIsViewerOpen(false)}
			/>
		</div>
	);
};

export default ProductReviewImagesPage;






















