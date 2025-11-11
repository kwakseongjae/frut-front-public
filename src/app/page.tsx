import Image from "next/image";
import Link from "next/link";
import MoreIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { ad_banner } from "@/assets/images/dummy";
import FarmAvatar from "@/components/FarmAvatar";
import ProductCard from "@/components/ProductCard";

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

  return (
    <div className="flex flex-col">
      {/* 광고 배너 영역 */}
      <div className="w-full h-[430px] relative">
        <Image src={ad_banner} alt="광고 배너" fill className="object-cover" />
      </div>
      {/* 홈 화면 카드 영역 (중간 배너 이전)  */}
      <div className="flex flex-col gap-8 px-6 py-8">
        {/* 특가 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 특가 제목 영역 */}
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
          {/* 특가 상품 리스트 영역 */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
            {/* 상품 카드 영역 */}
            <ProductCard id={1} isSpecialOffer={true} />
            <ProductCard id={2} isSpecialOffer={true} />
            <ProductCard id={3} isSpecialOffer={true} />
            <ProductCard id={4} isSpecialOffer={true} />
            <ProductCard id={5} isSpecialOffer={true} />
            <ProductCard id={6} isSpecialOffer={true} />
          </div>
        </div>
        {/* 실시간 인기상품 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 실시간 인기상품 제목 영역 */}
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
          {/* 실시간 인기상품 상품 리스트 영역 */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
            {/* 상품 카드 영역 - 다양한 케이스 */}
            {/* (1) 태그 있고, 할인하는 */}
            <ProductCard
              id={7}
              originalPrice={45000}
              discountedPrice={32000}
              discountRate={29}
              tags={["고당도", "특가"]}
            />
            {/* (2) 태그 없고, 할인하는 */}
            <ProductCard
              id={8}
              originalPrice={28000}
              discountedPrice={21000}
              discountRate={25}
              tags={[]}
            />
            {/* (3) 태그 있고, 할인 안하는 */}
            <ProductCard
              id={9}
              originalPrice={35000}
              discountedPrice={35000}
              discountRate={0}
              tags={["신상품", "프리미엄"]}
            />
            {/* (4) 태그 없고, 할인 안하는 */}
            <ProductCard
              id={10}
              originalPrice={22000}
              discountedPrice={22000}
              discountRate={0}
              tags={[]}
            />
            {/* (1) 태그 있고, 할인하는 - 다른 태그 */}
            <ProductCard
              id={11}
              originalPrice={55000}
              discountedPrice={38500}
              discountRate={30}
              tags={["유기농", "직배송"]}
            />
            {/* (2) 태그 없고, 할인하는 - 다른 할인율 */}
            <ProductCard
              id={12}
              originalPrice={18000}
              discountedPrice={14400}
              discountRate={20}
              tags={[]}
            />
          </div>
        </div>
        {/* 추천상품 카드 영역 */}
        <div className="flex flex-col gap-3">
          {/* 추천상품 제목 영역 */}
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-[#262626]">
              추천상품
            </h2>
            <Link
              href="/categories/recommended"
              className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
            >
              <span>더보기</span>
              <MoreIcon />
            </Link>
          </div>
          {/* 추천상품 상품 리스트 영역 */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
            {/* 상품 카드 영역 */}
            <ProductCard id={13} />
            <ProductCard id={14} />
            <ProductCard id={15} />
            <ProductCard id={16} />
            <ProductCard id={17} />
            <ProductCard id={18} />
          </div>
        </div>
      </div>
      {/* 중간 배너 영역 */}
      <div className="w-full h-[140px] relative">
        <Image src={ad_banner} alt="중간 배너" fill className="object-cover" />
      </div>
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
              href="/categories/weekly-best"
              className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
            >
              <span>더보기</span>
              <MoreIcon />
            </Link>
          </div>
          {/* 이번주 베스트 상품 리스트 영역 */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
            {/* 상품 카드 영역 */}
            <ProductCard id={19} />
            <ProductCard id={20} />
            <ProductCard id={21} />
            <ProductCard id={22} />
            <ProductCard id={23} />
            <ProductCard id={24} />
          </div>
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
            href="/farms"
            className="flex items-center gap-1 text-sm text-[#8C8C8C] font-medium cursor-pointer"
          >
            <span>더보기</span>
            <MoreIcon />
          </Link>
        </div>
        {/* 이달의 베스트 농장 아바타 리스트 영역 - 횡스크롤 */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pl-6 pr-6">
          {farmData.map((farm, index) => (
            <div
              key={farm.id}
              className="flex-shrink-0"
              style={{
                width: "calc(608px / 5.5 - 12px)", // 5.5개가 보이도록 계산 (패딩 48px = pl-6 + pr-6)
                minWidth: "80px", // 최소 너비 보장
                maxWidth: "120px", // 데스크톱에서 너무 크지 않도록
              }}
            >
              <FarmAvatar rank={index + 1} farmName={farm.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
