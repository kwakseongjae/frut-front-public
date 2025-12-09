"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_black_24.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";
import KakaoPay from "@/assets/icon/ic_kakaopay.svg";
import Naverpay from "@/assets/icon/ic_naverpay.svg";
import { useAuth } from "@/contexts/AuthContext";
import type { ApplicableCoupon } from "@/lib/api/coupons";
import { useApplicableCoupons } from "@/lib/api/hooks/use-coupons";
import { useCreateOrder, useVerifyPayment } from "@/lib/api/hooks/use-order";
import { useOrderPreview } from "@/lib/api/hooks/use-order-preview";
import { useProductDetail } from "@/lib/api/hooks/use-product-detail";

export default function OrderSheetPage() {
	const router = useRouter();
	const { isLoggedIn, isInitialized } = useAuth();
	const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
	const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
	const [usePoints, setUsePoints] = useState(false);
	const [pointsToUse, setPointsToUse] = useState(0);
	const [selectedPayment, setSelectedPayment] = useState("card");
	const [agreements, setAgreements] = useState({
		terms: false,
		privacy: false,
	});

	// 로그인 체크 및 sessionStorage 데이터 확인
	// 초기화가 완료된 후에만 리다이렉트 체크
	useEffect(() => {
		// 초기화가 완료되지 않았으면 리다이렉트하지 않음
		if (!isInitialized) {
			return;
		}

		if (!isLoggedIn) {
			router.push("/signin");
			return;
		}
		// sessionStorage에서 주문 정보 확인
		if (typeof window !== "undefined") {
			const stored = sessionStorage.getItem("pendingPurchase");
			if (!stored) {
				// 주문 정보가 없으면 홈으로 리다이렉트
				router.push("/");
			}
		}
	}, [isLoggedIn, isInitialized, router]);

	const handleCouponSelect = (userCouponId: number) => {
		const couponIdString = userCouponId.toString();
		// 같은 쿠폰을 다시 선택하면 해제
		if (selectedCoupon === couponIdString) {
			setSelectedCoupon(null);
		} else {
			setSelectedCoupon(couponIdString);
		}
		setIsCouponModalOpen(false);
	};

	const handleCouponModalOpen = () => {
		setIsCouponModalOpen(true);
	};

	const handleCouponModalClose = () => {
		setIsCouponModalOpen(false);
	};

	const handleAgreementChange = (key: keyof typeof agreements) => {
		setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleSelectAll = () => {
		const allSelected = allAgreed;
		setAgreements({
			terms: !allSelected,
			privacy: !allSelected,
		});
	};

	const handleUseAllPoints = () => {
		// API 응답의 max_point_usable 사용
		const maxUsable = previewData?.max_point_usable || 0;
		const pointBalance = previewData?.point_balance || 0;
		const pointToUse = Math.min(pointBalance, maxUsable);

		// 보유 포인트가 사용 가능한 포인트보다 많을 때 알러트 표시
		if (pointBalance > maxUsable && maxUsable > 0) {
			alert(
				`포인트는 최대 ${maxUsable.toLocaleString()}원까지 사용 가능합니다. ${maxUsable.toLocaleString()}원이 적용됩니다.`,
			);
		}

		setPointsToUse(pointToUse);
	};

	const allAgreed = Object.values(agreements).every(Boolean);

	// sessionStorage에서 주문 정보 가져오기
	const [pendingPurchase, setPendingPurchase] = useState<{
		productId: number;
		options: Array<{
			id: string | number;
			name: string;
			price: number;
			quantity: number;
		}>;
	} | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = sessionStorage.getItem("pendingPurchase");
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					setPendingPurchase(parsed);
				} catch (error) {
					console.error("Failed to parse pendingPurchase:", error);
				}
			}
		}
	}, []);

	// 상품 상세 정보 가져오기
	const { data: productDetail, isLoading: isLoadingProduct } = useProductDetail(
		pendingPurchase?.productId || 0,
	);

	// 주문 상품 데이터 구성
	const orderItems =
		pendingPurchase && productDetail
			? pendingPurchase.options.map((option) => {
					const apiOption = productDetail.options.find(
						(opt) => opt.id === option.id,
					);
					return {
						id: option.id,
						name: productDetail.product_name,
						farmName: productDetail.farm_name,
						optionName: apiOption?.name || option.name,
						quantity: option.quantity,
						price: apiOption?.cost_price || option.price, // 판매가
						image: productDetail.images?.[0] || null,
					};
				})
			: [];

	// 총 주문금액 계산 (개별 가격 * 수량의 합)
	const totalAmount = orderItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	// 농장별로 그룹화
	const groupedByFarm = orderItems.reduce(
		(acc, item) => {
			if (!acc[item.farmName]) {
				acc[item.farmName] = [];
			}
			acc[item.farmName].push(item);
			return acc;
		},
		{} as Record<string, typeof orderItems>,
	);

	// 총 주문 상품 개수 (option_id의 개수로 계산)
	const totalItemCount = orderItems.length;

	// 적용 가능한 쿠폰 조회
	const { data: couponsData, isLoading: isLoadingCoupons } =
		useApplicableCoupons(totalAmount, totalAmount > 0);

	const availableCoupons: ApplicableCoupon[] =
		couponsData?.applicable_coupons || [];
	const availableCouponsCount = couponsData?.count || 0;

	// 선택된 쿠폰 데이터
	const selectedCouponData = availableCoupons.find(
		(coupon) => coupon.user_coupon_id.toString() === selectedCoupon,
	);

	// 주문 미리보기 API 호출
	const orderPreviewMutation = useOrderPreview();

	// 주문 생성 및 결제 검증
	const createOrderMutation = useCreateOrder();
	const verifyPaymentMutation = useVerifyPayment();

	// API 응답에서 보유 포인트 정보 가져오기
	const previewData = orderPreviewMutation.data;

	// 포인트 입력 debounce를 위한 상태
	const [debouncedPointsToUse, setDebouncedPointsToUse] = useState(0);
	const pointsDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// 포인트 입력 debounce 처리
	useEffect(() => {
		// 기존 타이머가 있으면 취소
		if (pointsDebounceTimeoutRef.current) {
			clearTimeout(pointsDebounceTimeoutRef.current);
		}

		// 쿠폰 변경 시에는 즉시 업데이트 (debounce 없음)
		if (selectedCoupon !== null) {
			setDebouncedPointsToUse(pointsToUse);
			return;
		}

		// 포인트 입력 시에는 500ms debounce
		pointsDebounceTimeoutRef.current = setTimeout(() => {
			setDebouncedPointsToUse(pointsToUse);
		}, 500);

		return () => {
			if (pointsDebounceTimeoutRef.current) {
				clearTimeout(pointsDebounceTimeoutRef.current);
			}
		};
	}, [pointsToUse, selectedCoupon]);

	// 주문 미리보기 요청 데이터 구성 (debounced 포인트 사용)
	const previewRequest = useMemo(() => {
		if (!pendingPurchase || !productDetail || orderItems.length === 0) {
			return null;
		}

		return {
			order_type: "direct" as const,
			items: pendingPurchase.options.map((option) => ({
				product_option_id:
					typeof option.id === "number"
						? option.id
						: parseInt(String(option.id), 10),
				quantity: option.quantity,
			})),
			user_coupon_id: selectedCoupon ? parseInt(selectedCoupon, 10) : null,
			point_used: debouncedPointsToUse,
		};
	}, [
		pendingPurchase,
		productDetail,
		orderItems.length,
		selectedCoupon,
		debouncedPointsToUse,
	]);

	// 이전 previewRequest 값을 저장하여 무한 호출 방지
	const prevPreviewRequestRef = useRef<string | null>(null);

	// 쿠폰 또는 포인트 변경 시 주문 미리보기 API 호출
	useEffect(() => {
		if (!previewRequest) {
			return;
		}

		// 이전 요청과 동일한지 JSON으로 비교
		const currentRequestString = JSON.stringify(previewRequest);
		if (prevPreviewRequestRef.current === currentRequestString) {
			return;
		}

		prevPreviewRequestRef.current = currentRequestString;
		orderPreviewMutation.mutate(previewRequest);
	}, [previewRequest, orderPreviewMutation]);

	// API 응답에서 최종 금액 및 포인트 정보 가져오기
	const finalAmount = previewData?.final_amount || totalAmount;
	const maxPointUsage = previewData?.max_point_usable || 0;
	const actualPointUsage = Math.min(pointsToUse, maxPointUsage);

	// 포트원 SDK 로드 및 초기화
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://cdn.iamport.kr/v1/iamport.js";
		script.async = true;
		script.onload = () => {
			// 포트원 가맹점 식별코드 (환경변수에서 가져오기)
			const PORTONE_IDCODE = process.env.NEXT_PUBLIC_PORTONE_IDCODE;
			if (!PORTONE_IDCODE) {
				console.error("PORTONE_IDCODE가 설정되지 않았습니다.");
				return;
			}
			if (window.IMP) {
				window.IMP.init(PORTONE_IDCODE);
			}
		};
		document.head.appendChild(script);

		return () => {
			// 컴포넌트 언마운트 시 스크립트 제거
			const existingScript = document.querySelector(
				'script[src="https://cdn.iamport.kr/v1/iamport.js"]',
			);
			if (existingScript) {
				document.head.removeChild(existingScript);
			}
		};
	}, []);

	// 결제하기 핸들러
	const handlePayment = async () => {
		if (!pendingPurchase || !productDetail || orderItems.length === 0) {
			alert("주문 정보가 없습니다.");
			return;
		}

		if (!allAgreed) {
			alert("주문 내용 확인 및 결제 동의를 완료해주세요.");
			return;
		}

		try {
			// 1. 주문 생성
			const orderData = {
				order_type: "direct" as const,
				items: pendingPurchase.options.map((option) => ({
					product_option_id:
						typeof option.id === "number"
							? option.id
							: parseInt(String(option.id), 10),
					quantity: option.quantity,
				})),
				delivery_info: {
					recipient_name: "곽성재",
					recipient_phone: "010-3107-1487",
					delivery_address: "서울시 동작구 신대방 1가길 38, 103동 601호",
				},
				payment_method: "CARD" as const,
				user_coupon_id: selectedCoupon ? parseInt(selectedCoupon, 10) : null,
				point_used: debouncedPointsToUse,
			};

			const orderResponse = await createOrderMutation.mutateAsync(orderData);
			const { merchant_uid, payment } = orderResponse;

			// 2. 포트원 결제 요청
			if (!window.IMP) {
				alert("포트원 SDK가 로드되지 않았습니다.");
				return;
			}

			const PORTONE_PROVIDER =
				process.env.NEXT_PUBLIC_PORTONE_PROVIDER || "html5_inicis";

			window.IMP.request_pay(
				{
					pg: PORTONE_PROVIDER,
					pay_method: "card",
					merchant_uid: merchant_uid,
					name: "푸룻 상품 주문",
					amount: payment.amount,
					buyer_name: "곽성재",
					buyer_tel: "010-3107-1487",
					buyer_email: "",
					buyer_addr: "서울시 동작구 신대방 1가길 38, 103동 601호",
					buyer_postcode: "",
				},
				async (response) => {
					if (response.success) {
						// 3. 결제 검증
						if (!response.imp_uid) {
							alert("결제 고유번호를 받지 못했습니다.");
							return;
						}

						try {
							await verifyPaymentMutation.mutateAsync({
								imp_uid: response.imp_uid,
								merchant_uid: merchant_uid,
							});

							// 결제 완료 후 주문 완료 페이지로 이동
							router.push(`/orders/${payment.id}/complete`);
						} catch (error) {
							alert(
								`결제 검증 실패: ${
									error instanceof Error ? error.message : "알 수 없는 오류"
								}`,
							);
						}
					} else {
						alert(`결제 실패: ${response.error_msg || "알 수 없는 오류"}`);
					}
				},
			);
		} catch (error) {
			alert(
				`주문 생성 실패: ${
					error instanceof Error ? error.message : "알 수 없는 오류"
				}`,
			);
		}
	};

	return (
		<div className="flex flex-col min-h-screen">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="p-1 cursor-pointer"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">결제</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 본문 */}
			<div className="flex-1">
				{/* 주문상품 */}
				{isLoadingProduct ? (
					<div className="bg-white px-5 py-4">
						<div className="text-sm text-[#8C8C8C]">로딩 중...</div>
					</div>
				) : orderItems.length > 0 ? (
					<div className="bg-white">
						<div className="px-5 py-4">
							<h2 className="text-base font-semibold text-[#262626] mb-3">
								주문상품 {totalItemCount}개
							</h2>
							{Object.entries(groupedByFarm).map(([farmName, items]) => (
								<div
									key={farmName}
									className="mb-3 border border-[#E5E5E5] flex flex-col divide-y divide-[#E5E5E5]"
								>
									<h3 className="text-sm font-medium text-[#262626] py-3 px-4">
										{farmName}
									</h3>
									<div className="space-y-3 px-4 py-3">
										{items.map((item) => (
											<div
												key={`${item.id}-${item.optionName}`}
												className="flex gap-3"
											>
												<div className="w-20 h-20 relative bg-[#D9D9D9] flex-shrink-0">
													{item.image ? (
														<Image
															src={item.image}
															alt={item.name}
															fill
															className="object-cover"
														/>
													) : (
														<div className="w-full h-full bg-[#D9D9D9]" />
													)}
												</div>
												<div className="flex-1">
													<p className="text-sm text-[#262626]">{item.name}</p>
													<p className="text-sm text-[#8C8C8C]">
														{item.optionName}
														{item.quantity > 1 ? ` x ${item.quantity}개` : ""}
													</p>
													<p className="mt-2 text-sm font-semibold text-[#262626]">
														{(item.price * item.quantity).toLocaleString()}원
													</p>
												</div>
											</div>
										))}
									</div>
									<div className="flex justify-between items-center px-4 py-3">
										<span className="font-medium text-[#8C8C8C]">
											총 주문금액
										</span>
										<span className="font-medium text-[#262626]">
											{items
												.reduce(
													(sum, item) => sum + item.price * item.quantity,
													0,
												)
												.toLocaleString()}
											원
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="bg-white px-5 py-4">
						<div className="text-sm text-[#8C8C8C]">
							주문할 상품이 없습니다.
						</div>
					</div>
				)}

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 배송지 정보 */}
				<div className="bg-white">
					<div className="px-5 py-4">
						<div className="flex justify-between items-center mb-3">
							<h2 className="text-base font-semibold text-[#262626]">
								배송지 정보
							</h2>
							<button type="button" className="text-sm text-[#262626]">
								변경하기
							</button>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium text-[#262626]">곽성재</p>
							<p className="text-sm font-medium text-[#262626]">
								010-3107-1487
							</p>
							<p className="text-sm font-medium text-[#262626]">
								서울시 동작구 신대방 1가길 38, 103동 601호
							</p>
						</div>
						<input
							type="text"
							placeholder="배송 시 요청사항을 입력해주세요"
							className="mt-4 w-full p-3 border border-[#D9D9D9] text-sm"
						/>
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 쿠폰 적용 */}
				<div className="bg-white">
					<div className="px-5 py-4">
						<h2 className="text-base font-semibold text-[#262626] mb-3">
							쿠폰 적용
						</h2>
						{isLoadingCoupons ? (
							<div className="w-full flex items-center justify-center p-3 border border-[#E5E5E5] rounded-lg">
								<span className="text-sm text-[#8C8C8C]">
									쿠폰을 불러오는 중...
								</span>
							</div>
						) : selectedCouponData ? (
							<button
								type="button"
								onClick={handleCouponModalOpen}
								className="w-full flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors"
							>
								<div className="flex items-center gap-2">
									<span className="text-lg font-bold text-[#FF5266]">
										{selectedCouponData.coupon_type === "FIXED_AMOUNT"
											? `${selectedCouponData.discount_value.toLocaleString()}원`
											: `${selectedCouponData.discount_value}%`}
									</span>
									<span className="text-sm font-semibold text-[#262626]">
										{selectedCouponData.coupon_name}
									</span>
								</div>
								<ChevronRightIcon />
							</button>
						) : (
							<button
								type="button"
								onClick={handleCouponModalOpen}
								disabled={availableCouponsCount === 0}
								className="w-full flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="text-sm text-[#262626]">
									{availableCouponsCount === 0
										? "사용가능한 쿠폰이 없어요"
										: `사용 가능한 쿠폰이 ${availableCouponsCount}개 있어요`}
								</span>
								<ChevronRightIcon />
							</button>
						)}
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 포인트 */}
				<div className="bg-white">
					<div className="px-5 py-4">
						<h2 className="text-base font-semibold text-[#262626] mb-3">
							포인트
						</h2>
						<div className="flex justify-between items-center mb-3">
							<span className="text-sm text-[#262626]">보유 포인트</span>
							<span className=" font-semibold text-[#262626]">
								{(previewData?.point_balance || 0).toLocaleString()}P
							</span>
						</div>
						<div className="flex items-center gap-2 mb-3">
							<button
								type="button"
								onClick={() => setUsePoints(!usePoints)}
								className="cursor-pointer"
								aria-label="포인트 사용"
							>
								{usePoints ? <FilledCheckbox /> : <UnfilledCheckbox />}
							</button>
							<button
								type="button"
								onClick={() => setUsePoints(!usePoints)}
								className="text-sm text-[#262626] cursor-pointer"
								aria-label="포인트 사용"
							>
								포인트 사용
							</button>
						</div>
						{usePoints && (
							<div className="space-y-2">
								<div className="flex gap-2">
									<div className="flex-1 relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-[#262626]">
											사용
										</span>
										<input
											type="text"
											value={
												pointsToUse === 0 ? "" : pointsToUse.toLocaleString()
											}
											onChange={(e) => {
												const value = e.target.value.replace(/,/g, "");
												const numValue = Number(value);
												if (!Number.isNaN(numValue) && numValue >= 0) {
													const pointBalance = previewData?.point_balance || 0;
													const maxUsable = previewData?.max_point_usable || 0;

													// 보유 포인트와 최대 사용 가능 포인트 중 작은 값으로 제한
													const maxAllowed = Math.min(pointBalance, maxUsable);

													if (numValue > maxAllowed) {
														// 보유금액 이상 또는 최대 사용 가능 금액 이상 입력 시 최대 금액으로 설정
														setPointsToUse(maxAllowed);
														if (maxAllowed > 0) {
															alert(
																`포인트는 최대 ${maxAllowed.toLocaleString()}원까지 사용 가능합니다.`,
															);
														}
													} else {
														setPointsToUse(numValue);
													}
												}
											}}
											className="w-full p-3 pl-12 pr-6 border border-[#D9D9D9] text-sm text-right"
											placeholder="0"
										/>
										<span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-[#262626]">
											원
										</span>
									</div>
									<button
										type="button"
										onClick={handleUseAllPoints}
										className="px-4 py-3 border border-[#D9D9D9] text-sm text-[#262626]"
									>
										전액사용
									</button>
								</div>
								<p className="text-xs text-[#8C8C8C] text-right">
									남은 포인트 :{" "}
									{(
										(previewData?.point_balance || 0) - actualPointUsage
									).toLocaleString()}
									P
								</p>
							</div>
						)}
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 결제 수단 */}
				<div className="bg-white">
					<div className="px-5 py-4">
						<h2 className="text-base font-semibold text-[#262626] mb-3">
							결제 수단
						</h2>
						<div className=" divide-y divide-[#D9D9D9]">
							<label className="flex items-center gap-3 py-3 px-2 cursor-pointer">
								<input
									type="radio"
									name="payment"
									value="card"
									checked={selectedPayment === "card"}
									onChange={(e) => setSelectedPayment(e.target.value)}
								/>
								<span className="text-sm text-[#262626]">신용/체크카드</span>
							</label>
							<label className="flex items-center gap-1.5 py-3 px-2 cursor-pointer">
								<input
									type="radio"
									name="payment"
									value="naver"
									checked={selectedPayment === "naver"}
									onChange={(e) => setSelectedPayment(e.target.value)}
								/>
								<Naverpay />
								<span className="text-sm text-[#262626]">네이버페이</span>
							</label>
							<label className="flex items-center gap-1.5 py-3 px-2 cursor-pointer">
								<input
									type="radio"
									name="payment"
									value="kakao"
									checked={selectedPayment === "kakao"}
									onChange={(e) => setSelectedPayment(e.target.value)}
								/>
								<KakaoPay />
								<span className="text-sm text-[#262626]">카카오페이</span>
							</label>
						</div>
					</div>
				</div>

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 주문내용 확인 및 결제 동의 */}
				<div className="bg-white">
					<div className="px-5 pt-4 pb-8">
						<h2 className="text-base font-semibold text-[#262626] mb-4">
							주문내용 확인 및 결제 동의
						</h2>
						<div className="space-y-3">
							{/* 전체 동의 */}
							<div className="flex items-center gap-3 pb-2 border-b border-[#E5E5E5]">
								<button
									type="button"
									onClick={handleSelectAll}
									className="cursor-pointer"
									aria-label="전체 동의"
								>
									{allAgreed ? <FilledCheckbox /> : <UnfilledCheckbox />}
								</button>
								<button
									type="button"
									onClick={handleSelectAll}
									className="text-sm font-semibold text-[#262626] cursor-pointer"
									aria-label="전체 동의"
								>
									전체 동의
								</button>
							</div>
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => handleAgreementChange("terms")}
									className="cursor-pointer"
									aria-label="이용약관 동의"
								>
									{agreements.terms ? <FilledCheckbox /> : <UnfilledCheckbox />}
								</button>
								<button
									type="button"
									onClick={() => handleAgreementChange("terms")}
									className="text-sm text-[#262626] cursor-pointer"
									aria-label="이용약관 동의"
								>
									이용약관 동의 (필수)
								</button>
							</div>
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => handleAgreementChange("privacy")}
									className="cursor-pointer"
									aria-label="개인정보 처리 방침 동의"
								>
									{agreements.privacy ? (
										<FilledCheckbox />
									) : (
										<UnfilledCheckbox />
									)}
								</button>
								<button
									type="button"
									onClick={() => handleAgreementChange("privacy")}
									className="text-sm text-[#262626] cursor-pointer"
									aria-label="개인정보 처리 방침 동의"
								>
									개인정보 처리 방침 동의 (필수)
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 하단 결제 버튼 */}
			<div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-5 py-3">
				<button
					type="button"
					onClick={handlePayment}
					disabled={
						!allAgreed ||
						createOrderMutation.isPending ||
						verifyPaymentMutation.isPending
					}
					className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{createOrderMutation.isPending || verifyPaymentMutation.isPending
						? "처리 중..."
						: `${finalAmount.toLocaleString()}원 결제하기`}
				</button>
			</div>

			{/* 쿠폰 선택 모달 */}
			{isCouponModalOpen && (
				<div className="fixed inset-0 z-50 flex items-end sm:justify-center">
					{/* 백드롭 */}
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						onClick={handleCouponModalClose}
						aria-label="모달 닫기"
					/>

					{/* 모달 컨텐츠 */}
					<div className="relative w-full sm:w-[640px] bg-white rounded-t-2xl transform transition-transform duration-300 ease-out max-h-[80vh] flex flex-col">
						{/* 모달 헤더 */}
						<div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
							<h3 className="text-lg font-semibold text-[#262626]">쿠폰함</h3>
							<button
								type="button"
								onClick={handleCouponModalClose}
								className="p-1"
								aria-label="모달 닫기"
							>
								<CloseIcon />
							</button>
						</div>

						{/* 쿠폰 리스트 */}
						<div className="flex-1 overflow-y-auto p-5">
							{isLoadingCoupons ? (
								<div className="flex items-center justify-center py-10">
									<span className="text-sm text-[#8C8C8C]">
										쿠폰을 불러오는 중...
									</span>
								</div>
							) : (
								<>
									{/* 사용 가능 쿠폰 라벨 */}
									<div className="mb-3">
										<span className="text-[#262626]">
											사용 가능 쿠폰 총{" "}
											<span className="text-[#133A1B] font-semibold">
												{availableCouponsCount}
											</span>
											장
										</span>
									</div>
									{availableCoupons.length > 0 ? (
										<div className="space-y-3">
											{availableCoupons.map((coupon) => {
												const isSelected =
													selectedCoupon === coupon.user_coupon_id.toString();
												return (
													<button
														key={coupon.user_coupon_id}
														type="button"
														onClick={() =>
															handleCouponSelect(coupon.user_coupon_id)
														}
														className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
															isSelected
																? "border-[#133A1B] bg-[#133A1B]/5"
																: "border-[#E5E5E5] bg-white hover:border-[#133A1B]/50"
														}`}
													>
														<div className="flex items-start gap-3">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="text-lg font-bold text-[#FF5266]">
																		{coupon.coupon_type === "FIXED_AMOUNT"
																			? `${coupon.discount_value.toLocaleString()}원`
																			: `${coupon.discount_value}%`}
																	</span>
																	<span className="text-sm font-semibold text-[#262626]">
																		{coupon.coupon_name}
																	</span>
																</div>
																<p className="text-xs text-[#262626] mb-1">
																	{coupon.description}
																</p>
																<p className="text-xs text-[#262626]">
																	최소 주문금액 :{" "}
																	{coupon.min_order_amount.toLocaleString()}원
																</p>
																{coupon.coupon_type === "PERCENTAGE" && (
																	<p className="text-xs text-[#262626]">
																		최대 할인금액 :{" "}
																		{coupon.max_discount_amount.toLocaleString()}
																		원
																	</p>
																)}
																<p className="text-xs text-[#262626]">
																	{coupon.end_date} 까지
																</p>
																<p className="text-xs text-[#133A1B] font-semibold mt-1">
																	할인 금액 :{" "}
																	{coupon.calculated_discount.toLocaleString()}
																	원
																</p>
															</div>
															{isSelected && (
																<div className="text-[#133A1B] font-semibold text-sm">
																	선택됨
																</div>
															)}
														</div>
													</button>
												);
											})}
										</div>
									) : (
										<div className="flex items-center justify-center py-10">
											<span className="text-sm text-[#8C8C8C]">
												사용 가능한 쿠폰이 없습니다
											</span>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
