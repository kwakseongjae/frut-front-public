"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CartItem from "@/components/CartItem";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
	useCart,
	useDeleteCartItem,
	useUpdateCartItem,
} from "@/lib/api/hooks/use-cart";

const CartPage = () => {
	const router = useRouter();
	const { isLoggedIn } = useAuth();
	const { data: cartData, isLoading } = useCart();
	const deleteCartItemMutation = useDeleteCartItem();
	const updateCartItemMutation = useUpdateCartItem();

	// API 데이터를 CartItem 컴포넌트 형식으로 변환
	const cartItems = useMemo(() => {
		if (!cartData?.items) return [];
		return cartData.items.map((item) => ({
			id: item.id,
			name: item.product_name,
			image: item.image_url.startsWith("http")
				? item.image_url
				: `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${item.image_url}`,
			option: item.option_name,
			originalPrice: item.price,
			discountedPrice: item.cost_price,
			farmName: item.farm_name,
			productId: item.product_id,
			productOptionId: item.product_option_id,
		}));
	}, [cartData]);

	const [selectAll, setSelectAll] = useState(true);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

	// API 데이터 로드 시 초기화
	useEffect(() => {
		if (cartItems.length > 0) {
			setSelectedItems(cartItems.map((item) => item.id));
			const initialQuantities: { [key: number]: number } = {};
			cartItems.forEach((item) => {
				const apiItem = cartData?.items.find(
					(apiItem) => apiItem.id === item.id,
				);
				initialQuantities[item.id] = apiItem?.quantity || 1;
			});
			setQuantities(initialQuantities);
			setSelectAll(true);
		}
	}, [cartItems, cartData]);

	const handleBackClick = () => {
		window.history.back();
	};

	const handleOrderClick = () => {
		// 로그인 체크
		if (!isLoggedIn) {
			router.push("/signin");
			return;
		}

		// 선택한 장바구니 아이템 ID들을 sessionStorage에 저장
		if (selectedItems.length > 0) {
			// 장바구니 모드이므로 직접 구매 모드 정보 삭제
			sessionStorage.removeItem("pendingPurchase");
			sessionStorage.setItem(
				"pendingCartPurchase",
				JSON.stringify({
					cartItemIds: selectedItems,
					quantities: selectedItems.reduce(
						(acc, id) => {
							acc[id] = quantities[id] || 1;
							return acc;
						},
						{} as { [key: number]: number },
					),
				}),
			);
		}

		router.push("/ordersheet");
	};

	const handleSelectAll = () => {
		const newSelectAll = !selectAll;
		setSelectAll(newSelectAll);
		if (newSelectAll) {
			setSelectedItems(cartItems.map((item) => item.id));
		} else {
			setSelectedItems([]);
		}
	};

	const handleSelectFarm = (farmName: string) => {
		const farmItems = cartItems.filter((item) => item.farmName === farmName);
		const farmItemIds = farmItems.map((item) => item.id);
		const allFarmItemsSelected = farmItemIds.every((id) =>
			selectedItems.includes(id),
		);

		if (allFarmItemsSelected) {
			// 해당 농장의 모든 아이템 선택 해제
			setSelectedItems((prev) =>
				prev.filter((id) => !farmItemIds.includes(id)),
			);
		} else {
			// 해당 농장의 모든 아이템 선택
			setSelectedItems((prev) => [...new Set([...prev, ...farmItemIds])]);
		}
	};

	const handleSelectItem = (itemId: number) => {
		setSelectedItems((prev) => {
			const newSelected = prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId];

			// 전체 선택 상태 업데이트
			setSelectAll(newSelected.length === cartItems.length);

			return newSelected;
		});
	};

	const handleQuantityChange = async (itemId: number, change: number) => {
		const currentQuantity = quantities[itemId] || 1;
		const newQuantity = Math.max(1, currentQuantity + change);

		// 수량이 변경되지 않으면 API 호출하지 않음
		if (newQuantity === currentQuantity) return;

		// 낙관적 업데이트
		setQuantities((prev) => ({
			...prev,
			[itemId]: newQuantity,
		}));

		// API 호출
		try {
			const cartItem = cartData?.items.find((item) => item.id === itemId);
			if (cartItem) {
				await updateCartItemMutation.mutateAsync({
					id: itemId,
					request: {
						product_option_id: cartItem.product_option_id,
						quantity: newQuantity,
					},
				});
			}
		} catch (error) {
			// 실패 시 이전 수량으로 복구
			setQuantities((prev) => ({
				...prev,
				[itemId]: currentQuantity,
			}));
			alert(
				error instanceof Error ? error.message : "수량 변경에 실패했습니다.",
			);
		}
	};

	const handleDeleteItem = async (itemId: number) => {
		if (!confirm("정말 이 상품을 장바구니에서 삭제하시겠습니까?")) {
			return;
		}

		try {
			await deleteCartItemMutation.mutateAsync(itemId);
			// 선택된 아이템에서도 제거
			setSelectedItems((prev) => prev.filter((id) => id !== itemId));

			// 수량 정보에서도 제거
			setQuantities((prev) => {
				const newQuantities = { ...prev };
				delete newQuantities[itemId];
				return newQuantities;
			});

			// 전체 선택 상태 업데이트
			setSelectAll(false);
		} catch (error) {
			alert(
				error instanceof Error ? error.message : "상품 삭제에 실패했습니다.",
			);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedItems.length === 0) return;

		if (
			!confirm(
				`선택한 ${selectedItems.length}개의 상품을 장바구니에서 삭제하시겠습니까?`,
			)
		) {
			return;
		}

		try {
			// 선택된 아이템들을 하나씩 삭제
			for (const itemId of selectedItems) {
				await deleteCartItemMutation.mutateAsync(itemId);
			}

			// 선택된 아이템 목록 초기화
			setSelectedItems([]);

			// 전체 선택 상태 초기화
			setSelectAll(false);

			// 선택된 아이템들의 수량 정보 제거
			setQuantities((prev) => {
				const newQuantities = { ...prev };
				selectedItems.forEach((itemId) => {
					delete newQuantities[itemId];
				});
				return newQuantities;
			});
		} catch (error) {
			alert(
				error instanceof Error ? error.message : "상품 삭제에 실패했습니다.",
			);
		}
	};

	// 총 금액 계산
	const totalAmount = useMemo(() => {
		return cartItems
			.filter((item) => selectedItems.includes(item.id))
			.reduce((sum, item) => {
				const quantity = quantities[item.id] || 1;
				return sum + item.discountedPrice * quantity;
			}, 0);
	}, [cartItems, selectedItems, quantities]);

	const totalDiscount = useMemo(() => {
		return cartItems
			.filter((item) => selectedItems.includes(item.id))
			.reduce((sum, item) => {
				const quantity = quantities[item.id] || 1;
				return sum + (item.originalPrice - item.discountedPrice) * quantity;
			}, 0);
	}, [cartItems, selectedItems, quantities]);

	const selectedCount = selectedItems.length;
	const totalCount = cartItems.length;

	return (
		<ProtectedRoute>
			<div className="flex flex-col min-h-screen">
				{/* 헤더 영역 */}
				<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
					<button
						type="button"
						onClick={handleBackClick}
						className="cursor-pointer"
					>
						<ChevronLeftIcon />
					</button>
					<div>
						<h1 className="text-lg font-semibold text-[#262626]">장바구니</h1>
					</div>
					<div className="w-7" />
				</div>

				<div className="flex-1 px-5 pt-4 pb-8 flex flex-col">
					{isLoading ? (
						<div className="flex items-center justify-center py-10">
							<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
						</div>
					) : (
						<>
							{/* 전체 선택 및 삭제 */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={handleSelectAll}
										className="cursor-pointer"
										aria-label="전체 선택"
									>
										{selectAll ? <FilledCheckbox /> : <UnfilledCheckbox />}
									</button>
									<span className="font-semibold text-[#262626]">
										전체선택 ({selectedCount}/{totalCount})
									</span>
								</div>
								<button
									type="button"
									onClick={handleDeleteSelected}
									disabled={selectedCount === 0}
									className={`text-sm font-medium cursor-pointer ${
										selectedCount > 0
											? "text-[#949494] hover:text-[#262626]"
											: "text-[#D9D9D9] cursor-not-allowed"
									}`}
								>
									선택삭제
								</button>
							</div>
							{/* 농장별 상품 목록 */}
							{cartItems.length > 0 ? (
								Array.from(new Set(cartItems.map((item) => item.farmName))).map(
									(farmName, index, _farmNames) => {
										const farmItems = cartItems.filter(
											(item) => item.farmName === farmName,
										);
										const farmItemIds = farmItems.map((item) => item.id);
										const allFarmItemsSelected = farmItemIds.every((id) =>
											selectedItems.includes(id),
										);

										return (
											<div key={farmName}>
												{/* 농가별 구분선 */}
												{index > 0 && (
													<div className="h-[4px] bg-[#F7F7F7] -mx-5 my-4" />
												)}
												<div className="border border-[#E5E5E5] flex flex-col divide-y divide-[#E5E5E5]">
													{/* 농장명 */}
													<div className="flex items-center gap-3 py-3 px-4">
														<button
															type="button"
															onClick={() => handleSelectFarm(farmName)}
															className="cursor-pointer"
															aria-label={`${farmName} 전체 선택`}
														>
															{allFarmItemsSelected ? (
																<FilledCheckbox />
															) : (
																<UnfilledCheckbox />
															)}
														</button>
														<h3 className="font-medium text-[#262626]">
															{farmName}
														</h3>
													</div>

													{/* 상품 목록 */}
													<div className="divide-y divide-[#D9D9D9]">
														{farmItems.map((item) => (
															<CartItem
																key={item.id}
																item={item}
																isSelected={selectedItems.includes(item.id)}
																quantity={quantities[item.id] || 1}
																onSelect={handleSelectItem}
																onDelete={handleDeleteItem}
																onQuantityChange={handleQuantityChange}
																onOptionChange={(
																	itemId,
																	_optionId,
																	newQuantity,
																) => {
																	// 옵션 변경 시 수량도 업데이트
																	setQuantities((prev) => ({
																		...prev,
																		[itemId]: newQuantity,
																	}));
																}}
															/>
														))}
													</div>
												</div>
											</div>
										);
									},
								)
							) : (
								<div className="flex flex-col items-center justify-center py-20 text-center">
									<p className="font-medium text-[#8C8C8C] mb-2">
										장바구니가 비어있습니다
									</p>
								</div>
							)}
						</>
					)}
				</div>

				{/* 구분선 */}
				{cartItems.length > 0 && <div className="h-[10px] bg-[#F7F7F7]" />}

				{/* 결제 예상 금액 */}
				{cartItems.length > 0 && (
					<div className="px-5 pt-8 pb-12">
						<h2 className="text-base font-semibold text-[#262626] mb-3">
							결제 예상 금액
						</h2>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm text-[#262626]">상품 금액</span>
								<span className="text-sm font-semibold text-[#262626]">
									{totalAmount.toLocaleString()}원
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-[#262626]">총 할인받은 금액</span>
								<span className="text-sm font-semibold text-[#FF6B6B]">
									-{totalDiscount.toLocaleString()}원
								</span>
							</div>
						</div>

						{/* 구분선 */}
						<div className="h-[1px] bg-[#262626] my-4" />

						{/* 결제예정금액 */}
						<div className="flex justify-between items-center">
							<span className="font-semibold text-[#262626]">결제예정금액</span>
							<span className="text-lg font-semibold text-[#262626]">
								{(totalAmount - totalDiscount).toLocaleString()}원
							</span>
						</div>
					</div>
				)}

				{/* 하단 주문 버튼 */}
				{cartItems.length > 0 && (
					<div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-5 py-3">
						<button
							type="button"
							onClick={handleOrderClick}
							disabled={selectedCount === 0}
							className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{totalAmount.toLocaleString()}원 주문하기
						</button>
					</div>
				)}
			</div>
		</ProtectedRoute>
	);
};

export default CartPage;
