"use client";

import Image from "next/image";
import { useEffect } from "react";
import CloseIcon from "@/assets/icon/ic_close_white_24.svg";

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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="프로필 이미지 뷰어"
    >
      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-[10000] w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        aria-label="닫기"
      >
        <CloseIcon />
      </button>

      {/* 프로필 이미지 */}
      <div className="relative w-auto h-auto max-w-[90vw] max-h-[90vh] mx-auto px-4">
        <Image
          src={imageUrl}
          alt={alt}
          width={1200}
          height={1200}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
          unoptimized
          priority
        />
      </div>
    </div>
  );
};

export default ProfileImageViewer;
