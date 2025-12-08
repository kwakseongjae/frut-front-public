"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import { fruits } from "@/assets/images/dummy";

interface Product {
  id: number;
  farmName: string;
  productName: string;
  option: string;
  price: number;
  image: string;
}

const RefundRequestPage = () => {
  const router = useRouter();
  const params = useParams();
  const _itemId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 더미 데이터
  const farmName = "농장명";
  const products: Product[] = [
    {
      id: 1,
      farmName: "농장명",
      productName: "상품명",
      option: "옵션",
      price: 25000,
      image: fruits[0]?.image || "",
    },
    {
      id: 2,
      farmName: "농장명",
      productName: "상품명",
      option: "옵션",
      price: 12000,
      image: fruits[1]?.image || "",
    },
  ];

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [applicationType, setApplicationType] = useState<string>("");
  const [applicationReason, setApplicationReason] = useState<string>("");
  const [detailedReason, setDetailedReason] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const handleProductToggle = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const isAllSelected = selectedProducts.length === products.length;

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
    if (
      selectedProducts.length === 0 ||
      !applicationType ||
      !applicationReason
    ) {
      return;
    }
    // 환불/반품 신청 로직
    console.log("환불/반품 신청:", {
      selectedProducts,
      applicationType,
      applicationReason,
      detailedReason,
      images,
    });
    router.back();
  };

  const isFormValid =
    selectedProducts.length > 0 &&
    applicationType !== "" &&
    applicationReason !== "";

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
          <h1 className="text-lg font-semibold text-[#262626]">환불 / 반품</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 pb-10">
        {/* 농장명 */}
        <div className="px-5">
          <span className="font-semibold text-[#262626]">{farmName}</span>
        </div>

        {/* 신청 상품 선택 */}
        <div className="py-4">
          <div className="px-5 mb-3">
            <button
              type="button"
              onClick={handleSelectAllToggle}
              className="flex items-center gap-3 cursor-pointer text-left w-full"
              aria-label="전체 선택"
            >
              <div className="flex-shrink-0">
                {isAllSelected ? <FilledCheckbox /> : <UnfilledCheckbox />}
              </div>
              <h2 className="text-base font-semibold text-[#262626]">
                신청 상품 선택 ({selectedProducts.length}/{products.length}){" "}
                <span className="text-[#F73535]">*</span>
              </h2>
            </button>
          </div>
          {/* 전체 너비 구분선 */}
          <div className="w-full border-b border-[#E5E5E5]" />
          <div className="px-5 pt-4 flex flex-col gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductToggle(product.id)}
                className="flex items-start gap-3 cursor-pointer text-left w-full"
                aria-label={`${product.productName} 선택`}
              >
                <div className="flex-shrink-0">
                  {selectedProducts.includes(product.id) ? (
                    <FilledCheckbox />
                  ) : (
                    <UnfilledCheckbox />
                  )}
                </div>
                <div className="w-20 h-20 bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-sm text-[#262626]">
                    {product.farmName}
                  </span>
                  <span className="text-sm text-[#262626]">
                    {product.productName}
                  </span>
                  <span className="text-sm text-[#262626]">
                    {product.option}
                  </span>
                  <span className="text-sm font-semibold text-[#262626]">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 디바이더 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 신청 유형 선택 */}
        <div className="px-5 py-4 ">
          <h2 className="text-base font-semibold text-[#262626] mb-3">
            신청 유형 선택 <span className="text-[#F73535]">*</span>
          </h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="applicationType"
                value="refund"
                checked={applicationType === "refund"}
                onChange={(e) => setApplicationType(e.target.value)}
              />
              <span className="text-sm text-[#262626]">
                환불 (결제 금액으로 환불)
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="applicationType"
                value="return"
                checked={applicationType === "return"}
                onChange={(e) => setApplicationType(e.target.value)}
              />
              <span className="text-sm text-[#262626]">
                반품 (같은 제품 재발송)
              </span>
            </label>
          </div>
        </div>

        {/* 디바이더 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 신청 사유 */}
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <h2 className="text-base font-semibold text-[#262626] mb-3">
            신청 사유 <span className="text-[#F73535]">*</span>
          </h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="applicationReason"
                value="defect"
                checked={applicationReason === "defect"}
                onChange={(e) => setApplicationReason(e.target.value)}
              />
              <span className="text-sm text-[#262626]">상품 불량 / 파손</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="applicationReason"
                value="different"
                checked={applicationReason === "different"}
                onChange={(e) => setApplicationReason(e.target.value)}
              />
              <span className="text-sm text-[#262626]">주문 상품과 다름</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="applicationReason"
                value="freshness"
                checked={applicationReason === "freshness"}
                onChange={(e) => setApplicationReason(e.target.value)}
              />
              <span className="text-sm text-[#262626]">신선도 문제</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
              <input
                type="radio"
                name="applicationReason"
                value="other"
                checked={applicationReason === "other"}
                onChange={(e) => setApplicationReason(e.target.value)}
              />
              <span className="text-sm text-[#262626]">기타</span>
            </label>
          </div>
        </div>

        {/* 상세 사유 */}
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-[#262626] mb-3">
            상세 사유
          </h2>
          <textarea
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            placeholder="상세 사유가 있다면 입력해주세요"
            className="w-full min-h-[120px] p-3 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] resize-none focus:outline-none focus:border-[#133A1B]"
          />
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
          disabled={!isFormValid}
          className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="신청하기"
        >
          신청하기
        </button>
      </div>
    </div>
  );
};

export default RefundRequestPage;
