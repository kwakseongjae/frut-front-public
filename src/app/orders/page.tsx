"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { fruits } from "@/assets/images/dummy";
import OrderItem from "@/components/OrderItem";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrders } from "@/lib/api/hooks/use-order";
import type { OrderListItem } from "@/lib/api/orders";

type OrderStatus = "상품준비중" | "배송중" | "배송완료" | "취소완료";

interface OrderItemData {
	id: number;
	name: string;
	image: string;
	option: string;
	price: number;
	farmName: string;
}

interface OrderGroup {
	id: number;
	date: string;
	status: OrderStatus;
	items: OrderItemData[];
	totalAmount: number;
	merchantUid: string;
	paymentInfo: {
		total_amount: number;
		point_used: number;
		coupon_discount_amount: number;
		amount: number;
	};
}

const OrdersPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
	const { data: ordersData, isLoading } = useOrders();

	const getStatusColor = (status: OrderStatus) => {
		switch (status) {
			case "배송중":
				return "text-[#8BC53F]";
			case "상품준비중":
				return "text-[#EB8C34]";
			case "배송완료":
				return "text-[#F73535]";
			case "취소완료":
				return "text-[#595959]";
			default:
				return "text-[#595959]";
		}
	};

	const handleTabClick = (tab: "ongoing" | "history") => {
		setActiveTab(tab);
	};

	const handleOrderDetailClick = (orderId: number) => {
		router.push(`/orders/${orderId}`);
	};

	// API 데이터를 그룹화하여 변환
	const transformedOrders = useMemo((): OrderGroup[] => {
		if (!ordersData?.results) {
			return [];
		}

		// merchant_uid로 그룹화
		const groupedByMerchant: Record<
			string,
			{
				items: OrderListItem[];
				merchantUid: string;
				orderedAt: string;
			}
		> = {};

		ordersData.results.forEach((item) => {
			const merchantUid = item.payment_info.merchant_uid;
			if (!groupedByMerchant[merchantUid]) {
				groupedByMerchant[merchantUid] = {
					items: [],
					merchantUid,
					orderedAt: item.ordered_at,
				};
			}
			groupedByMerchant[merchantUid].items.push(item);
		});

		// 그룹을 OrderGroup 형식으로 변환
		return Object.values(groupedByMerchant).map((group, index) => {
			// 가장 최근 주문 항목의 상태를 그룹 상태로 사용
			const latestItem = group.items[0];
			const status = latestItem.item_status;

			// 상태 변환
			let displayStatus: OrderStatus;
			if (status === "CONFIRMED") {
				displayStatus = "상품준비중";
			} else if (status === "SHIPPED") {
				displayStatus = "배송중";
			} else if (status === "DELIVERED") {
				displayStatus = "배송완료";
			} else if (status === "CANCELLED") {
				displayStatus = "취소완료";
			} else {
				displayStatus = "상품준비중"; // PENDING
			}

			// 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
			const orderedDate = new Date(group.orderedAt);
			const formattedDate = `${orderedDate.getFullYear()}.${String(
				orderedDate.getMonth() + 1,
			).padStart(2, "0")}.${String(orderedDate.getDate()).padStart(2, "0")}`;

			// 총 주문금액 계산 (payment_info의 amount 사용 - 실제 결제 금액)
			const totalAmount = latestItem.payment_info.amount;

			// OrderItem 형식으로 변환
			const orderItems: OrderItemData[] = group.items.map((item) => ({
				id: item.id,
				name: item.product_name,
				image: fruits[index % fruits.length]?.image || fruits[0].image, // 기본 이미지 사용
				option: `${item.quantity}개`, // 옵션 정보가 없으므로 수량으로 표시
				price: item.total_price,
				farmName: "농장명", // API 응답에 없으므로 기본값
			}));

			return {
				id: latestItem.id, // 첫 번째 주문 항목의 ID 사용
				date: formattedDate,
				status: displayStatus,
				items: orderItems,
				totalAmount,
				merchantUid: group.merchantUid,
				paymentInfo: {
					total_amount: latestItem.payment_info.total_amount,
					point_used: latestItem.payment_info.point_used,
					coupon_discount_amount:
						latestItem.payment_info.coupon_discount_amount,
					amount: latestItem.payment_info.amount,
				},
			};
		});
	}, [ordersData]);

	// 상태별로 필터링
	const ongoingOrders = useMemo(() => {
		return transformedOrders.filter(
			(order) => order.status === "상품준비중" || order.status === "배송중",
		);
	}, [transformedOrders]);

	const historyOrders = useMemo(() => {
		return transformedOrders.filter(
			(order) => order.status === "배송완료" || order.status === "취소완료",
		);
	}, [transformedOrders]);

	const orders = activeTab === "ongoing" ? ongoingOrders : historyOrders;

	return (
		<ProtectedRoute>
			<div className="flex flex-col min-h-screen">
				{/* 탭 내비게이션 */}
				<div className="sticky top-0 z-10 bg-white border-b border-t border-[#E5E5E5]">
					<div className="flex">
						<button
							type="button"
							onClick={() => handleTabClick("ongoing")}
							className={`flex-1 py-4 text-sm font-medium relative ${
								activeTab === "ongoing" ? "text-[#133A1B]" : "text-[#8C8C8C]"
							}`}
							aria-label="진행중인 주문"
						>
							진행중인 주문
							{activeTab === "ongoing" && (
								<div className="absolute bottom-[-1px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
							)}
						</button>
						<button
							type="button"
							onClick={() => handleTabClick("history")}
							className={`flex-1 py-4 text-sm font-medium relative ${
								activeTab === "history" ? "text-[#133A1B]" : "text-[#8C8C8C]"
							}`}
							aria-label="주문내역"
						>
							주문내역
							{activeTab === "history" && (
								<div className="absolute bottom-[-1px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
							)}
						</button>
					</div>
				</div>

				{/* 주문 목록 */}
				<div className="flex-1">
					{isLoading ? (
						<div className="px-5 py-20 flex flex-col items-center justify-center text-center">
							<p className="font-medium text-[#8C8C8C] mb-2">로딩 중...</p>
						</div>
					) : orders.length > 0 ? (
						<div className="flex flex-col">
							{orders.map((order, index) => (
								<div key={order.id}>
									{/* 각 주문 항목 (패딩 포함) */}
									<div className="px-5 py-4">
										{/* 날짜 (좌측 상단) */}
										<div className="mb-4">
											<span className="font-semibold text-[#262626]">
												{order.date}
											</span>
										</div>
										<div className="border border-[#E5E5E5] bg-white flex flex-col">
											{/* 상태 및 주문상세 버튼 */}
											<div className="px-3.5 py-3 flex items-center justify-between border-b border-[#E5E5E5]">
												<span
													className={`text-sm font-semibold ${getStatusColor(
														order.status,
													)}`}
												>
													{order.status}
												</span>
												<button
													type="button"
													onClick={() => handleOrderDetailClick(order.id)}
													className="flex items-center text-xs text-medium text-[#8C8C8C] cursor-pointer"
													aria-label="주문상세"
												>
													<span>주문상세</span>
													<ChevronRightIcon />
												</button>
											</div>

											{/* 상품 목록 */}
											<div className="px-3.5 py-3 space-y-4">
												{order.items.map((item) => (
													<OrderItem key={item.id} item={item} />
												))}
											</div>

											{/* 총 주문금액 (하단) */}
											<div className="px-3.5 py-3 border-t border-[#E5E5E5] space-y-2">
												<div className="flex justify-between items-center text-sm text-[#262626]">
													<span>상품 금액</span>
													<span>
														{order.paymentInfo.total_amount.toLocaleString()}원
													</span>
												</div>
												{order.paymentInfo.point_used > 0 && (
													<div className="flex justify-between items-center text-sm text-[#262626]">
														<span>포인트 사용</span>
														<span className="text-[#8BC53F]">
															-{order.paymentInfo.point_used.toLocaleString()}원
														</span>
													</div>
												)}
												{order.paymentInfo.coupon_discount_amount > 0 && (
													<div className="flex justify-between items-center text-sm text-[#262626]">
														<span>쿠폰 할인</span>
														<span className="text-[#8BC53F]">
															-
															{order.paymentInfo.coupon_discount_amount.toLocaleString()}
															원
														</span>
													</div>
												)}
												<div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5]">
													<span className="text-sm font-medium text-[#262626]">
														총 주문금액
													</span>
													<span className="font-semibold text-[#262626]">
														{order.paymentInfo.amount.toLocaleString()}원
													</span>
												</div>
											</div>
										</div>
									</div>
									{/* 주문 박스 사이 디바이더 (전체 너비) */}
									{index < orders.length - 1 && (
										<div className="h-[10px] bg-[#F7F7F7]" />
									)}
								</div>
							))}
						</div>
					) : (
						<div className="px-5 py-20 flex flex-col items-center justify-center text-center">
							<p className="font-medium text-[#8C8C8C] mb-2">
								{activeTab === "ongoing"
									? "진행중인 주문이 없습니다"
									: "주문내역이 없습니다"}
							</p>
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default OrdersPage;
