"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { fruits } from "@/assets/images/dummy";
import OrderItem from "@/components/OrderItem";

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
}

const OrdersPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");

	// 더미 데이터
	const ongoingOrders: OrderGroup[] = [
		{
			id: 1,
			date: "2025.00.00",
			status: "배송중",
			items: [
				{
					id: 1,
					name: "상품명",
					image: fruits[0].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
				{
					id: 2,
					name: "상품명",
					image: fruits[1].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
			],
			totalAmount: 74000,
		},
		{
			id: 2,
			date: "2025.00.00",
			status: "상품준비중",
			items: [
				{
					id: 3,
					name: "상품명",
					image: fruits[2].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
			],
			totalAmount: 37000,
		},
	];

	const historyOrders: OrderGroup[] = [
		{
			id: 3,
			date: "2025.00.00",
			status: "배송완료",
			items: [
				{
					id: 4,
					name: "상품명",
					image: fruits[0].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
				{
					id: 5,
					name: "상품명",
					image: fruits[1].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
			],
			totalAmount: 74000,
		},
		{
			id: 4,
			date: "2025.00.00",
			status: "배송완료",
			items: [
				{
					id: 6,
					name: "상품명",
					image: fruits[2].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
			],
			totalAmount: 37000,
		},
		{
			id: 5,
			date: "2025.00.00",
			status: "취소완료",
			items: [
				{
					id: 7,
					name: "상품명",
					image: fruits[3].image,
					option: "옵션",
					price: 37000,
					farmName: "농장명",
				},
			],
			totalAmount: 37000,
		},
	];

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
		// 주문 상세 페이지로 이동 (구현 필요)
		router.push(`/orders/${orderId}`);
	};

	const orders = activeTab === "ongoing" ? ongoingOrders : historyOrders;

	return (
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
				{orders.length > 0 ? (
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
										<div className="px-3.5 py-3 border-t border-[#E5E5E5] flex justify-between items-center">
											<span className="text-sm font-medium text-[#262626]">
												총 주문금액
											</span>
											<span className="font-semibold text-[#262626]">
												{order.totalAmount.toLocaleString()}원
											</span>
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
	);
};

export default OrdersPage;
