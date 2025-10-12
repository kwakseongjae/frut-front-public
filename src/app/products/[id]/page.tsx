"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_black_24.svg";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import HeartIcon from "@/assets/icon/ic_heart_24.svg";
import ShareIcon from "@/assets/icon/ic_upload_black_24.svg";
import StarIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import ProductDetailImage from "@/assets/images/product_detail.png";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [activeTab, setActiveTab] = useState<"detail" | "review">("detail");

  // 샘플 이미지 데이터 (10개)
  const sampleImages = Array.from(
    { length: 10 },
    (_, index) => `이미지 ${index + 1}`
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">상품상세</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 상품 상세 내용 영역 */}
      <div className="flex flex-col divide-y divide-[#D9D9D9]">
        {/* 상품 이미지 캐러셀 */}
        <ProductImageCarousel images={sampleImages} />

        {/* 판매 농장명과 좋아요/공유하기 버튼 */}
        <div className="flex items-center justify-between px-5 py-[10px]">
          <button className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-[#D9D9D9] rounded-full"></div>
            <span className="text-sm font-bold text-[#262626]">
              제주 감귤농원
            </span>
            <ChevronRightIcon />
          </button>
          <div className="flex items-center gap-3">
            <button className="cursor-pointer">
              <HeartIcon />
            </button>
            <button className="cursor-pointer">
              <ShareIcon />
            </button>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-3 px-5 py-4">
          {/* 상품명 */}
          <h2 className="text-lg text-[#262626]">세상에서 제일 달달한 수박</h2>

          {/* 별점과 후기수 */}
          <div className="flex items-center gap-1">
            <StarIcon />
            <span className="text-sm text-[#8C8C8C]">4.8</span>
            <button className="text-sm text-[#262626] underline cursor-pointer">
              152개 후기보기
            </button>
          </div>

          {/* 가격 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#FF5266]">39,000원</span>
          </div>
        </div>

        {/* 상세정보/구매후기 탭 */}
        <div className="relative flex border-b-2 border-[#D9D9D9] px-5">
          <button
            onClick={() => setActiveTab("detail")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "detail"
                ? "text-[#133A1B] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#133A1B]"
                : "text-[#8C8C8C]"
            }`}
          >
            상세정보
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === "review"
                ? "text-[#133A1B] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#133A1B]"
                : "text-[#8C8C8C]"
            }`}
          >
            구매후기
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === "detail" && (
          <div className="flex flex-col divide-y divide-[#D9D9D9]">
            {/* 상세정보*/}
            <div className="w-full">
              <Image
                src={ProductDetailImage}
                alt="상품 상세 정보"
                className="w-full h-auto"
              />
            </div>
            {/* 상품고시 정보 */}
            <div>
              <div className="px-5 py-4 border-b border-[#D9D9D9] ">
                {/* 상품고시정보 제목 */}
                <h3 className="text-sm font-semibold text-[#262626]">
                  상품고시정보
                </h3>
              </div>
              {/* 상품고시정보 내용 */}
              <div className="bg-[#F8F8F8] p-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">제품명</span>
                    <span className="text-xs text-[#262626] text-left">
                      제주 감귤 5kg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      생산자 및 소재지
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      제주 감귤농원 / 제주특별자치도 서귀포시 남원읍
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      제조연월일(포장일 또는 생산연도)
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      2025년 6월 25일 포장
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      유통기한 또는 품질유지기한
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      수령일 기준 5일 이내 (냉장보관 권장)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      관련법상 표시사항
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      농산물품질관리법에 따른 표시사항 준수
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">상품구성</span>
                    <span className="text-xs text-[#262626] text-left">
                      감귤 중소과 5kg (약 45~50개입)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      보관방법 또는 취급방법
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      직사광선 및 고온다습한 곳 피해서 보관
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-xs text-[#595959]">
                      소비자상담 관련 전화번호
                    </span>
                    <span className="text-xs text-[#262626] text-left">
                      070-1234-5678
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "review" && (
          <div className="flex flex-col gap-6">
            {/* 구매후기 탭 컨텐츠 */}
            <div className="text-center text-[#8C8C8C] text-sm">
              구매후기 컨텐츠가 여기에 표시됩니다
            </div>
          </div>
        )}
      </div>

      {/* 하단 구매하기 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm">
          구매하기
        </button>
      </div>
    </div>
  );
}
