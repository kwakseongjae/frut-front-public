"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import CheckboxGreenIcon from "@/assets/icon/ic_checkbox_green_18.svg";
import CheckboxGreyIcon from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import InfoCircleGreyIcon from "@/assets/icon/ic_info_circle_grey_20.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_16.svg";
import PlusGreyIcon from "@/assets/icon/ic_plus_grey_18.svg";
import UploadIcon from "@/assets/icon/ic_upload_black_24.svg";
import TiptapEditor from "@/components/editor/TiptapEditor";

interface ProductOption {
	id: string;
	name: string;
	regularPrice: number;
	discountPrice: number;
	isDiscountEnabled: boolean;
}

const WriteProductPage = () => {
	const router = useRouter();
	const productNameId = useId();
	const mainImageInputRef = useRef<HTMLInputElement>(null);
	const additionalImageInputRef = useRef<HTMLInputElement>(null);

	const [mainCategory, setMainCategory] = useState<string>("");
	const [subCategory, setSubCategory] = useState<string>("");
	const [isMainCategoryOpen, setIsMainCategoryOpen] = useState(false);
	const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
	const [productName, setProductName] = useState("");
	const [mainImage, setMainImage] = useState<string | null>(null);
	const [additionalImages, setAdditionalImages] = useState<string[]>([]);
	const [options, setOptions] = useState<ProductOption[]>([
		{
			id: "1",
			name: "",
			regularPrice: 0,
			discountPrice: 0,
			isDiscountEnabled: false,
		},
	]);
	const [productInfo, setProductInfo] = useState({
		productName: "",
		manufacturer: "",
		manufactureDate: "",
		expirationDate: "",
		legalInfo: "",
		composition: "",
		storageMethod: "",
		customerServicePhone: "",
	});
	const [editorContent, setEditorContent] = useState("");

	// 더미 카테고리 데이터
	const mainCategories = ["과일", "채소", "견과류", "기타"];
	const subCategories: { [key: string]: string[] } = {
		과일: ["수박", "사과", "배", "딸기"],
		채소: ["상추", "배추", "시금치"],
		견과류: ["땅콩", "호두", "아몬드"],
		기타: ["기타"],
	};

	const handleMainCategorySelect = (category: string) => {
		setMainCategory(category);
		setSubCategory("");
		setIsMainCategoryOpen(false);
	};

	const handleSubCategorySelect = (category: string) => {
		setSubCategory(category);
		setIsSubCategoryOpen(false);
	};

	const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (reader.result) {
					setMainImage(reader.result as string);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAdditionalImageSelect = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const newImages: string[] = [];
			Array.from(files).forEach((file) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					if (reader.result) {
						newImages.push(reader.result as string);
						if (newImages.length === files.length) {
							setAdditionalImages((prev) => {
								const updated = [...prev, ...newImages];
								return updated.slice(0, 9);
							});
						}
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const handleRemoveMainImage = () => {
		setMainImage(null);
	};

	const handleRemoveAdditionalImage = (index: number) => {
		setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleOptionChange = (
		id: string,
		field: keyof ProductOption,
		value: string | number | boolean,
	) => {
		setOptions((prev) =>
			prev.map((option) => {
				if (option.id === id) {
					const updated = { ...option, [field]: value };
					// 설정 안함일 경우 할인가 = 정가
					if (field === "isDiscountEnabled" && !value) {
						updated.discountPrice = updated.regularPrice;
					}
					// 정가 변경 시 설정 안함이면 할인가도 함께 변경
					if (field === "regularPrice" && !updated.isDiscountEnabled) {
						updated.discountPrice = value as number;
					}
					// 할인가가 정상가보다 크면 정상가로 제한
					if (field === "discountPrice" && updated.regularPrice > 0) {
						const discountValue = value as number;
						if (discountValue > updated.regularPrice) {
							updated.discountPrice = updated.regularPrice;
						}
					}
					return updated;
				}
				return option;
			}),
		);
	};

	const handleAddOption = () => {
		setOptions((prev) => [
			...prev,
			{
				id: Date.now().toString(),
				name: "",
				regularPrice: 0,
				discountPrice: 0,
				isDiscountEnabled: false,
			},
		]);
	};

	const handleRemoveOption = (id: string) => {
		if (options.length > 1) {
			setOptions((prev) => prev.filter((option) => option.id !== id));
		}
	};

	const calculateDiscountPercent = (
		regularPrice: number,
		discountPrice: number,
	): number => {
		if (regularPrice === 0) return 0;
		return Math.round(((regularPrice - discountPrice) / regularPrice) * 100);
	};

	const handleSubmit = () => {
		// TODO: 상품 등록 API 연결
		console.log("상품 등록:", {
			mainCategory,
			subCategory,
			productName,
			mainImage,
			additionalImages,
			options,
			productInfo,
			description: editorContent,
		});
		router.push("/account/business/products");
	};

	return (
		<div className="flex flex-col min-h-screen bg-white relative">
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
					<h1 className="text-lg font-semibold text-[#262626]">상품등록</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 입력 필드 영역 */}
			<div className="flex flex-col px-5 py-4 gap-6 pb-4">
				{/* 카테고리 설정 */}
				<div className="flex flex-col gap-[10px]">
					<div className="text-base font-medium text-[#262626]">
						카테고리 설정
					</div>
					<div className="flex flex-col gap-2">
						{/* 대메뉴 */}
						<div className="relative">
							<button
								type="button"
								onClick={() => {
									setIsMainCategoryOpen(!isMainCategoryOpen);
									setIsSubCategoryOpen(false);
								}}
								className="w-full border border-[#D9D9D9] p-3 flex items-center justify-between text-sm text-left"
								aria-label="대메뉴 선택"
							>
								<span
									className={mainCategory ? "text-[#262626]" : "text-[#949494]"}
								>
									{mainCategory || "대메뉴"}
								</span>
								<ChevronRightIcon
									className={`transform transition-transform rotate-90 ${
										isMainCategoryOpen ? "rotate-[270deg]" : ""
									}`}
								/>
							</button>
							{isMainCategoryOpen && (
								<>
									<button
										type="button"
										className="fixed inset-0 z-10"
										onClick={() => setIsMainCategoryOpen(false)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setIsMainCategoryOpen(false);
											}
										}}
										aria-label="카테고리 메뉴 닫기"
									/>
									<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D9D9D9] z-20 max-h-48 overflow-y-auto">
										{mainCategories.map((category) => (
											<button
												key={category}
												type="button"
												onClick={() => handleMainCategorySelect(category)}
												className="w-full px-3 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5]"
											>
												{category}
											</button>
										))}
									</div>
								</>
							)}
						</div>

						{/* 소메뉴 */}
						<div className="relative">
							<button
								type="button"
								onClick={() => {
									if (mainCategory) {
										setIsSubCategoryOpen(!isSubCategoryOpen);
										setIsMainCategoryOpen(false);
									}
								}}
								disabled={!mainCategory}
								className={`w-full border border-[#D9D9D9] p-3 flex items-center justify-between text-sm text-left ${
									!mainCategory ? "opacity-50 cursor-not-allowed" : ""
								}`}
								aria-label="소메뉴 선택"
							>
								<span
									className={subCategory ? "text-[#262626]" : "text-[#949494]"}
								>
									{subCategory || "소메뉴"}
								</span>
								<ChevronRightIcon
									className={`transform transition-transform rotate-90 ${
										isSubCategoryOpen ? "rotate-[270deg]" : ""
									}`}
								/>
							</button>
							{isSubCategoryOpen && mainCategory && (
								<>
									<button
										type="button"
										className="fixed inset-0 z-10"
										onClick={() => setIsSubCategoryOpen(false)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setIsSubCategoryOpen(false);
											}
										}}
										aria-label="카테고리 메뉴 닫기"
									/>
									<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D9D9D9] z-20 max-h-48 overflow-y-auto">
										{subCategories[mainCategory]?.map((category) => (
											<button
												key={category}
												type="button"
												onClick={() => handleSubCategorySelect(category)}
												className="w-full px-3 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5]"
											>
												{category}
											</button>
										))}
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				{/* 상품명 */}
				<div className="flex flex-col gap-[10px]">
					<label
						htmlFor={productNameId}
						className="text-base font-medium text-[#262626]"
					>
						상품명
					</label>
					<div className="w-full border border-[#D9D9D9] p-3">
						<input
							type="text"
							id={productNameId}
							value={productName}
							onChange={(e) => setProductName(e.target.value)}
							placeholder="상품명을 입력하세요"
							className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
						/>
					</div>
				</div>

				{/* 메인 이미지 */}
				<div className="flex flex-col gap-[10px]">
					<div className="text-base font-medium text-[#262626]">
						메인 이미지
					</div>
					<div className="w-full border border-[#D9D9D9] p-4 min-h-[200px] flex flex-col items-center justify-center gap-2 relative">
						{mainImage ? (
							<>
								<div className="relative w-full aspect-square rounded overflow-hidden">
									<Image
										src={mainImage}
										alt="메인 상품 이미지"
										fill
										className="object-cover"
									/>
								</div>
								<button
									type="button"
									onClick={handleRemoveMainImage}
									className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
									aria-label="이미지 삭제"
								>
									<CloseIcon />
								</button>
							</>
						) : (
							<>
								<CameraIcon />
								<span className="text-sm text-[#262626]">메인 상품 이미지</span>
								<span className="text-xs text-[#8C8C8C]">
									권장 해상도: 000x000
								</span>
							</>
						)}
						<input
							ref={mainImageInputRef}
							type="file"
							accept="image/*"
							onChange={handleMainImageSelect}
							className="hidden"
						/>
						<button
							type="button"
							onClick={() => mainImageInputRef.current?.click()}
							className="flex items-center gap-1 text-sm text-[#262626] border border-[#D9D9D9] px-3 py-1.5"
							aria-label="이미지 선택"
						>
							<UploadIcon />
							<span>이미지 선택</span>
						</button>
					</div>
				</div>

				{/* 추가 이미지 */}
				<div className="flex flex-col gap-[10px]">
					<div className="flex items-center justify-between">
						<div className="text-base font-medium text-[#262626]">
							추가 이미지
						</div>
						<span className="text-xs text-[#8C8C8C]">
							최대 9장까지 추가 가능
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{additionalImages.map((image, index) => (
							<div
								key={image}
								className="relative w-[140px] h-[140px] rounded overflow-hidden bg-[#D9D9D9]"
							>
								<Image
									src={image}
									alt={`추가 이미지 ${index + 1}`}
									fill
									className="object-cover"
								/>
								<button
									type="button"
									onClick={() => handleRemoveAdditionalImage(index)}
									className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
									aria-label="이미지 삭제"
								>
									<CloseIcon />
								</button>
							</div>
						))}
						{additionalImages.length < 9 && (
							<button
								type="button"
								onClick={() => additionalImageInputRef.current?.click()}
								className="w-[140px] h-[140px] border border-[#D9D9D9] flex flex-col items-center justify-center gap-1"
								aria-label="이미지 추가"
							>
								<PlusGreyIcon />
								<span className="text-[12px] font-medium text-[#818181]">
									{additionalImages.length}/9
								</span>
							</button>
						)}
						<input
							ref={additionalImageInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleAdditionalImageSelect}
							className="hidden"
						/>
					</div>
				</div>

				{/* 옵션 설정 */}
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<div className="text-base font-medium text-[#262626]">
							옵션 설정 <span className="text-red-500">*</span>
						</div>
						<div className="flex items-center gap-1">
							<InfoCircleGreyIcon />
							<span className="text-xs text-[#8C8C8C]">
								옵션 1의 가격이 상품 기본 가격으로 설정됩니다.
							</span>
						</div>
					</div>
					{options.map((option, index) => (
						<div key={option.id} className="flex flex-col gap-3">
							{index > 0 && <div className="border-t border-[#E5E5E5] pt-4" />}
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-[#262626]">
									옵션 {index + 1}
								</span>
								{options.length > 1 && (
									<button
										type="button"
										onClick={() => handleRemoveOption(option.id)}
										className="text-sm text-red-500 hover:text-red-700"
										aria-label="옵션 삭제"
									>
										삭제
									</button>
								)}
							</div>
							<div className="flex flex-col gap-[10px]">
								{/* 옵션명 */}
								<div className="flex flex-col gap-[10px]">
									<div className="text-sm text-[#262626]">옵션명</div>
									<input
										type="text"
										value={option.name}
										onChange={(e) =>
											handleOptionChange(option.id, "name", e.target.value)
										}
										placeholder="옵션명을 입력하세요"
										className="w-full border border-[#D9D9D9] p-3 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
									/>
								</div>

								{/* 정가 */}
								<div className="flex flex-col gap-[10px]">
									<div className="text-sm text-[#262626]">정가</div>
									<div className="border border-[#D9D9D9] p-3 flex items-center justify-end gap-1">
										<input
											type="text"
											inputMode="numeric"
											pattern="[0-9]*"
											value={option.regularPrice || ""}
											onChange={(e) => {
												const value = e.target.value.replace(/[^0-9]/g, "");
												handleOptionChange(
													option.id,
													"regularPrice",
													value === "" ? 0 : Number(value),
												);
											}}
											placeholder="0"
											className="text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full"
										/>
										<span className="text-sm text-[#8C8C8C]">원</span>
									</div>
								</div>

								{/* 할인가 */}
								<div className="flex flex-col gap-[10px]">
									<div className="text-sm text-[#262626]">할인가</div>
									<div className="relative">
										<div
											className={`border border-[#D9D9D9] p-3 flex items-center justify-end gap-1 ${
												!option.isDiscountEnabled ? "bg-[#F5F5F5]" : ""
											}`}
										>
											<input
												type="text"
												inputMode="numeric"
												pattern="[0-9]*"
												value={option.discountPrice || ""}
												onChange={(e) => {
													const value = e.target.value.replace(/[^0-9]/g, "");
													const numValue = value === "" ? 0 : Number(value);
													// 정상가보다 큰 값이면 정상가로 제한
													const finalValue =
														option.regularPrice > 0 &&
														numValue > option.regularPrice
															? option.regularPrice
															: numValue;
													handleOptionChange(
														option.id,
														"discountPrice",
														finalValue,
													);
												}}
												disabled={!option.isDiscountEnabled}
												placeholder="0"
												className={`text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full ${
													!option.isDiscountEnabled ? "cursor-not-allowed" : ""
												}`}
											/>
											<span className="text-sm text-[#8C8C8C]">원</span>
										</div>
										{option.isDiscountEnabled &&
											option.regularPrice > 0 &&
											option.discountPrice < option.regularPrice && (
												<div className="absolute right-0 bottom-[-20px] text-sm text-red-500 font-medium">
													{calculateDiscountPercent(
														option.regularPrice,
														option.discountPrice,
													)}
													%
												</div>
											)}
									</div>
								</div>

								{/* 설정/설정 안함 체크박스 */}
								<div className="flex items-center gap-4">
									<label className="flex items-center gap-2 cursor-pointer">
										<button
											type="button"
											onClick={() =>
												handleOptionChange(option.id, "isDiscountEnabled", true)
											}
											className="flex items-center justify-center"
											aria-label="설정"
										>
											{option.isDiscountEnabled ? (
												<CheckboxGreenIcon />
											) : (
												<CheckboxGreyIcon />
											)}
										</button>
										<span className="text-sm text-[#262626]">설정</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<button
											type="button"
											onClick={() =>
												handleOptionChange(
													option.id,
													"isDiscountEnabled",
													false,
												)
											}
											className="flex items-center justify-center"
											aria-label="설정 안함"
										>
											{!option.isDiscountEnabled ? (
												<CheckboxGreenIcon />
											) : (
												<CheckboxGreyIcon />
											)}
										</button>
										<span className="text-sm text-[#262626]">설정 안함</span>
									</label>
								</div>
							</div>
						</div>
					))}
					<button
						type="button"
						onClick={handleAddOption}
						className="w-full border border-[#D9D9D9] p-3 flex items-center justify-center gap-1 text-sm text-[#262626]"
						aria-label="옵션 추가"
					>
						<PlusIcon />
						<span>옵션 추가</span>
					</button>
				</div>

				{/* 상품 정보 */}
				<div className="flex flex-col gap-[10px]">
					<div className="text-base font-medium text-[#262626]">상품 정보</div>
					<div className="border border-[#D9D9D9] flex flex-col">
						{[
							{ key: "productName", label: "제품명" },
							{ key: "manufacturer", label: "생산자 및 소재지" },
							{
								key: "manufactureDate",
								label: "제조연월일(포장일 또는 생산연도)",
							},
							{ key: "expirationDate", label: "유통기한 또는 품질유지기한" },
							{ key: "legalInfo", label: "관련법상 표시사항" },
							{ key: "composition", label: "상품구성" },
							{ key: "storageMethod", label: "보관방법 또는 취급방법" },
							{
								key: "customerServicePhone",
								label: "소비자상담 관련 전화번호",
							},
						].map(({ key, label }, index) => (
							<div
								key={key}
								className={`flex items-center gap-4 p-3 ${
									index !==
									[
										"productName",
										"manufacturer",
										"manufactureDate",
										"expirationDate",
										"legalInfo",
										"composition",
										"storageMethod",
										"customerServicePhone",
									].length -
										1
										? "border-b border-[#E5E5E5]"
										: ""
								}`}
							>
								<span className="text-sm text-[#262626] min-w-[140px] flex-shrink-0 text-left">
									{label}
								</span>
								<input
									type="text"
									value={productInfo[key as keyof typeof productInfo]}
									onChange={(e) =>
										setProductInfo((prev) => ({
											...prev,
											[key]: e.target.value,
										}))
									}
									placeholder="내용을 입력하세요"
									className="flex-1 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-right"
								/>
							</div>
						))}
					</div>
				</div>

				{/* 상품 설명 */}
				<div className="flex flex-col gap-[10px]">
					<div className="text-base font-medium text-[#262626]">상품 설명</div>
					<TiptapEditor
						content={editorContent}
						onChange={setEditorContent}
						placeholder="상품에 대한 상세한 설명을 작성해주세요."
					/>
				</div>
			</div>

			{/* 하단 등록 버튼 */}
			<div className="sticky bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-[#E5E5E5] z-10">
				<button
					type="button"
					onClick={handleSubmit}
					className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
					aria-label="상품등록"
				>
					상품등록
				</button>
			</div>
		</div>
	);
};

export default WriteProductPage;
