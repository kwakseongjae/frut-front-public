"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_16.svg";

const BusinessProfileEditPage = () => {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const farmNameId = useId();
	const farmLocationId = useId();
	const introductionId = useId();
	const [farmName, setFarmName] = useState("지혁이 농장");
	const [farmLocation, setFarmLocation] = useState("김포시 걸포동 123길 123호");
	const [introduction, setIntroduction] = useState(
		"항상 소비자를 생각하고 최선을 다하는 농장이 되겠습니다!",
	);
	const [profileImage, setProfileImage] = useState<string | null>(null);

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleImageClick();
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfileImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = () => {
		// TODO: 프로필 수정 API 연결
		console.log("프로필 수정:", {
			farmName,
			farmLocation,
			introduction,
			profileImage,
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
					<h1 className="text-lg font-semibold text-[#262626]">프로필 수정</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 프로필 사진 영역 */}
			<div className="flex flex-col items-center py-8">
				<div className="relative">
					<button
						type="button"
						className="w-32 h-32 rounded-full bg-[#D9D9D9] relative overflow-hidden cursor-pointer"
						onClick={handleImageClick}
						onKeyDown={handleImageKeyDown}
						aria-label="프로필 사진 변경"
					>
						{profileImage ? (
							<Image
								src={profileImage}
								alt="프로필 사진"
								fill
								className="object-cover"
							/>
						) : null}
					</button>
					{/* 플러스 아이콘 버튼 - 이미지 영역 밖에 배치 */}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							handleImageClick();
						}}
						className="absolute right-0 bottom-0 w-10 h-10 backdrop-blur-md bg-white/60 border border-white/30 rounded-full flex items-center justify-center shadow-lg hover:bg-white/70 hover:scale-105 transition-all duration-200 translate-x-1 translate-y-1"
						aria-label="사진 변경"
					>
						<PlusIcon className="drop-shadow-sm" />
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						className="hidden"
					/>
				</div>
			</div>

			{/* 입력 필드 영역 */}
			<div className="flex flex-col px-5 gap-6">
				{/* 농장명 */}
				<div className="flex flex-col gap-[10px]">
					<label
						htmlFor={farmNameId}
						className="text-sm font-medium text-[#595959]"
					>
						농장명
					</label>
					<div className="w-full border border-[#D9D9D9] p-3">
						<input
							type="text"
							id={farmNameId}
							value={farmName}
							onChange={(e) => setFarmName(e.target.value)}
							placeholder="농장명을 입력해 주세요"
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
						/>
					</div>
				</div>

				{/* 농장위치 */}
				<div className="flex flex-col gap-[10px]">
					<label
						htmlFor={farmLocationId}
						className="text-sm font-medium text-[#595959]"
					>
						농장위치
					</label>
					<div className="w-full border border-[#D9D9D9] p-3">
						<input
							type="text"
							id={farmLocationId}
							value={farmLocation}
							onChange={(e) => setFarmLocation(e.target.value)}
							placeholder="농장위치를 입력해 주세요"
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
						/>
					</div>
				</div>

				{/* 소개글 */}
				<div className="flex flex-col gap-[10px]">
					<label
						htmlFor={introductionId}
						className="text-sm font-medium text-[#595959]"
					>
						소개글
					</label>
					<div className="w-full border border-[#D9D9D9] p-3">
						<textarea
							id={introductionId}
							value={introduction}
							onChange={(e) => setIntroduction(e.target.value)}
							placeholder="내용을 입력해 주세요"
							rows={4}
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] resize-none"
						/>
					</div>
				</div>
			</div>

			{/* 하단 수정 버튼 */}
			<div className="mt-auto px-5 py-4 pb-8">
				<button
					type="button"
					onClick={handleSubmit}
					className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
					aria-label="수정"
				>
					수정
				</button>
			</div>
		</div>
	);
};

export default BusinessProfileEditPage;
