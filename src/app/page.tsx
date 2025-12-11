"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import MoreIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { ad_banner } from "@/assets/images/dummy";
import FarmAvatar from "@/components/FarmAvatar";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/api/hooks/use-products";

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
  // 더미 농장 데이터
  const farmData = [
    { id: 1, name: "지혁이 농장" },
    { id: 2, name: "최시온 농장" },
    { id: 3, name: "민수 농장" },
    { id: 4, name: "서연 농장" },
    { id: 5, name: "동현 농장" },
    { id: 6, name: "예진 농장" },
    { id: 7, name: "준호 농장" },
    { id: 8, name: "소영 농장" },
    { id: 9, name: "태현 농장" },
    { id: 10, name: "미래 농장" },
  ];

  // 테스트 상품 조회
  const { data: testProductsData, isLoading: isLoadingTestProducts } =
    useProducts({});

  return (
    <div className="flex flex-col">
      {/* 광고 배너 영역 */}
      <div className="w-full h-[430px] relative">
        <Image src={ad_banner} alt="광고 배너" fill className="object-cover" />
      </div>
      {/* 홈 화면 카드 영역 (중간 배너 이전)  */}
      <div className="flex flex-col gap-8 px-6 py-8">
        {/* 테스트 상품 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 테스트 상품 제목 영역 */}
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-[#262626]">
              인기 상품
            </h2>
          </div>
          {/* 테스트 상품 리스트 영역 */}
          {isLoadingTestProducts ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              <div className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded" />
              <div className="w-full aspect-[1/1] bg-[#D9D9D9] animate-pulse rounded" />
            </div>
          ) : testProductsData?.results &&
            testProductsData.results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              {testProductsData.results.slice(0, 2).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
        {/* 특가 카드 영역 - 주석처리 */}
        {/* <div className="flex flex-col gap-3">
					<div className="flex justify-between items-center">
						<h2 className="text-[18px] font-semibold text-[#262626]">특가</h2>
						<Link
							href="/categories/special-offers"
							className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
						>
							<span>더보기</span>
							<MoreIcon />
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
						<ProductCard id={1} isSpecialOffer={true} />
						<ProductCard id={2} isSpecialOffer={true} />
						<ProductCard id={3} isSpecialOffer={true} />
						<ProductCard id={4} isSpecialOffer={true} />
						<ProductCard id={5} isSpecialOffer={true} />
						<ProductCard id={6} isSpecialOffer={true} />
					</div>
				</div> */}
        {/* 실시간 인기상품 카드 영역 - 주석처리 */}
        {/* <div className="flex flex-col gap-3">
					<div className="flex justify-between items-center">
						<h2 className="text-[18px] font-semibold text-[#262626]">
							실시간 인기상품
						</h2>
						<Link
							href="/categories/real-time-popular"
							className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
						>
							<span>더보기</span>
							<MoreIcon />
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
						<ProductCard
							id={7}
							originalPrice={45000}
							discountedPrice={32000}
							discountRate={29}
							tags={["고당도", "특가"]}
						/>
						<ProductCard
							id={8}
							originalPrice={28000}
							discountedPrice={21000}
							discountRate={25}
							tags={[]}
						/>
						<ProductCard
							id={9}
							originalPrice={35000}
							discountedPrice={35000}
							discountRate={0}
							tags={["신상품", "프리미엄"]}
						/>
						<ProductCard
							id={10}
							originalPrice={22000}
							discountedPrice={22000}
							discountRate={0}
							tags={[]}
						/>
					</div>
				</div> */}
      </div>
      {/* 추천상품 카드 영역 - 주석처리 */}
      {/* <div className="flex flex-col gap-4 py-8">
				<div className="flex justify-between items-center px-6">
					<h2 className="text-[18px] font-semibold text-[#262626]">추천상품</h2>
					<Link
						href="/categories/recommended"
						className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
					>
						<span>더보기</span>
						<MoreIcon />
					</Link>
				</div>
				<ProductScrollContainer>
					<div
						className="flex-shrink-0"
						style={{
							width:
								"min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
						}}
					>
						<ProductCard id={13} />
					</div>
					<div
						className="flex-shrink-0"
						style={{
							width:
								"min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
						}}
					>
						<ProductCard id={14} />
					</div>
					<div
						className="flex-shrink-0"
						style={{
							width:
								"min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
						}}
					>
						<ProductCard id={15} />
					</div>
					<div
						className="flex-shrink-0"
						style={{
							width:
								"min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
						}}
					>
						<ProductCard id={16} />
					</div>
					<div
						className="flex-shrink-0"
						style={{
							width:
								"min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
						}}
					>
						<ProductCard id={17} />
					</div>
					<div
						className="flex-shrink-0"
						style={{
							width:
								"min(calc((100vw - 48px) / 2.2), calc((640px - 48px) / 2.2))",
						}}
					>
						<ProductCard id={18} />
					</div>
				</ProductScrollContainer>
			</div> */}
      {/* 중간 배너 영역 - 주석처리 */}
      {/* <div className="w-full h-[140px] relative">
				<Image src={ad_banner} alt="중간 배너" fill className="object-cover" />
			</div> */}
      {/* 홈 화면 카드 영역 (중간 배너 이후) - 주석처리 */}
      {/* <div className="flex flex-col gap-8 px-6 py-8">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-center">
						<h2 className="text-[18px] font-semibold text-[#262626]">
							이번주 베스트
						</h2>
						<Link
							href="/categories/weekly-best"
							className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
						>
							<span>더보기</span>
							<MoreIcon />
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
						<ProductCard id={19} />
						<ProductCard id={20} />
						<ProductCard id={21} />
						<ProductCard id={22} />
						<ProductCard id={23} />
						<ProductCard id={24} />
					</div>
				</div>
			</div> */}
      {/* 이달의 베스트 농장 영역 - 주석처리 */}
      {/* <div className="flex flex-col gap-4 py-8 ">
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
				<FarmScrollContainer>
					{farmData.map((farm, index) => (
						<div
							key={farm.id}
							className="flex-shrink-0"
							style={{
								width: "calc(608px / 5.5 - 12px)",
								minWidth: "80px",
								maxWidth: "120px",
							}}
						>
							<FarmAvatar
								rank={index + 1}
								farmName={farm.name}
								farmId={farm.id}
							/>
						</div>
					))}
				</FarmScrollContainer>
			</div> */}
    </div>
  );
}
