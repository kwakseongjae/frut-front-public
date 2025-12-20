"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChevronRightIcon20 from "@/assets/icon/ic_chevron_right_white_20.svg";
import ChevronRightIcon24 from "@/assets/icon/ic_chevron_right_white_24.svg";
import {
  useIncrementBannerClick,
  useIncrementBannerView,
} from "@/lib/api/hooks/use-banner-ads";
import type { BannerAd } from "@/lib/api/operations";

interface BannerCarouselProps {
  banners: BannerAd[];
  height?: string;
  autoSlideInterval?: number; // 자동 슬라이드 간격 (ms)
}

const BannerCarousel = ({
  banners,
  height = "430px",
  autoSlideInterval = 5000,
}: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const incrementViewMutation = useIncrementBannerView();
  const incrementClickMutation = useIncrementBannerClick();
  // mutation 함수를 ref로 저장하여 의존성 배열 문제 방지
  const mutateViewRef = useRef(incrementViewMutation.mutate);
  const mutateClickRef = useRef(incrementClickMutation.mutate);

  // mutation 함수 업데이트
  useEffect(() => {
    mutateViewRef.current = incrementViewMutation.mutate;
    mutateClickRef.current = incrementClickMutation.mutate;
  }, [incrementViewMutation.mutate, incrementClickMutation.mutate]);

  // 단일 배너인 경우 자동 슬라이드 없이 표시
  const isSingleBanner = banners.length === 1;

  // Intersection Observer로 뷰포트 진입 감지
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.9, // 90% 이상 보일 때만 visible로 간주
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 자동 슬라이드 설정
  useEffect(() => {
    if (isSingleBanner) {
      return;
    }

    // 자동 슬라이드 시작
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoSlideInterval);
    };

    if (isVisible) {
      startAutoSlide();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSingleBanner, banners.length, autoSlideInterval, isVisible]);

  // 현재 배너가 변경될 때마다 조회수 증가 (뷰포트에 보일 때만)
  useEffect(() => {
    if (!isVisible) return;

    const currentBannerId = banners[currentIndex]?.id;
    if (!currentBannerId) return;

    // 뷰포트에 보일 때만 조회수 증가
    mutateViewRef.current(currentBannerId);
    // banners 배열 전체가 아닌 특정 인덱스의 ID만 의존성으로 사용하여 무한 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isVisible, banners[currentIndex]?.id]);

  // 단일 배너인 경우 뷰포트에 보일 때 조회수 증가
  useEffect(() => {
    if (!isSingleBanner || !isVisible || banners.length === 0) return;

    const singleBannerId = banners[0]?.id;
    if (!singleBannerId) return;

    mutateViewRef.current(singleBannerId);
    // banners 배열 전체가 아닌 첫 번째 배너의 ID만 의존성으로 사용하여 무한 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingleBanner, isVisible, banners.length, banners[0]?.id]);

  const handleBannerClick = async (banner: BannerAd) => {
    // 클릭수 증가
    mutateClickRef.current(banner.id);

    // URL로 새창 열기
    if (banner.ad_url) {
      window.open(banner.ad_url, "_blank", "noopener,noreferrer");
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    // 인터벌 재시작
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isVisible && !isSingleBanner) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoSlideInterval);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    // 인터벌 재시작
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isVisible && !isSingleBanner) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoSlideInterval);
    }
  };

  // 배너가 없으면 null 반환
  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      {/* 배너 슬라이드 컨테이너 */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="flex-shrink-0 h-full relative w-full">
            <button
              type="button"
              onClick={() => handleBannerClick(banner)}
              className="w-full h-full relative cursor-pointer"
              aria-label="광고 배너"
            >
              <Image
                src={banner.ad_image}
                alt="광고 배너"
                fill
                className="object-cover"
                priority={banner.id === currentBanner.id}
                sizes="100vw"
                unoptimized
              />
            </button>
          </div>
        ))}
      </div>

      {/* 숫자 인디케이터 - 배너가 2개 이상일 때만 가운데 하단에 표시 */}
      {banners.length >= 2 && (
        <div className="absolute bottom-[14px] left-1/2 transform -translate-x-1/2 z-[5]">
          <div className="backdrop-blur-md bg-black/40 border border-black/20 text-white text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-lg">
            <span className="font-medium tracking-wide drop-shadow-sm">
              {currentIndex + 1}/{banners.length}
            </span>
          </div>
        </div>
      )}

      {/* 좌측 네비게이션 버튼 - 배너가 2개 이상일 때만 표시 */}
      {banners.length >= 2 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-[5] backdrop-blur-md bg-black/40 border border-black/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-200 group cursor-pointer p-1.5 sm:p-2"
          aria-label="이전 배너"
        >
          <ChevronRightIcon20 className="rotate-180 sm:hidden group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
          <ChevronRightIcon24 className="hidden rotate-180 sm:block group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
        </button>
      )}

      {/* 우측 네비게이션 버튼 - 배너가 2개 이상일 때만 표시 */}
      {banners.length >= 2 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 z-[5] backdrop-blur-md bg-black/40 border border-black/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-200 group cursor-pointer p-1.5 sm:p-2"
          aria-label="다음 배너"
        >
          <ChevronRightIcon20 className="sm:hidden group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
          <ChevronRightIcon24 className="hidden sm:block group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
        </button>
      )}
    </div>
  );
};

export default BannerCarousel;
