"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";

const WriteNewsPage = () => {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const titleId = useId();
	const contentId = useId();
	const urlId = useId();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [url, setUrl] = useState("");
	const [images, setImages] = useState<string[]>([]);

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
							setImages((prev) => {
								const updated = [...prev, ...newImages];
								return updated.slice(0, 10); // 최대 10개까지만
							});
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
		// TODO: 소식 작성 API 연결
		console.log("소식 작성:", {
			title,
			content,
			url,
			images,
		});
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
					<h1 className="text-lg font-semibold text-[#262626]">소식작성</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 입력 필드 영역 */}
			<div className="flex flex-col px-5 py-4 gap-6">
				{/* 제목 */}
				<div className="flex flex-col gap-[10px]">
					<label
						htmlFor={titleId}
						className="text-sm font-medium text-[#262626]"
					>
						제목
					</label>
					<div className="w-full border border-[#D9D9D9] p-3">
						<input
							type="text"
							id={titleId}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="제목을 입력해 주세요"
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
						/>
					</div>
				</div>

				{/* 본문 */}
				<div className="flex flex-col gap-[10px]">
					<label
						htmlFor={contentId}
						className="text-sm font-medium text-[#262626]"
					>
						본문
					</label>
					<div className="w-full border border-[#D9D9D9] p-3 relative">
						<textarea
							id={contentId}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="전하고 싶은 내용을 작성해주세요"
							maxLength={500}
							rows={6}
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] resize-none"
						/>
						<div className="flex justify-end mt-2">
							<span className="text-sm text-[#8C8C8C]">
								{content.length}/500
							</span>
						</div>
					</div>
				</div>

				{/* URL */}
				<div className="flex flex-col gap-[10px]">
					<label htmlFor={urlId} className="text-sm font-medium text-[#262626]">
						URL
					</label>
					<div className="w-full border border-[#D9D9D9] p-3">
						<input
							type="text"
							id={urlId}
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="URL을 입력해 주세요"
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
						/>
					</div>
				</div>

				{/* 사진 미리보기 */}
				{images.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{images.map((image, index) => (
							<div
								key={image}
								className="relative w-20 h-20 rounded overflow-hidden bg-[#D9D9D9]"
							>
								<Image
									src={image}
									alt={`사진 ${index + 1}`}
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
				)}

				{/* 사진 추가 버튼 */}
				<div>
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
						className="w-full py-[14px] border border-[#133A1B] flex items-center justify-center gap-2 bg-white cursor-pointer"
						aria-label="사진 추가"
					>
						<CameraIcon />
						<span className="text-sm text-[#262626]">
							사진 추가 ({images.length}/10)
						</span>
					</button>
				</div>
			</div>

			{/* 하단 작성 버튼 */}
			<div className="mt-auto px-5 py-4 pb-8">
				<button
					type="button"
					onClick={handleSubmit}
					className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
					aria-label="작성"
				>
					작성
				</button>
			</div>
		</div>
	);
};

export default WriteNewsPage;
