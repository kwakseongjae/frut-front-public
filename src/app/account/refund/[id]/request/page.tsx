"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import {
  useCreateRedelivery,
  useCreateRefund,
  useRefundableItemDetail,
} from "@/lib/api/hooks/use-order";
import type { RedeliveryRequest, RefundRequest } from "@/lib/api/orders";
import { uploadApi } from "@/lib/api/upload";

const RefundRequestPage = () => {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numericItemId = parseInt(itemId, 10);
  const { data: itemDetail, isLoading } =
    useRefundableItemDetail(numericItemId);

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [applicationType, setApplicationType] = useState<string>("");
  const [applicationReason, setApplicationReason] = useState<string>("");
  const [detailedReason, setDetailedReason] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 환불 시 필요한 계좌 정보
  const [refundHolder, setRefundHolder] = useState<string>("");
  const [refundBank, setRefundBank] = useState<string>("");
  const [refundAccount, setRefundAccount] = useState<string>("");

  const createRefundMutation = useCreateRefund();
  const createRedeliveryMutation = useCreateRedelivery();

  // 상품 데이터 로드 시 자동 선택
  useEffect(() => {
    if (itemDetail) {
      setSelectedProducts([itemDetail.id]);
    }
  }, [itemDetail]);

  const handleProductToggle = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllToggle = () => {
    if (itemDetail) {
      if (selectedProducts.length === 1) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts([itemDetail.id]);
      }
    }
  };

  const isAllSelected = itemDetail
    ? selectedProducts.length === 1 && selectedProducts.includes(itemDetail.id)
    : false;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setImageFiles((prev) => [...prev, ...fileArray]);
      const newImages: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
            if (newImages.length === fileArray.length) {
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
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // reason_type 매핑
  const getReasonType = (
    reason: string
  ): "PRODUCT_DEFECT" | "WRONG_PRODUCT" | "FRESHNESS_ISSUE" | "OTHER" => {
    switch (reason) {
      case "defect":
        return "PRODUCT_DEFECT";
      case "different":
        return "WRONG_PRODUCT";
      case "freshness":
        return "FRESHNESS_ISSUE";
      case "other":
        return "OTHER";
      default:
        return "OTHER";
    }
  };

  // GCS에 이미지 업로드
  const uploadImageToGCS = async (file: File): Promise<string> => {
    const signedUrlData = await uploadApi.generateSignedUrl({
      file_name: file.name,
      content_type: file.type,
    });
    await uploadApi.uploadToGCS(file, signedUrlData.signed_url);
    return signedUrlData.gcs_path;
  };

  const handleSubmit = async () => {
    if (
      selectedProducts.length === 0 ||
      !applicationType ||
      !applicationReason ||
      !itemDetail ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 이미지 업로드 (GCS)
      const uploadedImages = await Promise.all(
        imageFiles.map((file) => uploadImageToGCS(file))
      );

      // 2. reason_type 매핑
      const reasonType = getReasonType(applicationReason);

      // 3. 환불 또는 반품에 따라 다른 API 호출
      if (applicationType === "refund") {
        // 환불 신청
        const refundRequest: RefundRequest = {
          payment_id: itemDetail.payment_id,
          reason_type: reasonType,
          reason_detail: detailedReason.trim() || undefined,
          refund_images: uploadedImages.length > 0 ? uploadedImages : undefined,
          refund_amount: itemDetail.paid_amount,
          refund_holder: refundHolder.trim(),
          refund_bank: refundBank.trim(),
          refund_account: refundAccount.trim(),
        };
        await createRefundMutation.mutateAsync(refundRequest);
      } else if (applicationType === "return") {
        // 반품 신청
        const redeliveryRequest: RedeliveryRequest = {
          order_item_id: itemDetail.id,
          reason_type: reasonType,
          reason_detail: detailedReason.trim() || undefined,
          redelivery_images:
            uploadedImages.length > 0 ? uploadedImages : undefined,
        };
        await createRedeliveryMutation.mutateAsync(redeliveryRequest);
      }

      alert("환불/반품 신청이 완료되었습니다.");
      router.back();
    } catch (error) {
      console.error("환불/반품 신청 실패:", error);
      alert("환불/반품 신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    selectedProducts.length > 0 &&
    applicationType !== "" &&
    applicationReason !== "" &&
    (applicationType === "return" ||
      (applicationType === "refund" &&
        refundHolder.trim() !== "" &&
        refundBank.trim() !== "" &&
        refundAccount.trim() !== ""));

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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
          </div>
        ) : itemDetail ? (
          <>
            {/* 농장명 */}
            <div className="px-5">
              <span className="font-semibold text-[#262626]">
                {itemDetail.farm_name}
              </span>
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
                    신청 상품 선택 ({selectedProducts.length}/1){" "}
                    <span className="text-[#F73535]">*</span>
                  </h2>
                </button>
              </div>
              {/* 전체 너비 구분선 */}
              <div className="w-full border-b border-[#E5E5E5]" />
              <div className="px-5 pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleProductToggle(itemDetail.id)}
                  className="flex items-start gap-3 cursor-pointer text-left w-full"
                  aria-label={`${itemDetail.product_name} 선택`}
                >
                  <div className="flex-shrink-0">
                    {selectedProducts.includes(itemDetail.id) ? (
                      <FilledCheckbox />
                    ) : (
                      <UnfilledCheckbox />
                    )}
                  </div>
                  <div className="w-20 h-20 bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                    {itemDetail.product_main_image && (
                      <Image
                        src={itemDetail.product_main_image}
                        alt={itemDetail.product_name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm text-[#262626]">
                      {itemDetail.farm_name}
                    </span>
                    <span className="text-sm text-[#262626]">
                      {itemDetail.product_name}
                    </span>
                    <span className="text-sm text-[#262626]">
                      수량: {itemDetail.quantity}개
                    </span>
                    <span className="text-sm font-semibold text-[#262626]">
                      {itemDetail.paid_amount.toLocaleString()}원
                    </span>
                  </div>
                </button>
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

            {/* 환불 계좌 정보 (환불 선택 시에만 표시) */}
            {applicationType === "refund" && (
              <>
                <div className="px-5 py-4 border-b border-[#E5E5E5]">
                  <h2 className="text-base font-semibold text-[#262626] mb-3">
                    환불 계좌 정보 <span className="text-[#F73535]">*</span>
                  </h2>
                  <div className="flex flex-col gap-3">
                    {/* 예금주 */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="text-sm font-medium text-[#262626]">
                        예금주
                      </label>
                      <div className="w-full border border-[#D9D9D9] p-3">
                        <input
                          type="text"
                          value={refundHolder}
                          onChange={(e) => setRefundHolder(e.target.value)}
                          placeholder="예금주를 입력해주세요"
                          className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                        />
                      </div>
                    </div>

                    {/* 은행명 */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="text-sm font-medium text-[#262626]">
                        은행명
                      </label>
                      <div className="w-full border border-[#D9D9D9] p-3">
                        <input
                          type="text"
                          value={refundBank}
                          onChange={(e) => setRefundBank(e.target.value)}
                          placeholder="은행명을 입력해주세요"
                          className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                        />
                      </div>
                    </div>

                    {/* 계좌번호 */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="text-sm font-medium text-[#262626]">
                        계좌번호
                      </label>
                      <div className="w-full border border-[#D9D9D9] p-3">
                        <input
                          type="text"
                          value={refundAccount}
                          onChange={(e) => setRefundAccount(e.target.value)}
                          placeholder="계좌번호를 입력해주세요"
                          className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 디바이더 */}
                <div className="h-[10px] bg-[#F7F7F7]" />
              </>
            )}

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
                  <span className="text-sm text-[#262626]">
                    상품 불량 / 파손
                  </span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#D9D9D9] cursor-pointer">
                  <input
                    type="radio"
                    name="applicationReason"
                    value="different"
                    checked={applicationReason === "different"}
                    onChange={(e) => setApplicationReason(e.target.value)}
                  />
                  <span className="text-sm text-[#262626]">
                    주문 상품과 다름
                  </span>
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
              <div className="mb-2 p-3 bg-[#F7F7F7] rounded text-xs text-[#8C8C8C]">
                <div className="mb-2">상세 사유가 있다면 입력해주세요</div>
                <div className="mb-2">
                  아래 3가지 사진과 함께 접수를 부탁드립니다
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <div>• 상품 품질을 확인 가능한 전체 사진 (부분사진 x)</div>
                  <div>• 운송장 번호 사진</div>
                  <div>• 파손된 박스 사진</div>
                </div>
              </div>
              <textarea
                value={detailedReason}
                onChange={(e) => setDetailedReason(e.target.value)}
                placeholder="상세 사유를 입력해주세요"
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
          </>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">
              환불/반품 신청 가능한 상품 정보를 불러올 수 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
            !isFormValid || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="신청하기"
        >
          {isSubmitting ? "신청 중..." : "신청하기"}
        </button>
      </div>
    </div>
  );
};

export default RefundRequestPage;
