"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ChevronRightWhiteIcon from "@/assets/icon/ic_chevron_right_white_24.svg";
import CloseIcon from "@/assets/icon/ic_close_white_24.svg";

interface ReviewImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewImageViewer = ({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ReviewImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [isOpen, handlePrev, handleNext, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 뷰어"
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

      {/* 메인 이미지 영역 */}
      <div className="flex-1 flex items-center justify-center w-full px-5 relative pb-32">
        {/* 좌측 이전 버튼 */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-5 z-[10000] w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            aria-label="이전 이미지"
          >
            <ChevronRightWhiteIcon className="rotate-180 w-6 h-6" />
          </button>
        )}

        {/* 메인 이미지 */}
        <div className="relative w-full max-w-2xl aspect-square">
          <Image
            src={images[currentIndex]}
            alt={`리뷰 이미지 ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 우측 다음 버튼 */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-5 z-[10000] w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            aria-label="다음 이미지"
          >
            <ChevronRightWhiteIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 하단 썸네일 영역 */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-[10000]">
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto px-5 max-w-4xl scrollbar-hide">
              {images.map((image, index) => {
                // 이미지 URL이 중복될 수 있으므로 URL과 인덱스를 조합하여 고유 키 생성
                const uniqueKey = `${image}-${index}`;
                return (
                  <button
                    key={uniqueKey}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThumbnailClick(index);
                    }}
                    className={`relative w-16 h-16 rounded flex-shrink-0 overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-white scale-110 shadow-lg"
                        : "border-white/40 opacity-70 hover:opacity-100 hover:border-white/60"
                    }`}
                    aria-label={`이미지 ${index + 1} 선택`}
                  >
                    <Image
                      src={image}
                      alt={`썸네일 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewImageViewer;
