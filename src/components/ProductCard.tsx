"use client";

import Image from "next/image";
import Link from "next/link";
import StarIcon from "@/assets/icon/ic_star_grey_15.svg";
import { fruits } from "@/assets/images/dummy";

interface ProductCardProps {
	id?: number;
}

function ProductCard({ id = 1 }: ProductCardProps) {
	const fruit = fruits[(id - 1) % fruits.length];

	return (
		<Link href={`/products/${id}`} className="flex flex-col cursor-pointer">
			{/* 이미지 영역 */}
			<div className="w-full aspect-[1/1] relative">
				<Image
					src={fruit.image}
					alt={fruit.name}
					fill
					className="object-cover"
				/>
			</div>
			{/* 본문 영역 */}
			<div className="flex flex-col px-1 py-3 gap-2">
				{/* 농장 프로필 영역 */}
				<div className="flex items-center gap-2">
					<div className="w-7 h-7 bg-[#D9D9D9] rounded-full"></div>
					<div className="text-sm font-semibold text-[#262626]">
						최시온 농장
					</div>
				</div>
				{/* 상품명 영역 */}
				<div className="text-[#262626]">태국 A급 남독마이 골드망고</div>
				{/* 가격 영역 */}
				<div className="flex flex-col">
					{/* 원가 표시 영역 */}
					<div className="text-sm text-[#8C8C8C] line-through">39,800원</div>
					{/* 할인가 표시 영역 */}
					<div className="flex items-center gap-1">
						{/* 할인율 표시 */}
						<div className="text-[#FF5266] font-bold">30%</div>
						{/* 할인가 표시 */}
						<div className="font-semibold text-[#262626]">17,900원</div>
					</div>
				</div>
				{/* 태그 목록 영역 */}
				<div className="flex gap-1">
					<div className="flex justify-center">
						<div className="border border-[#F58376] px-[6px] py-[2px] text-[8px] font-medium text-[#F58376]">
							고당도
						</div>
					</div>
					<div className="flex justify-center">
						<div className="border border-[#657BFF] px-[6px] py-[2px] text-[8px] font-medium text-[#657BFF]">
							특가
						</div>
					</div>
				</div>
				{/* 별점 및 리뷰수 영역 */}
				<div className="flex items-center gap-1 text-xs font-medium text-[#8C8C8C]">
					<StarIcon />
					<span>4.9</span>
					<span>(100)</span>
				</div>
			</div>
		</Link>
	);
}

export default ProductCard;
