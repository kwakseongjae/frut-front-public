"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_18.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import { fruits } from "@/assets/images/dummy";

interface PurchasedProduct {
	id: number;
	farmName: string;
	productName: string;
	option: string;
	purchaseDate: string;
	image?: string;
}

interface WrittenReview {
	id: number;
	rating: number;
	date: string;
	productName: string;
	farmName: string;
	option: string;
	content: string;
	productImage?: string;
}

const ReviewsPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"write" | "written">("write");

	const handleTabClick = (tab: "write" | "written") => {
		setActiveTab(tab);
	};

	// 더미 데이터 - 작성 가능한 상품
	const availableProducts: PurchasedProduct[] = [
		{
			id: 1,
			farmName: "농장명",
			productName: "상품명",
			option: "옵션",
			purchaseDate: "2025.00.00",
			image: fruits[0]?.image,
		},
		{
			id: 2,
			farmName: "농장명",
			productName: "상품명",
			option: "옵션",
			purchaseDate: "2025.00.00",
			image: fruits[1]?.image,
		},
	];

	// 더미 데이터 - 작성한 후기
	const writtenReviews: WrittenReview[] = [
		{
			id: 1,
			rating: 4,
			date: "2025.05.24",
			productName: "줄무늬 수박",
			farmName: "농장명",
			option: "옵션",
			content: "후기 내용 후기 내용",
			productImage: fruits[0]?.image,
		},
		{
			id: 2,
			rating: 4,
			date: "2025.05.24",
			productName: "줄무늬 수박",
			farmName: "농장명",
			option: "옵션",
			content: "후기 내용 후기 내용 후기 내용",
		},
		{
			id: 3,
			rating: 4,
			date: "2025.05.24",
			productName: "줄무늬 수박",
			farmName: "농장명",
			option: "옵션",
			content: "후기 내용",
			productImage: fruits[2]?.image,
		},
	];

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, index) => (
			<div key={index.toString()} className="w-4 h-4">
				{index < rating ? <StarIcon /> : <EmptyStarIcon />}
			</div>
		));
	};

	const handleWriteReview = (productId: number) => {
		router.push(`/account/reviews/write/${productId}`);
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
					<h1 className="text-lg font-semibold text-[#262626]">상품후기</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 탭 내비게이션 */}
			<div className="sticky top-[52px] z-10 bg-white border-b-2 border-[#E5E5E5]">
				<div className="flex">
					<button
						type="button"
						onClick={() => handleTabClick("write")}
						className={`flex-1 py-4 text-sm font-medium relative ${
							activeTab === "write" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
						aria-label="상품후기 작성"
					>
						상품후기 작성
						{activeTab === "write" && (
							<div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
					<button
						type="button"
						onClick={() => handleTabClick("written")}
						className={`flex-1 py-4 text-sm font-medium relative ${
							activeTab === "written" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
						aria-label="작성한 상품후기"
					>
						작성한 상품후기
						{activeTab === "written" && (
							<div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
				</div>
			</div>

			{/* 콘텐츠 영역 */}
			<div className="flex-1">
				{activeTab === "write" ? (
					<div className="flex flex-col">
						{availableProducts.length > 0 ? (
							<div className="flex flex-col divide-y divide-[#E5E5E5]">
								{availableProducts.map((product) => (
									<div key={product.id} className="px-5 py-4">
										<div className="flex flex-col gap-4">
											<div className="flex gap-4">
												{/* 상품 이미지 */}
												<div className="w-[100px] h-[100px] bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
													{product.image && (
														<Image
															src={product.image}
															alt={product.productName}
															fill
															className="object-cover"
														/>
													)}
												</div>

												{/* 상품 정보 */}
												<div className="flex flex-col flex-1 gap-1">
													<span className="text-sm text-[#262626]">
														{product.farmName}
													</span>
													<span className="text-sm text-[#262626]">
														{product.productName}
													</span>
													<span className="text-sm text-[#262626]">
														{product.option}
													</span>
													<span className="text-sm text-[#8C8C8C]">
														구매일: {product.purchaseDate}
													</span>
												</div>
											</div>

											{/* 후기 작성하기 버튼 */}
											<button
												type="button"
												onClick={() => handleWriteReview(product.id)}
												className="w-full py-2.5 bg-[#133A1B] text-white text-sm font-medium"
												aria-label="후기 작성하기"
											>
												후기 작성하기
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="px-5 py-20 flex flex-col items-center justify-center text-center">
								<p className="font-medium text-[#8C8C8C]">
									작성 가능한 상품후기가 없습니다.
								</p>
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col">
						{writtenReviews.length > 0 ? (
							<div className="flex flex-col">
								{writtenReviews.map((review, index) => (
									<div key={review.id}>
										<div className="px-5 py-4">
											{/* 별점과 날짜 */}
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-1">
													{renderStars(review.rating)}
												</div>
												<span className="text-xs text-[#8C8C8C]">
													{review.date}
												</span>
											</div>

											{/* 상품명 */}
											<div className="mb-3">
												<span className="text-sm font-medium text-[#262626]">
													{review.productName}
												</span>
											</div>

											{/* 상품 이미지와 상세 정보 */}
											<div className="flex gap-4 mb-3">
												{/* 상품 이미지 */}
												{review.productImage && (
													<div className="w-20 h-20 bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
														<Image
															src={review.productImage}
															alt={review.productName}
															fill
															className="object-cover"
														/>
													</div>
												)}

												{/* 상품 상세 정보 */}
												<div className="flex flex-col gap-1 flex-1">
													<span className="text-xs text-[#8C8C8C]">
														{review.farmName}
													</span>
													<span className="text-xs text-[#8C8C8C]">
														{review.productName}
													</span>
													<span className="text-xs text-[#8C8C8C]">
														{review.option}
													</span>
												</div>
											</div>

											{/* 후기 내용 */}
											<p className="text-sm text-[#262626] leading-relaxed">
												{review.content}
											</p>
										</div>
										{index < writtenReviews.length - 1 && (
											<div className="h-[10px] bg-[#F7F7F7]" />
										)}
									</div>
								))}
							</div>
						) : (
							<div className="px-5 py-20 flex flex-col items-center justify-center text-center">
								<p className="font-medium text-[#8C8C8C]">
									작성한 상품 후기가 없습니다.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ReviewsPage;
