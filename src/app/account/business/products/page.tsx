"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import DotMenuIcon from "@/assets/icon/ic_dot_menu_grey_14.svg";
import PlusWhiteIcon from "@/assets/icon/ic_plus_white_24.svg";
import SearchIcon from "@/assets/icon/ic_search_grey_22.svg";
import { fruits } from "@/assets/images/dummy";

interface Product {
	id: number;
	name: string;
	category: string;
	originalPrice: number;
	discountedPrice: number;
	status: "selling" | "out_of_stock";
	salesCount: number;
	image: string;
}

const ProductManagementPage = () => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<
		"all" | "selling" | "out_of_stock"
	>("all");
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);

	// 더미 상품 데이터 - useState로 관리하여 상태 변경 반영
	const [products, setProducts] = useState<Product[]>([
		{
			id: 1,
			name: "세상에서 제일 달달한 수박",
			category: "과일 > 수박",
			originalPrice: 49000,
			discountedPrice: 37000,
			status: "selling",
			salesCount: 102,
			image: fruits[0]?.image || "",
		},
		{
			id: 2,
			name: "세상에서 제일 달달한 수박",
			category: "과일 > 수박",
			originalPrice: 49000,
			discountedPrice: 37000,
			status: "selling",
			salesCount: 102,
			image: fruits[1]?.image || "",
		},
		{
			id: 3,
			name: "세상에서 제일 달달한 수박",
			category: "과일 > 수박",
			originalPrice: 49000,
			discountedPrice: 37000,
			status: "out_of_stock",
			salesCount: 102,
			image: fruits[2]?.image || "",
		},
	]);

	const handleBackClick = () => {
		router.back();
	};

	const handleAddProduct = () => {
		router.push("/account/business/products/write");
	};

	const handleMenuClick = (productId: number, e: React.MouseEvent) => {
		e.stopPropagation();
		setOpenMenuId(openMenuId === productId ? null : productId);
	};

	const handleEditProduct = (productId: number) => {
		setOpenMenuId(null);
		router.push(`/account/business/products/edit/${productId}`);
	};

	const handleStatusToggle = (productId: number) => {
		setProducts((prev) =>
			prev.map((product) =>
				product.id === productId
					? {
							...product,
							status: product.status === "selling" ? "out_of_stock" : "selling",
						}
					: product,
			),
		);
		setOpenMenuId(null);
	};

	const handleClickOutside = () => {
		setOpenMenuId(null);
	};

	// 필터링된 상품
	const filteredProducts = products.filter((product) => {
		if (filterType === "selling") {
			return product.status === "selling";
		} else if (filterType === "out_of_stock") {
			return product.status === "out_of_stock";
		}
		return true;
	});

	// 검색 필터링
	const searchedProducts = filteredProducts.filter((product) => {
		if (!searchQuery) return true;
		return product.name.toLowerCase().includes(searchQuery.toLowerCase());
	});

	// 통계 계산
	const totalProducts = products.length;
	const sellingProducts = products.filter((p) => p.status === "selling").length;
	const outOfStockProducts = products.filter(
		(p) => p.status === "out_of_stock",
	).length;

	return (
		<div className="flex flex-col min-h-screen bg-white relative">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
				<button
					type="button"
					onClick={handleBackClick}
					className="p-1 cursor-pointer"
					aria-label="뒤로가기"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">상품관리</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 검색바 */}
			<div className="px-5 py-4">
				<div className="relative flex items-center px-2 pb-2 border-b-2 border-[#E5E5E5]">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="검색"
						className="w-full placeholder:text-[#8C8C8C] focus:outline-none text-sm"
					/>
					<button type="button" className="cursor-pointer" aria-label="검색">
						<SearchIcon />
					</button>
				</div>
			</div>

			{/* 필터 영역 */}
			<div className="px-5 py-4 flex items-center justify-around border-b border-[#E5E5E5]">
				<button
					type="button"
					onClick={() => setFilterType("all")}
					className="flex flex-col items-center gap-1"
				>
					<span
						className={`text-lg font-medium ${
							filterType === "all" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
					>
						{totalProducts}
					</span>
					<span
						className={`font-semibold ${
							filterType === "all" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
					>
						전체상품
					</span>
				</button>
				<button
					type="button"
					onClick={() => setFilterType("selling")}
					className="flex flex-col items-center gap-1"
				>
					<span
						className={`text-lg font-medium ${
							filterType === "selling" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
					>
						{sellingProducts}
					</span>
					<span
						className={`font-semibold ${
							filterType === "selling" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
					>
						판매중
					</span>
				</button>
				<button
					type="button"
					onClick={() => setFilterType("out_of_stock")}
					className="flex flex-col items-center gap-1"
				>
					<span
						className={`text-lg font-medium ${
							filterType === "out_of_stock"
								? "text-[#133A1B]"
								: "text-[#8C8C8C]"
						}`}
					>
						{outOfStockProducts}
					</span>
					<span
						className={`font-semibold ${
							filterType === "out_of_stock"
								? "text-[#133A1B]"
								: "text-[#8C8C8C]"
						}`}
					>
						품절
					</span>
				</button>
			</div>

			{/* 상품 리스트 */}
			<div className="flex-1 px-5 py-4">
				<div className="flex flex-col gap-4">
					{searchedProducts.map((product) => (
						<div
							key={product.id}
							className="border border-[#E5E5E5] rounded-lg p-4 relative"
						>
							{/* 더보기 버튼 */}
							<button
								type="button"
								onClick={(e) => handleMenuClick(product.id, e)}
								className="absolute top-4 right-4 p-1 cursor-pointer"
								aria-label="더보기"
							>
								<DotMenuIcon />
							</button>

							{/* 메뉴 드롭다운 */}
							{openMenuId === product.id && (
								<>
									<button
										type="button"
										className="fixed inset-0 z-10"
										onClick={handleClickOutside}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleClickOutside();
											}
										}}
										aria-label="메뉴 닫기"
									/>
									<div className="absolute top-10 right-4 z-20 bg-white border border-[#E5E5E5] rounded-lg shadow-lg min-w-[140px]">
										<button
											type="button"
											onClick={() => handleEditProduct(product.id)}
											className="w-full px-4 py-3 text-left text-sm text-[#262626] hover:bg-[#F5F5F5] transition-colors rounded-t-lg"
										>
											수정
										</button>
										<div className="border-t border-[#E5E5E5]" />
										<button
											type="button"
											onClick={() => handleStatusToggle(product.id)}
											className="w-full px-4 py-3 text-left text-sm text-[#262626] hover:bg-[#F5F5F5] transition-colors rounded-b-lg"
										>
											{product.status === "selling" ? "품절처리" : "판매 전환"}
										</button>
									</div>
								</>
							)}

							{/* 상태 태그 */}
							<div className="flex items-center gap-2 mb-3">
								<div
									className={`px-2 py-0.5 rounded text-xs font-medium ${
										product.status === "selling"
											? "bg-[#133A1B] text-white"
											: "bg-[#8C8C8C] text-white"
									}`}
								>
									{product.status === "selling" ? "판매중" : "품절"}
								</div>
								<span className="text-xs text-[#8C8C8C]">
									판매 {product.salesCount}개
								</span>
							</div>

							{/* 상품 정보 */}
							<div className="flex gap-4">
								{/* 이미지 */}
								<div className="w-20 h-20 bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
									{product.image && (
										<Image
											src={product.image}
											alt={product.name}
											fill
											className="object-cover"
										/>
									)}
								</div>

								{/* 상품 상세 정보 */}
								<div className="flex-1 flex flex-col gap-1">
									<h3 className="text-base font-medium text-[#262626]">
										{product.name}
									</h3>
									<p className="text-xs text-[#8C8C8C]">{product.category}</p>
									<div className="flex items-center gap-2 mt-1">
										<span className="text-sm text-[#8C8C8C] line-through">
											{product.originalPrice.toLocaleString()}원
										</span>
										<span className="text-base font-semibold text-[#262626]">
											{product.discountedPrice.toLocaleString()}원
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* 플로팅 버튼 */}
			<button
				type="button"
				onClick={handleAddProduct}
				className="absolute bottom-6 right-6 w-12 h-12 bg-[#133A1B] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0f2d15] transition-colors z-20"
				aria-label="상품 등록"
			>
				<PlusWhiteIcon />
			</button>
		</div>
	);
};

export default ProductManagementPage;
