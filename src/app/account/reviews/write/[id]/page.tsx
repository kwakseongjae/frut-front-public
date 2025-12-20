"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_28.svg";
import StarIcon from "@/assets/icon/ic_star_lightgreen_28.svg";
import { fruits } from "@/assets/images/dummy";
import {
  useCreateReview,
  useReviewableItems,
} from "@/lib/api/hooks/use-reviews";
import { uploadApi } from "@/lib/api/upload";

const WriteReviewPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderItemId = parseInt(params.id as string, 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: reviewableData } = useReviewableItems();
  const createReviewMutation = useCreateReview();

  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 작성 가능한 상품 정보 찾기
  const product = useMemo(() => {
    if (!reviewableData?.results) {
      return null;
    }
    const item = reviewableData.results.find(
      (item) => item.order_item_id === orderItemId
    );
    if (!item) return null;

    // 이미지 URL 처리
    const getImageUrl = (imageUrl: string | null) => {
      if (!imageUrl) return null;
      if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
        return imageUrl;
      }
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${imageUrl}`;
    };

    return {
      id: item.product_id,
      orderItemId: item.order_item_id,
      farmName: item.farm_name,
      productName: item.product_name,
      option: item.option_name,
      image: getImageUrl(item.product_image) || fruits[0]?.image,
    };
  }, [reviewableData, orderItemId]);

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
      const currentCount = imageFiles.length;
      const remainingSlots = 10 - currentCount;
      if (remainingSlots <= 0) {
        alert("최대 10장까지 첨부할 수 있습니다.");
        return;
      }
      const newFiles = Array.from(files).slice(0, remainingSlots);
      const newPreviews: string[] = [];
      let loadedCount = 0;
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPreviews.push(reader.result as string);
            loadedCount++;
            if (loadedCount === newFiles.length) {
              setImageFiles((prev) => [...prev, ...newFiles]);
              setImagePreviews((prev) => [...prev, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // GCS에 이미지 업로드
  const uploadImageToGCS = async (file: File): Promise<string> => {
    // 1. Signed URL 생성
    const signedUrlData = await uploadApi.generateSignedUrl({
      file_name: file.name,
      content_type: file.type,
    });

    // 2. Signed URL로 파일 업로드
    await uploadApi.uploadToGCS(file, signedUrlData.signed_url);

    // 3. GCS path 반환
    return signedUrlData.gcs_path;
  };

  const handleSubmit = async () => {
    if (!content.trim() || rating === 0 || !product) {
      return;
    }

    try {
      // 이미지 업로드 (있는 경우)
      let reviewImage: string | null = null;
      if (imageFiles.length > 0) {
        try {
          reviewImage = await uploadImageToGCS(imageFiles[0]);
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          const shouldContinue = window.confirm(
            "이미지 업로드에 실패했습니다. 이미지 없이 후기를 등록하시겠습니까?"
          );
          if (!shouldContinue) {
            return;
          }
        }
      }

      // 리뷰 등록
      await createReviewMutation.mutateAsync({
        product: product.id,
        order_item: product.orderItemId,
        rating,
        review_content: content.trim(),
        review_image: reviewImage,
      });

      // 작성한 상품후기 탭으로 이동
      router.push("/account/reviews?tab=written");
    } catch (error) {
      console.error("후기 등록 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "후기 등록에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
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
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">
            상품 정보를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

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
              <span className="text-sm font-medium text-[#262626]">
                {product.farmName}
              </span>
              <span className="text-sm text-[#262626]">
                {product.productName}
              </span>
              <span className="text-xs text-[#8C8C8C]">{product.option}</span>
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
        {imagePreviews.length > 0 && (
          <div className="px-5 pb-4">
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((image, index) => (
                <div
                  key={`${image}-${index}`}
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
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
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
            disabled={imageFiles.length >= 10}
            className={`w-full py-[14px] border border-[#D9D9D9] flex items-center justify-center gap-2 bg-white ${
              imageFiles.length >= 10
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            aria-label="사진 추가"
          >
            <CameraIcon />
            <span className="text-sm text-[#262626]">
              사진 추가 ({imageFiles.length}/10)
            </span>
          </button>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !content.trim() || rating === 0 || createReviewMutation.isPending
          }
          className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
            !content.trim() || rating === 0 || createReviewMutation.isPending
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          aria-label="후기 등록하기"
        >
          {createReviewMutation.isPending ? "등록 중..." : "후기 등록하기"}
        </button>
      </div>
    </div>
  );
};

export default WriteReviewPage;
