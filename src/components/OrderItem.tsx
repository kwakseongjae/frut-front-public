"use client";

import Image from "next/image";

interface OrderItemData {
  id: number;
  name: string;
  image: string;
  option: string;
  price: number;
  farmName: string;
}

interface OrderItemProps {
  item: OrderItemData;
}

const OrderItem = ({ item }: OrderItemProps) => {
  const { name, image, option, price, farmName } = item;

  return (
    <div className="flex items-start gap-3">
      {/* 상품 이미지 */}
      <div className="w-24 h-24 relative shrink-0 bg-gray-200">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 flex flex-col">
        <p className="text-sm font-medium text-[#262626] mb-2">{farmName}</p>
        <p className="text-sm text-[#262626] mb-1">{name}</p>
        <p className="text-sm text-[#8C8C8C] mb-3">{option}</p>
      </div>

      {/* 상품 금액 */}
      <div className="flex items-center justify-end">
        <p className="font-semibold text-[#262626]">
          {price.toLocaleString()}원
        </p>
      </div>
    </div>
  );
};

export default OrderItem;
