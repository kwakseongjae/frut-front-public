"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_16.svg";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMySellerProfile,
  useUpdateSellerProfile,
} from "@/lib/api/hooks/use-best-farms";
import { uploadApi } from "@/lib/api/upload";

const BusinessProfileEditPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const farmLocationId = useId();
  const introductionId = useId();
  const farmNameId = useId();
  const { data: profileData, isLoading } = useMySellerProfile();
  const updateProfileMutation = useUpdateSellerProfile();

  const isAdmin = user?.user_type === "ADMIN";

  const [farmLocation, setFarmLocation] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [farmName, setFarmName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (profileData) {
      setFarmLocation(profileData.location || "");
      setIntroduction(profileData.farm_description || "");
      setFarmName(profileData.farm_name || "");
      setProfileImage(profileData.farm_image_url || null);
    }
  }, [profileData]);

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
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (isSubmitting) return;

    // 유효성 검사
    if (introduction.length > 50) {
      alert("소개글은 최대 50자까지 입력 가능합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      let farmImagePath: string | null = null;

      // 이미지가 선택된 경우 GCS에 업로드
      if (selectedImageFile) {
        farmImagePath = await uploadImageToGCS(selectedImageFile);
      } else if (profileData?.farm_image) {
        // 기존 이미지가 있고 새로 선택하지 않은 경우 기존 이미지 경로 사용
        farmImagePath = profileData.farm_image;
      }

      // 프로필 업데이트 API 호출
      await updateProfileMutation.mutateAsync({
        farm_name: isAdmin ? farmName.trim() : profileData?.farm_name || "",
        location: farmLocation.trim(),
        farm_description: introduction.trim(),
        farm_image: farmImagePath,
      });

      // 성공 시 뒤로가기
      router.back();
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
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
        {/* 농장명 (관리자만 표시) */}
        {isAdmin && (
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
        )}

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
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 50) {
                  setIntroduction(value);
                }
              }}
              placeholder="내용을 입력해 주세요"
              rows={4}
              maxLength={50}
              className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-[#8C8C8C]">
              {introduction.length}/50
            </span>
          </div>
        </div>
      </div>

      {/* 하단 수정 버튼 */}
      <div className="mt-auto px-5 py-4 pb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="수정"
        >
          {isSubmitting ? "수정 중..." : "수정"}
        </button>
      </div>
    </div>
  );
};

export default BusinessProfileEditPage;
