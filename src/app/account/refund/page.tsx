"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import QuestionCircleIcon from "@/assets/icon/ic_question_circle_grey_15.svg";
import { fruits } from "@/assets/images/dummy";

interface RefundItem {
  id: number;
  status: string;
  date: string;
  image: string;
  totalPrice: number;
  products: Array<{
    name: string;
    price: number;
  }>;
}

const RefundPage = () => {
  const router = useRouter();

  const handleRefundRequestClick = (itemId: number) => {
    router.push(`/account/refund/${itemId}/request`);
  };

  // 더미 데이터
  const refundableItems: RefundItem[] = [
    {
      id: 1,
      status: "배송완료",
      date: "25.10.20",
      image: fruits[0]?.image || "",
      totalPrice: 37000,
      products: [
        { name: "포도 1kg (샤인머스켓)", price: 25000 },
        { name: "키위 10개", price: 12000 },
      ],
    },
    {
      id: 2,
      status: "배송완료",
      date: "25.10.20",
      image: fruits[1]?.image || "",
      totalPrice: 37000,
      products: [
        { name: "포도 1kg (샤인머스켓)", price: 25000 },
        { name: "키위 10개", price: 12000 },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5 border-b border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">환불 / 반품</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 환불 가능 내역 섹션 */}
      <div className="flex flex-col">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-[#262626]">
            환불 가능 내역
          </h2>
        </div>

        {/* 환불 가능 아이템 리스트 */}
        <div className="flex flex-col px-5 pb-4">
          {refundableItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col border border-[#E5E5E5] bg-white mb-4 last:mb-0"
            >
              {/* 상태 및 날짜 */}
              <div className="px-4 py-3 border-b border-[#E5E5E5]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F73535]">
                      {item.status}
                    </span>
                    <span className="text-sm text-[#262626]">{item.date}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRefundRequestClick(item.id)}
                    className="flex items-center text-xs font-medium text-[#8C8C8C] cursor-pointer"
                    aria-label="환불 / 반품 신청하기"
                  >
                    <span>환불 / 반품 신청하기</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="px-4 py-3">
                <div className="flex gap-4">
                  {/* 상품 이미지 */}
                  <div className="w-20 h-20 bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt="상품 이미지"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* 상품 상세 정보 */}
                  <div className="flex flex-col flex-1 gap-2">
                    {/* 총 가격 */}
                    <div className="flex justify-end">
                      <span className="text-base font-semibold text-[#262626]">
                        {item.totalPrice.toLocaleString()}원
                      </span>
                    </div>

                    {/* 상품 목록 */}
                    <div className="flex flex-col gap-1">
                      {item.products.map((product, index) => (
                        <div key={index} className="text-sm text-[#262626]">
                          {product.name} | {product.price.toLocaleString()}원
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 환불 / 반품 주의사항 섹션 */}
      <div className="flex-1 flex items-end">
        <div className="w-full bg-[#F7F7F7] px-5 py-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0">
              <QuestionCircleIcon />
            </div>
            <h3 className="text-base font-semibold text-[#262626]">
              환불 / 반품 주의사항
            </h3>
          </div>
          <ul className="flex flex-col gap-2 list-disc list-inside ml-4">
            <li className="text-sm text-[#8C8C8C]">
              상품 도착 후 2일 이내 가능합니다
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RefundPage;

