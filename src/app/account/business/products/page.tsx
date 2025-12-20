"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import DotMenuIcon from "@/assets/icon/ic_dot_menu_grey_14.svg";
import PlusWhiteIcon from "@/assets/icon/ic_plus_white_24.svg";
import SearchIcon from "@/assets/icon/ic_search_grey_22.svg";
import {
  useDeleteProduct,
  useSellerManagementProducts,
  useUpdateProductStatus,
} from "@/lib/api/hooks/use-products";

const ProductManagementPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "ACTIVE" | "OUT_OF_STOCK"
  >("all");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // API 파라미터 구성
  const apiParams = useMemo(() => {
    const params: {
      q?: string;
      status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
    } = {};

    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }

    if (filterType !== "all") {
      params.status = filterType;
    }

    return params;
  }, [searchQuery, filterType]);

  // API 데이터 조회
  const { data: managementData, isLoading } =
    useSellerManagementProducts(apiParams);
  const updateStatusMutation = useUpdateProductStatus();
  const deleteProductMutation = useDeleteProduct();

  const statistics = managementData?.statistics;
  const products = managementData?.products || [];

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

  const handleStatusToggle = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // 상태 변경 로직
    let newStatus: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
    if (product.status === "ACTIVE") {
      newStatus = "OUT_OF_STOCK"; // 판매중 -> 품절처리
    } else {
      newStatus = "ACTIVE"; // 품절 또는 판매중지 -> 판매 전환
    }

    try {
      await updateStatusMutation.mutateAsync({
        productId,
        status: newStatus,
      });
      setOpenMenuId(null);
    } catch (error) {
      console.error("상품 상태 변경 실패:", error);
      alert("상품 상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleClickOutside = () => {
    setOpenMenuId(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirmed = window.confirm("정말 상품을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteProductMutation.mutateAsync(productId);
      setOpenMenuId(null);
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 통계 데이터
  const totalProducts = statistics?.total_count || 0;
  const sellingProducts = statistics?.active_count || 0;
  const outOfStockProducts = statistics?.out_of_stock_count || 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
          onClick={() => setFilterType("ACTIVE")}
          className="flex flex-col items-center gap-1"
        >
          <span
            className={`text-lg font-medium ${
              filterType === "ACTIVE" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
          >
            {sellingProducts}
          </span>
          <span
            className={`font-semibold ${
              filterType === "ACTIVE" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
          >
            판매중
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilterType("OUT_OF_STOCK")}
          className="flex flex-col items-center gap-1"
        >
          <span
            className={`text-lg font-medium ${
              filterType === "OUT_OF_STOCK"
                ? "text-[#133A1B]"
                : "text-[#8C8C8C]"
            }`}
          >
            {outOfStockProducts}
          </span>
          <span
            className={`font-semibold ${
              filterType === "OUT_OF_STOCK"
                ? "text-[#133A1B]"
                : "text-[#8C8C8C]"
            }`}
          >
            판매중지
          </span>
        </button>
      </div>

      {/* 상품 리스트 */}
      <div className="flex-1 px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8C8C8C]">등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product) => (
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
                        className="w-full px-4 py-3 text-left text-sm text-[#262626] hover:bg-[#F5F5F5] transition-colors"
                      >
                        {product.status === "ACTIVE"
                          ? "판매중지"
                          : product.status === "OUT_OF_STOCK"
                          ? "판매재개"
                          : "판매재개"}
                      </button>
                      <div className="border-t border-[#E5E5E5]" />
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-full px-4 py-3 text-left text-sm text-[#FF0000] hover:bg-[#F5F5F5] transition-colors rounded-b-lg"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}

                {/* 상태 태그 */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      product.status === "ACTIVE"
                        ? "bg-[#133A1B] text-white"
                        : product.status === "OUT_OF_STOCK"
                        ? "bg-[#8C8C8C] text-white"
                        : "bg-[#D9D9D9] text-[#262626]"
                    }`}
                  >
                    {product.status === "ACTIVE"
                      ? "판매중"
                      : product.status === "OUT_OF_STOCK"
                      ? "판매중지"
                      : "판매중지"}
                  </div>
                  <span className="text-xs text-[#8C8C8C]">
                    판매 {product.sold_count}개
                  </span>
                </div>

                {/* 상품 정보 */}
                <div className="flex gap-4">
                  {/* 이미지 */}
                  <div className="w-20 h-20 bg-[#D9D9D9] rounded flex-shrink-0 relative overflow-hidden">
                    {product.main_image ? (
                      <Image
                        src={product.main_image}
                        alt={product.product_name}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#D9D9D9] rounded" />
                    )}
                    {/* 판매중지 오버레이 */}
                    {product.status === "OUT_OF_STOCK" && (
                      <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded">
                        {/* 슬래시 라인 */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)",
                          }}
                        />
                        {/* 판매중지 텍스트 */}
                        <span className="relative text-xs font-semibold text-white drop-shadow-lg z-10">
                          판매중지
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 상품 상세 정보 */}
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="text-base font-medium text-[#262626]">
                      {product.product_name}
                    </h3>
                    <p className="text-xs text-[#8C8C8C]">
                      {product.category_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.display_cost_price !== product.display_price && (
                        <span className="text-sm text-[#8C8C8C] line-through">
                          {product.display_price.toLocaleString()}원
                        </span>
                      )}
                      <span className="text-base font-semibold text-[#262626]">
                        {product.display_cost_price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <button
        type="button"
        onClick={handleAddProduct}
        className="fixed bottom-6 right-6 sm:right-[calc((100vw-640px)/2+24px)] w-12 h-12 bg-[#133A1B] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0f2d15] transition-colors z-20"
        aria-label="상품 등록"
      >
        <PlusWhiteIcon />
      </button>
    </div>
  );
};

export default ProductManagementPage;
