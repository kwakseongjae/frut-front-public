"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
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

interface DeliveryStatus {
	label: string;
	isActive: boolean;
	isCompleted: boolean;
}

interface TrackingStatus {
	date: string;
	time: string;
	status: string;
	detail: string;
	isActive: boolean;
}

const OrderDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
	const router = useRouter();
	const { id } = use(params);

	// 더미 데이터 - params.id를 기반으로 주문 데이터 찾기
	// TODO: 실제로는 params.id를 통해 서버에서 주문 데이터를 가져와야 함
	const orderId = parseInt(id, 10);

	// orders 페이지의 더미 데이터와 동일한 구조
	const allOrders = [
		{
			id: 1,
			date: "2025.00.00",
			status: "배송중" as OrderStatus,
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
			status: "상품준비중" as OrderStatus,
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
		{
			id: 3,
			date: "2025.00.00",
			status: "배송완료" as OrderStatus,
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
			status: "배송완료" as OrderStatus,
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
			status: "취소완료" as OrderStatus,
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

	// params.id로 주문 찾기
	const order = allOrders.find((o) => o.id === orderId);

	// 주문이 없으면 기본값 사용 (에러 처리)
	const orderStatus: OrderStatus = order?.status || "상품준비중";
	const orderDate = order?.date || "2025.00.00";
	const orderItems: OrderItemData[] = order?.items || [
		{
			id: 1,
			name: "상품명",
			image: fruits[0].image,
			option: "옵션",
			price: 37000,
			farmName: "농장명",
		},
	];
	const totalAmount = order?.totalAmount || 37000;

	// 배송전 상태: "상품준비중"
	// 배송중 상태: "배송중"
	// 배송완료 상태: "배송완료"
	// 취소완료 상태: "취소완료"
	const isInDelivery = orderStatus === "배송중";
	const isDeliveryCompleted = orderStatus === "배송완료";
	const isCancelled = orderStatus === "취소완료";
	const isBeforeDelivery =
		!isInDelivery && !isDeliveryCompleted && !isCancelled;

	// 배송현황: 배송중일 때는 "배송중" 활성화, 배송완료일 때는 "배송완료" 활성화, 배송전일 때는 모두 비활성화
	const deliveryStatuses: DeliveryStatus[] = isInDelivery
		? [
				{ label: "상품 발송", isActive: false, isCompleted: false },
				{ label: "집화", isActive: false, isCompleted: false },
				{ label: "배송중", isActive: true, isCompleted: false },
				{ label: "배송완료", isActive: false, isCompleted: false },
			]
		: isDeliveryCompleted
			? [
					{ label: "상품 발송", isActive: false, isCompleted: false },
					{ label: "집화", isActive: false, isCompleted: false },
					{ label: "배송중", isActive: false, isCompleted: false },
					{ label: "배송완료", isActive: true, isCompleted: false },
				]
			: [
					{ label: "상품 발송", isActive: false, isCompleted: false },
					{ label: "집화", isActive: false, isCompleted: false },
					{ label: "배송중", isActive: false, isCompleted: false },
					{ label: "배송완료", isActive: false, isCompleted: false },
				];

	// 배송추적: 배송중일 때는 "배송시작" 활성화, 배송완료일 때는 "배송완료" 활성화, 배송전일 때는 "주문접수" 활성화
	const trackingStatuses: TrackingStatus[] = isInDelivery
		? [
				{
					date: "2025.00.00",
					time: "00:00",
					status: "진행중",
					detail: "주문접수",
					isActive: false,
				},
				{
					date: "2025.00.00",
					time: "00:00",
					status: "진행중",
					detail: "상품준비",
					isActive: false,
				},
				{
					date: "2025.00.00",
					time: "00:00",
					status: "진행중",
					detail: "배송시작",
					isActive: true,
				},
				{
					date: "2025.00.00",
					time: "00:00",
					status: "대기중",
					detail: "배송완료",
					isActive: false,
				},
			]
		: isDeliveryCompleted
			? [
					{
						date: "2025.00.00",
						time: "00:00",
						status: "진행중",
						detail: "주문접수",
						isActive: false,
					},
					{
						date: "2025.00.00",
						time: "00:00",
						status: "진행중",
						detail: "상품준비",
						isActive: false,
					},
					{
						date: "2025.00.00",
						time: "00:00",
						status: "진행중",
						detail: "배송시작",
						isActive: false,
					},
					{
						date: "2025.00.00",
						time: "00:00",
						status: "진행중",
						detail: "배송완료",
						isActive: true,
					},
				]
			: [
					{
						date: "2025.00.00",
						time: "00:00",
						status: "진행중",
						detail: "주문접수",
						isActive: true,
					},
					{
						date: "2025.00.00",
						time: "00:00",
						status: "대기중",
						detail: "상품준비",
						isActive: false,
					},
					{
						date: "2025.00.00",
						time: "00:00",
						status: "대기중",
						detail: "배송시작",
						isActive: false,
					},
					{
						date: "2025.00.00",
						time: "00:00",
						status: "대기중",
						detail: "배송완료",
						isActive: false,
					},
				];

	// 송장정보 (배송중 또는 배송완료일 때 표시)
	const trackingNumber = "12345678910123";
	const courierCompany = "택배사명";
	const estimatedArrival = "2025.00.00 (월) 오후";

	const paymentMethod = "카카오페이";
	const productAmount = 16000;
	const deliveryFee = 0;

	const recipientName = "송민창";
	const address = "서울시 서초구 서초대로 789, 10층";
	const phone = "010-1234-5678";

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

	const handleBackClick = () => {
		router.back();
	};

	const handleCancelOrder = () => {
		// 주문 취소 로직 구현
		console.log("주문 취소");
	};

	return (
		<div className="flex flex-col min-h-screen">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
				<button
					type="button"
					onClick={handleBackClick}
					className="cursor-pointer"
					aria-label="뒤로가기"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">주문 상세</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 본문 */}
			<div className="flex-1 pb-20">
				{/* 배송 현황 섹션 */}
				<div className="px-5 py-4">
					<h2 className="text-base font-semibold text-[#262626] mb-4">
						배송현황
					</h2>
					<div className="flex items-center justify-center gap-2">
						{deliveryStatuses.map((status) => (
							<div key={status.label} className="flex items-center">
								<span
									className={`text-sm font-medium ${
										status.isActive ? "text-[#133A1B]" : "text-[#8C8C8C]"
									}`}
								>
									{status.label}
								</span>
								{deliveryStatuses.indexOf(status) <
									deliveryStatuses.length - 1 && <ChevronRightIcon />}
							</div>
						))}
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 배송 추적 섹션 (취소완료일 때는 숨김) */}
				{!isCancelled && (
					<>
						<div className="px-5 py-4">
							<h2 className="text-base font-semibold text-[#262626] mb-4">
								배송추적
							</h2>
							<div className="flex flex-col gap-3">
								{trackingStatuses.map((tracking) => (
									<div
										key={`${tracking.date}-${tracking.time}-${tracking.detail}`}
										className="flex items-start justify-between gap-4"
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="flex flex-col items-start">
												<span
													className={`text-xs ${
														tracking.isActive
															? "text-[#262626]"
															: "text-[#8C8C8C]"
													}`}
												>
													{tracking.date} {tracking.time}
												</span>
												<span
													className={`text-sm ${
														tracking.isActive
															? "text-[#262626]"
															: "text-[#8C8C8C]"
													}`}
												>
													{tracking.status}
												</span>
											</div>
										</div>
										<div className="flex-1 text-right">
											<span
												className={`text-sm font-medium ${
													tracking.isActive
														? "text-[#262626]"
														: "text-[#8C8C8C]"
												}`}
											>
												{tracking.detail}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* 구분선 */}
						<div className="h-[10px] bg-[#F7F7F7]" />
					</>
				)}

				{/* 송장정보 섹션 (배송중 또는 배송완료일 때 표시) */}
				{(isInDelivery || isDeliveryCompleted) && (
					<>
						<div className="px-5 py-4">
							<h2 className="text-base font-semibold text-[#262626] mb-4">
								송장정보
							</h2>
							<div className="flex flex-col gap-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-[#262626]">운송장 번호</span>
									<span className="text-sm font-medium text-[#262626]">
										{trackingNumber}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-[#262626]">택배사</span>
									<span className="text-sm font-medium text-[#262626]">
										{courierCompany}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-[#262626]">도착예정</span>
									<span className="text-sm font-medium text-[#262626]">
										{estimatedArrival}
									</span>
								</div>
							</div>
						</div>

						{/* 구분선 */}
						<div className="h-[10px] bg-[#F7F7F7]" />
					</>
				)}

				{/* 주문 상품 상세 섹션 */}
				<div className="px-5 py-4">
					{/* 날짜 */}
					<div className="mb-4">
						<span className="font-semibold text-[#262626]">{orderDate}</span>
					</div>

					{/* 주문 박스 */}
					<div className="border border-[#E5E5E5] bg-white flex flex-col">
						{/* 상태 */}
						<div className="px-3.5 py-3 border-b border-[#E5E5E5]">
							<span
								className={`text-sm font-semibold ${getStatusColor(
									orderStatus,
								)}`}
							>
								{orderStatus}
							</span>
						</div>

						{/* 상품 목록 */}
						<div className="px-3.5 py-3 space-y-4">
							{orderItems.map((item) => (
								<OrderItem key={item.id} item={item} />
							))}
						</div>

						{/* 총 주문금액 */}
						<div className="px-3.5 py-3 border-t border-[#E5E5E5] flex justify-between items-center">
							<span className="text-sm font-medium text-[#262626]">
								총 주문금액
							</span>
							<span className="font-semibold text-[#262626]">
								{totalAmount.toLocaleString()}원
							</span>
						</div>
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 결제 정보 섹션 */}
				<div className="px-5 py-4">
					<h2 className="text-base font-semibold text-[#262626] mb-4">
						결제 정보
					</h2>
					<div className="flex flex-col gap-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-[#262626]">결제 방법</span>
							<span className="text-sm font-medium text-[#262626]">
								{paymentMethod}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-[#262626]">상품금액</span>
							<span className="text-sm font-medium text-[#262626]">
								{productAmount.toLocaleString()}원
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-[#262626]">배송비</span>
							<span className="text-sm font-medium text-[#262626]">
								{deliveryFee.toLocaleString()}원
							</span>
						</div>
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 배송지 정보 섹션 */}
				<div className="px-5 py-4">
					<h2 className="text-base font-semibold text-[#262626] mb-4">
						배송지 정보
					</h2>
					<div className="flex flex-col gap-3">
						<div className="flex justify-between items-start">
							<span className="text-sm text-[#262626]">받는분</span>
							<span className="text-sm font-medium text-[#262626] text-right">
								{recipientName}
							</span>
						</div>
						<div className="flex justify-between items-start">
							<span className="text-sm text-[#262626]">주소</span>
							<span className="text-sm font-medium text-[#262626] text-right flex-1 ml-4">
								{address}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-[#262626]">연락처</span>
							<span className="text-sm font-medium text-[#262626]">
								{phone}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* 하단 플로팅 주문취소 버튼 (배송전일 때만 표시) */}
			{isBeforeDelivery && (
				<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] px-5 py-3 z-20">
					<button
						type="button"
						onClick={handleCancelOrder}
						className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
						aria-label="주문취소"
					>
						주문취소
					</button>
				</div>
			)}
		</div>
	);
};

export default OrderDetailPage;
