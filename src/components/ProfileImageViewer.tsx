"use client";

import { useEffect, useState } from "react";

interface ProfileImageViewerProps {
  imageUrl: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileImageViewer = ({
  imageUrl,
  alt,
  isOpen,
  onClose,
}: ProfileImageViewerProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // 모달이 열릴 때마다 이미지 에러 상태 리셋
      setImageError(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // imageUrl이 변경될 때마다 에러 상태 리셋
  useEffect(() => {
    setImageError(false);
    // biome-ignore lint/correctness/useExhaustiveDependencies: imageUrl 변경 시 에러 상태 리셋 필요
  }, [imageUrl]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 프로필 영역 외부를 클릭한 경우에만 닫기
    const target = e.target as HTMLElement;
    const profileArea = e.currentTarget.querySelector("[data-profile-area]");
    if (target === e.currentTarget || !profileArea?.contains(target)) {
      onClose();
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="프로필 이미지 뷰어"
      tabIndex={-1}
    >
      {/* 블러 처리된 배경 */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/20" />

      {/* 프로필 이미지 영역 (원형) */}
      <div
        data-profile-area
        className="relative w-[280px] h-[280px] rounded-full bg-white flex items-center justify-center z-[10000] shadow-lg pointer-events-auto"
      >
        {imageUrl && !imageError ? (
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#D9D9D9]">
            {/* biome-ignore lint: Next.js Image doesn't work with signed URLs */}
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              onError={() => {
                setImageError(true);
                // 이미지 로드 실패 시 조용히 처리 (콘솔 에러 제거)
              }}
            />
          </div>
        ) : (
          <span className="text-sm text-[#8C8C8C]">프로필 이미지</span>
        )}
      </div>
    </div>
  );
};

export default ProfileImageViewer;
