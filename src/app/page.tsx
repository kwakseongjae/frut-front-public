"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import MoreIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { ad_banner } from "@/assets/images/dummy";
import BannerCarousel from "@/components/BannerCarousel";
import FarmAvatar from "@/components/FarmAvatar";
import ProductCard from "@/components/ProductCard";
import { useBannerAds } from "@/lib/api/hooks/use-banner-ads";
import { useBestFarms } from "@/lib/api/hooks/use-best-farms";
import { useInfiniteProducts } from "@/lib/api/hooks/use-products";

// 드래그 스크롤 컨테이너 컴포넌트
function FarmScrollContainer({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 기본 스크롤을 방해하지 않도록, 드래그 시작 시에만 처리
    if (!scrollRef.current) return;
    // 왼쪽 버튼 클릭일 때만 드래그 시작
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 드래그 중일 때만 커스텀 스크롤 처리
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // 드래그 중에는 기본 동작 방지
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 터치 이벤트 처리 (모바일)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 드래그 중일 때만 커스텀 스크롤 처리
    if (!isDragging || !scrollRef.current) return;
    // 기본 스크롤과 충돌하지 않도록 preventDefault는 선택적으로
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 마우스 휠로 가로 스크롤 지원 (기본 스크롤)
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    // Shift 키를 누르면 가로 스크롤, 아니면 기본 동작
    if (e.shiftKey) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
    // Shift 없이도 가로 스크롤 가능하도록 (선택적)
    // 기본적으로는 세로 스크롤만 작동
  };

  return (
    <section
      ref={scrollRef}
      aria-label="이달의 베스트 농장 목록"
      className="flex gap-4 overflow-x-auto scrollbar-hide pl-6 pr-6 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {children}
    </section>
  );
}

// 상품 횡스크롤 컨테이너 컴포넌트
function ProductScrollContainer({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (e.shiftKey) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <section
      ref={scrollRef}
      aria-label="추천상품 목록"
      className="flex gap-3 overflow-x-auto scrollbar-hide pl-6 pr-6 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {children}
    </section>
  );
}

export default function Home() {
  // 베스트 농장 데이터 조회
  const { data: bestFarmsData, isLoading: isLoadingBestFarms } = useBestFarms();

  // 배너 광고 조회
  const { data: mainBanners } = useBannerAds({ ad_type: "MAIN" });
  const { data: middleBanners } = useBannerAds({ ad_type: "MIDDLE" });

  // 상품 목록 조회 (useInfiniteProducts 사용하여 캐시 공유)
  const { data: specialData, isLoading: isLoadingSpecial } =
    useInfiniteProducts({
      type: "special",
    });
  const { data: weeklyBestData, isLoading: isLoadingWeeklyBest } =
    useInfiniteProducts({
      type: "weekly_best",
    });
  const { data: popularData, isLoading: isLoadingPopular } =
    useInfiniteProducts({
      type: "popular",
    });
  const { data: recommendedData, isLoading: isLoadingRecommended } =
    useInfiniteProducts({
      type: "recommended",
    });

  // 첫 페이지의 상품만 사용 (홈 화면에서는 6개만 표시)
  const specialProducts = specialData?.pages?.[0];
  const weeklyBestProducts = weeklyBestData?.pages?.[0];
  const popularProducts = popularData?.pages?.[0];
  const recommendedProducts = recommendedData?.pages?.[0];

  // 스켈레톤 로딩용 고유 ID 생성
  const skeletonIds = useMemo(
    () => Array.from({ length: 6 }, () => crypto.randomUUID()),
    []
  );

  return (
    <div className="flex flex-col">
      {/* 광고 배너 영역 */}
      {mainBanners && mainBanners.length > 0 ? (
        <BannerCarousel
          banners={mainBanners}
          height="430px"
          autoSlideInterval={5000}
        />
      ) : (
        <div className="w-full h-[430px] relative">
          <Image
            src={ad_banner}
            alt="광고 배너"
            fill
            className="object-cover"
          />
        </div>
      )}
      {/* 홈 화면 카드 영역 (중간 배너 이전)  */}
      <div className="flex flex-col gap-8 px-6 py-8">
        {/* 특가 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 특가 제목 영역 */}
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-[#262626]">특가</h2>
            <Link
              href="/categories/type/special"
              className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
            >
              <span>더보기</span>
              <MoreIcon />
            </Link>
          </div>
          {/* 특가 상품 리스트 영역 */}
          {isLoadingSpecial ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {skeletonIds.map((id) => (
                <div
                  key={`special-skeleton-${id}`}
                  className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded"
                />
              ))}
            </div>
          ) : specialProducts?.results && specialProducts.results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {specialProducts.results.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
        {/* 실시간 인기상품 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 실시간 인기상품 제목 영역 */}
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-[#262626]">
              실시간 인기상품
            </h2>
            <Link
              href="/categories/type/popular"
              className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
            >
              <span>더보기</span>
              <MoreIcon />
            </Link>
          </div>
          {/* 실시간 인기상품 상품 리스트 영역 */}
          {isLoadingPopular ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {skeletonIds.map((id) => (
                <div
                  key={`popular-skeleton-${id}`}
                  className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded"
                />
              ))}
            </div>
          ) : popularProducts?.results && popularProducts.results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {popularProducts.results.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {/* 추천상품 카드 영역 - 독립 컨테이너 */}
      <div className="flex flex-col gap-4 py-8">
        {/* 추천상품 제목 영역 */}
        <div className="flex justify-between items-center px-6">
          <h2 className="text-[18px] font-semibold text-[#262626]">추천상품</h2>
          <Link
            href="/categories/type/recommended"
            className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
          >
            <span>더보기</span>
            <MoreIcon />
          </Link>
        </div>
        {/* 추천상품 상품 리스트 영역 - 횡스크롤 */}
        {isLoadingRecommended ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pl-6 pr-6">
            {skeletonIds.map((id) => (
              <div
                key={`recommended-skeleton-${id}`}
                className="flex-shrink-0 w-[calc((100vw-48px)/2.2)] aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded"
              />
            ))}
          </div>
        ) : recommendedProducts?.results &&
          recommendedProducts.results.length > 0 ? (
          <ProductScrollContainer>
            {recommendedProducts.results.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{
                  width:
                    "min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </ProductScrollContainer>
        ) : null}
      </div>
      {/* 중간 배너 영역 */}
      {middleBanners && middleBanners.length > 0 ? (
        <BannerCarousel
          banners={middleBanners}
          height="140px"
          autoSlideInterval={5000}
        />
      ) : (
        <div className="w-full h-[140px] relative">
          <Image
            src={ad_banner}
            alt="중간 배너"
            fill
            className="object-cover"
          />
        </div>
      )}
      {/* 홈 화면 카드 영역 (중간 배너 이후)  */}
      <div className="flex flex-col gap-8 px-6 py-8">
        {/* 이번주 베스트 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 이번주 베스트 제목 영역 */}
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-[#262626]">
              이번주 베스트
            </h2>
            <Link
              href="/categories/type/weekly_best"
              className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
            >
              <span>더보기</span>
              <MoreIcon />
            </Link>
          </div>
          {/* 이번주 베스트 상품 리스트 영역 */}
          {isLoadingWeeklyBest ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {skeletonIds.map((id) => (
                <div
                  key={`weekly-best-skeleton-${id}`}
                  className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded"
                />
              ))}
            </div>
          ) : weeklyBestProducts?.results &&
            weeklyBestProducts.results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {weeklyBestProducts.results.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {/* 이달의 베스트 농장 영역 */}
      <div className="flex flex-col gap-4 py-8 ">
        {/* 이달의 베스트 농장 제목 영역 */}
        <div className="flex justify-between items-center px-6">
          <h2 className="text-[18px] font-semibold text-[#262626]">
            이달의 베스트 농장
          </h2>
          <Link
            href="/farms/best"
            className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
          >
            <span>더보기</span>
            <MoreIcon />
          </Link>
        </div>
        {/* 이달의 베스트 농장 아바타 리스트 영역 - 횡스크롤 */}
        {isLoadingBestFarms ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pl-6 pr-6">
            {skeletonIds.slice(0, 8).map((id) => (
              <div
                key={`best-farm-skeleton-${id}`}
                className="flex-shrink-0 flex flex-col items-center gap-2"
                style={{
                  width: "calc(608px / 5.5 - 12px)",
                  minWidth: "80px",
                  maxWidth: "120px",
                }}
              >
                <div className="w-[60px] h-[60px] bg-[#D9D9D9] rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-[#D9D9D9] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : bestFarmsData && bestFarmsData.length > 0 ? (
          <FarmScrollContainer>
            {bestFarmsData.map((farm) => (
              <div
                key={farm.farm_id}
                className="flex-shrink-0"
                style={{
                  width: "calc(608px / 5.5 - 12px)", // 5.5개가 보이도록 계산 (패딩 48px = pl-6 + pr-6)
                  minWidth: "80px", // 최소 너비 보장
                  maxWidth: "120px", // 데스크톱에서 너무 크지 않도록
                }}
              >
                <FarmAvatar
                  rank={farm.rank}
                  farmName={farm.farm_name}
                  farmId={farm.farm_id}
                  farmImage={farm.farm_image}
                />
              </div>
            ))}
          </FarmScrollContainer>
        ) : null}
      </div>
    </div>
  );
}
