"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_white_24.svg";
import TimerIcon from "@/assets/icon/ic_timer_green_21.svg";

interface ProductImageCarouselProps {
  images: {
    id: number;
    image: string;
  }[];
  isSpecialOffer?: boolean;
}

const ProductImageCarousel = ({
  images,
  isSpecialOffer = false,
}: ProductImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full aspect-[1/1] bg-[#D9D9D9] overflow-hidden">
      {/* 이미지 카운터 - 적응형 글래스모피즘 */}
      <div className="absolute top-[14px] left-[20px] z-[5]">
        <div className="backdrop-blur-md bg-black/40 border border-black/20 text-white text-sm px-3 py-1.5 rounded-full shadow-lg">
          <span className="font-medium tracking-wide drop-shadow-sm">
            {selectedIndex + 1}/{images?.length || 0}
          </span>
        </div>
      </div>

      {/* 좌측 네비게이션 버튼 - 적응형 글래스모피즘 */}
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-[20px] top-1/2 transform -translate-y-1/2 z-[5] w-10 h-10 backdrop-blur-md bg-black/40 border border-black/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-200 group"
      >
        <ChevronRightIcon className="rotate-180 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
      </button>

      {/* 우측 네비게이션 버튼 - 적응형 글래스모피즘 */}
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-[20px] top-1/2 transform -translate-y-1/2 z-[5] w-10 h-10 backdrop-blur-md bg-black/40 border border-black/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-200 group"
      >
        <ChevronRightIcon className="group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
      </button>

      {/* 캐러셀 컨테이너 */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {images && images.length > 0 ? (
            images.map((image) => (
              <div
                key={image.id}
                className="embla__slide flex-[0_0_100%] min-w-0 pl-0"
              >
                <div className="w-full h-full relative">
                  <Image
                    width={640}
                    height={640}
                    src={image.image}
                    alt={`상품 이미지 ${image.id + 1}`}
                    className="w-full h-full object-cover block"
                    style={{ minHeight: "100%" }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="embla__slide flex-[0_0_100%] min-w-0 pl-0">
              <div className="w-full h-full relative bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">이미지를 불러오는 중...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 특가인 경우 - 하단 중앙에 특가 마감 텍스트 */}
      {isSpecialOffer && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-[5]">
          <div className="bg-white/80 flex items-center space-x-2 backdrop-blur-sm rounded-[14px] px-3 py-1 border border-white/20 shadow-lg whitespace-nowrap">
            <TimerIcon />
            <span className="text-sm font-bold text-[#133A1B]">
              0일 후 특가 마감
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
