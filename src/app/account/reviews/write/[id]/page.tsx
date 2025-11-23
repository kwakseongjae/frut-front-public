"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_28.svg";
import StarIcon from "@/assets/icon/ic_star_lightgreen_28.svg";
import { fruits } from "@/assets/images/dummy";

const WriteReviewPage = () => {
	const router = useRouter();
	const params = useParams();
	const productId = params.id as string;
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [rating, setRating] = useState<number>(0);
	const [content, setContent] = useState<string>("");
	const [images, setImages] = useState<string[]>([]);

	// 더미 상품 데이터 (실제로는 API에서 가져와야 함)
	const product = {
		id: parseInt(productId, 10),
		farmName: "농장명",
		productName: "상품명",
		option: "옵션",
		image: fruits[0]?.image,
	};

	const handleStarClick = (selectedRating: number) => {
		setRating(selectedRating);
	};

	const renderStars = (currentRating: number) => {
		return Array.from({ length: 5 }, (_, index) => {
			const starValue = index + 1;
			return (
				<button
					key={index.toString()}
					type="button"
					onClick={() => handleStarClick(starValue)}
					className="cursor-pointer"
					aria-label={`${starValue}점`}
				>
					<div className="w-7 h-7">
						{starValue <= currentRating ? <StarIcon /> : <EmptyStarIcon />}
					</div>
				</button>
			);
		});
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const newImages: string[] = [];
			Array.from(files).forEach((file) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					if (reader.result) {
						newImages.push(reader.result as string);
						if (newImages.length === files.length) {
							setImages((prev) => [...prev, ...newImages]);
						}
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const handleAddPhotoClick = () => {
		fileInputRef.current?.click();
	};

	const handleRemoveImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		if (!content.trim()) {
			return;
		}
		// 후기 등록 로직
		console.log("후기 등록:", { rating, content, images });
		router.back();
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* 헤더 영역 */}
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
					<h1 className="text-lg font-semibold text-[#262626]">후기 작성</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 콘텐츠 영역 */}
			<div className="flex-1 pb-20">
				{/* 상품 정보 */}
				<div className="px-5 py-4 border-b border-[#E5E5E5]">
					<div className="flex gap-4">
						{/* 상품 이미지 */}
						<div className="w-20 h-20 bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
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
						<div className="flex flex-col gap-1 flex-1">
							<span className="text-sm text-[#262626]">{product.farmName}</span>
							<span className="text-sm text-[#262626]">
								{product.productName}
							</span>
							<span className="text-sm text-[#262626]">{product.option}</span>
						</div>
					</div>
				</div>

				{/* 상품 만족도 */}
				<div className="px-5 py-4">
					<h2 className="text-base font-semibold text-[#262626] mb-3">
						상품 만족도
					</h2>
					<div className="flex items-center gap-1">{renderStars(rating)}</div>
				</div>

				{/* 디바이더 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 후기 내용 */}
				<div className="px-5 py-4">
					<h2 className="text-base font-semibold text-[#262626] mb-3">
						후기 내용
					</h2>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						maxLength={200}
						placeholder="구매하신 상품의 후기를 남겨주시면 다른 구매자들에게도 도움이 됩니다."
						className="w-full min-h-[120px] p-3 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] resize-none focus:outline-none focus:border-[#133A1B]"
					/>
					<div className="flex justify-end mr-1">
						<span className="text-sm text-[#8C8C8C]">{content.length}/200</span>
					</div>
				</div>

				{/* 첨부한 사진 */}
				{images.length > 0 && (
					<div className="px-5 pb-4">
						<div className="flex flex-wrap gap-2">
							{images.map((image, index) => (
								<div
									key={image}
									className="relative w-20 h-20 rounded overflow-hidden"
								>
									<Image
										src={image}
										alt={`첨부 이미지 ${index + 1}`}
										fill
										className="object-cover"
									/>
									<button
										type="button"
										onClick={() => handleRemoveImage(index)}
										className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
										aria-label="사진 삭제"
									>
										<CloseIcon />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* 사진 추가 버튼 */}
				<div className="px-5 pb-4">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						onChange={handleImageSelect}
						className="hidden"
					/>
					<button
						type="button"
						onClick={handleAddPhotoClick}
						className="w-full py-[14px] border border-[#D9D9D9] flex items-center justify-center gap-2 bg-white cursor-pointer"
						aria-label="사진 추가"
					>
						<CameraIcon />
						<span className="text-sm text-[#262626]">사진 추가</span>
					</button>
				</div>
			</div>

			{/* 하단 고정 버튼 */}
			<div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!content.trim()}
					className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
						!content.trim() ? "opacity-50 cursor-not-allowed" : ""
					}`}
					aria-label="후기 등록하기"
				>
					후기 등록하기
				</button>
			</div>
		</div>
	);
};

export default WriteReviewPage;
