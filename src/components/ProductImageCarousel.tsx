"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";

interface ProductImageCarouselProps {
  images: string[];
}

const ProductImageCarousel = ({ images }: ProductImageCarouselProps) => {
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
      {/* 이미지 카운터 */}
      <div className="absolute top-[14px] left-[20px] z-[5]">
        <div className="bg-[#8C8C8C] bg-opacity-60 text-white text-sm px-3 py-0.5 rounded-full">
          {selectedIndex + 1}/{images.length}
        </div>
      </div>

      {/* 좌측 네비게이션 버튼 */}
      <button
        onClick={scrollPrev}
        className="absolute left-[20px] top-1/2 transform -translate-y-1/2 z-[5] w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-md hover:bg-opacity-100 transition-all"
      >
        <ChevronRightIcon className="w-4 h-4 rotate-180" />
      </button>

      {/* 우측 네비게이션 버튼 */}
      <button
        onClick={scrollNext}
        className="absolute right-[20px] top-1/2 transform -translate-y-1/2 z-[5] w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-md hover:bg-opacity-100 transition-all"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>

      {/* 캐러셀 컨테이너 */}
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {images.map((image, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
              <div className="w-full h-full bg-[#D9D9D9] flex items-center justify-center">
                <span className="text-[#8C8C8C] text-sm">
                  이미지 {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductImageCarousel;
