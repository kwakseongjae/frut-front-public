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
import { useCart, useDeleteCartItem } from "@/lib/api/hooks/use-cart";
import { useApplicableCoupons } from "@/lib/api/hooks/use-coupons";
import { useCreateOrder, useVerifyPayment } from "@/lib/api/hooks/use-order";
import { useOrderPreview } from "@/lib/api/hooks/use-order-preview";
import { useProductDetail } from "@/lib/api/hooks/use-product-detail";
import { useAddresses } from "@/lib/api/hooks/use-users";

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
			const storedPurchase = sessionStorage.getItem("pendingPurchase");
			const storedCartPurchase = sessionStorage.getItem("pendingCartPurchase");
			// 직접 구매 또는 장바구니 구매 정보가 없으면 홈으로 리다이렉트
			if (!storedPurchase && !storedCartPurchase) {
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

	const [pendingCartPurchase, setPendingCartPurchase] = useState<{
		cartItemIds: number[];
		quantities: { [key: number]: number };
	} | null>(null);

	// 장바구니 데이터 조회 (장바구니 모드일 때만)
	const { data: cartData } = useCart();

	useEffect(() => {
		if (typeof window !== "undefined") {
			// 두 가지 모드의 데이터를 모두 확인
			const cartStored = sessionStorage.getItem("pendingCartPurchase");
			const purchaseStored = sessionStorage.getItem("pendingPurchase");

			// 장바구니 모드와 직접 구매 모드가 모두 있는 경우
			// 이는 비정상적인 상태이므로, 장바구니 모드를 우선하고 직접 구매 정보는 삭제
			// (실제로는 각 모드 진입 시점에 다른 모드 정보를 삭제하므로 발생하지 않아야 함)
			if (cartStored && purchaseStored) {
				try {
					const cartParsed = JSON.parse(cartStored);
					setPendingCartPurchase(cartParsed);
					// 장바구니 모드이면 직접 구매 정보는 초기화
					sessionStorage.removeItem("pendingPurchase");
				} catch (error) {
					console.error("Failed to parse pendingCartPurchase:", error);
					// 파싱 실패 시 직접 구매 모드로 폴백
					try {
						const parsed = JSON.parse(purchaseStored);
						setPendingPurchase(parsed);
						sessionStorage.removeItem("pendingCartPurchase");
					} catch (purchaseError) {
						console.error("Failed to parse pendingPurchase:", purchaseError);
					}
				}
				return;
			}

			// 장바구니 모드만 있는 경우
			if (cartStored) {
				try {
					const parsed = JSON.parse(cartStored);
					setPendingCartPurchase(parsed);
				} catch (error) {
					console.error("Failed to parse pendingCartPurchase:", error);
				}
				return;
			}

			// 직접 구매 모드만 있는 경우
			if (purchaseStored) {
				try {
					const parsed = JSON.parse(purchaseStored);
					setPendingPurchase(parsed);
				} catch (error) {
					console.error("Failed to parse pendingPurchase:", error);
				}
			}
		}
	}, []);

	// 상품 상세 정보 가져오기 (직접 구매인 경우만)
	const { data: productDetail, isLoading: isLoadingProduct } = useProductDetail(
		pendingPurchase?.productId || 0,
	);

	// 장바구니 모드에서 각 상품의 고유 product_id 추출
	const cartProductIds = useMemo(() => {
		if (!pendingCartPurchase || !cartData?.items) return [];
		const uniqueProductIds = new Set<number>();
		pendingCartPurchase.cartItemIds.forEach((cartItemId) => {
			const cartItem = cartData.items.find((item) => item.id === cartItemId);
			if (cartItem) {
				uniqueProductIds.add(cartItem.product_id);
			}
		});
		return Array.from(uniqueProductIds);
	}, [pendingCartPurchase, cartData]);

	// 각 상품의 상세 정보 조회 (배송비 확인용)
	// 최대 5개까지 조회 (성능 고려, React hooks 규칙 준수)
	const productId1 = cartProductIds[0] || 0;
	const productId2 = cartProductIds[1] || 0;
	const productId3 = cartProductIds[2] || 0;
	const productId4 = cartProductIds[3] || 0;
	const productId5 = cartProductIds[4] || 0;

	const { data: productDetail1 } = useProductDetail(
		pendingCartPurchase && productId1 ? productId1 : 0,
	);
	const { data: productDetail2 } = useProductDetail(
		pendingCartPurchase && productId2 ? productId2 : 0,
	);
	const { data: productDetail3 } = useProductDetail(
		pendingCartPurchase && productId3 ? productId3 : 0,
	);
	const { data: productDetail4 } = useProductDetail(
		pendingCartPurchase && productId4 ? productId4 : 0,
	);
	const { data: productDetail5 } = useProductDetail(
		pendingCartPurchase && productId5 ? productId5 : 0,
	);

	// 상품 ID별 상세 정보 맵 생성
	const productDetailsMap = useMemo(() => {
		const map = new Map<number, typeof productDetail1>();
		if (productId1 && productDetail1) map.set(productId1, productDetail1);
		if (productId2 && productDetail2) map.set(productId2, productDetail2);
		if (productId3 && productDetail3) map.set(productId3, productDetail3);
		if (productId4 && productDetail4) map.set(productId4, productDetail4);
		if (productId5 && productDetail5) map.set(productId5, productDetail5);
		return map;
	}, [
		productId1,
		productDetail1,
		productId2,
		productDetail2,
		productId3,
		productDetail3,
		productId4,
		productDetail4,
		productId5,
		productDetail5,
	]);

	// 주문 상품 데이터 타입 정의
	type OrderItem = {
		id: string | number;
		name: string;
		farmName: string;
		optionName: string;
		quantity: number;
		price: number;
		image: string | { image_url: string } | null;
		productId?: number;
		deliveryFee?: number;
		isSpecial?: boolean;
	};

	// 주문 상품 데이터 구성
	const orderItems = useMemo((): OrderItem[] => {
		// 장바구니 모드인 경우
		if (pendingCartPurchase) {
			// cartData가 아직 로드되지 않았으면 빈 배열 반환 (로딩 상태로 처리됨)
			if (!cartData?.items) {
				return [];
			}
			return pendingCartPurchase.cartItemIds
				.map((cartItemId) => {
					const cartItem = cartData.items.find(
						(item) => item.id === cartItemId,
					);
					if (!cartItem) return null;

					// 해당 상품의 상세 정보 찾기
					const productDetail = productDetailsMap.get(cartItem.product_id);

					const orderItem: OrderItem = {
						id: cartItem.product_option_id,
						name: cartItem.product_name,
						farmName: cartItem.farm_name,
						optionName: cartItem.option_name,
						quantity:
							pendingCartPurchase.quantities[cartItemId] || cartItem.quantity,
						price: cartItem.cost_price,
						image:
							cartItem.image_url.startsWith("http") ||
							cartItem.image_url.startsWith("/")
								? cartItem.image_url
								: `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${
										cartItem.image_url
									}`,
						productId: cartItem.product_id,
						deliveryFee: productDetail?.delivery_fee || 0,
						isSpecial: productDetail?.is_special || false,
					};
					return orderItem;
				})
				.filter((item): item is OrderItem => item !== null);
		}

		// 직접 구매 모드인 경우
		if (pendingPurchase) {
			// productDetail이 아직 로드되지 않았으면 빈 배열 반환 (로딩 상태로 처리됨)
			if (!productDetail) {
				return [];
			}
			return pendingPurchase.options.map((option) => {
				const apiOption = productDetail.options.find(
					(opt) => opt.id === option.id,
				);
				const productImage = productDetail.images?.[0];
				return {
					id: option.id,
					name: productDetail.product_name,
					farmName: productDetail.farm_name,
					optionName: apiOption?.name || option.name,
					quantity: option.quantity,
					price: apiOption?.cost_price || option.price, // 판매가
					image: productImage
						? typeof productImage === "string"
							? productImage
							: productImage.image_url
						: null,
				};
			});
		}

		return [];
	}, [
		pendingCartPurchase,
		cartData,
		pendingPurchase,
		productDetail,
		productDetailsMap,
	]);

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
		{} as Record<string, OrderItem[]>,
	);

	// 총 주문 상품 개수 (option_id의 개수로 계산)
	const totalItemCount = orderItems.length;

	// 적용 가능한 쿠폰 조회
	const { data: couponsData, isLoading: isLoadingCoupons } =
		useApplicableCoupons(totalAmount, totalAmount > 0);

	// 배송지 목록 조회
	const { data: addressesData, isLoading: isLoadingAddresses } = useAddresses();

	// 기본 배송지 찾기 (is_default=true 우선, 없으면 첫 번째)
	const defaultAddress = useMemo(() => {
		if (!addressesData || addressesData.length === 0) return null;
		return addressesData.find((addr) => addr.is_default) || addressesData[0];
	}, [addressesData]);

	// 배송지 정보 상태
	const [deliveryRequest, setDeliveryRequest] = useState("");

	// 기본 배송지가 변경되면 delivery_request 초기화
	useEffect(() => {
		if (defaultAddress) {
			setDeliveryRequest(defaultAddress.delivery_request || "");
		}
	}, [defaultAddress]);

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

	// 장바구니 아이템 삭제 (결제 완료 후 사용)
	const deleteCartItemMutation = useDeleteCartItem();

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
		if (orderItems.length === 0) {
			return null;
		}

		// 장바구니 모드인 경우
		if (pendingCartPurchase) {
			return {
				order_type: "cart" as const,
				cart_item_ids: pendingCartPurchase.cartItemIds,
				user_coupon_id: selectedCoupon ? parseInt(selectedCoupon, 10) : null,
				point_used: debouncedPointsToUse,
			};
		}

		// 직접 구매 모드인 경우
		if (pendingPurchase && productDetail) {
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
		}

		return null;
	}, [
		pendingCartPurchase,
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

	// 배송비 정보 계산
	const deliveryFee = useMemo(() => {
		// 직접 구매인 경우
		if (pendingPurchase && productDetail) {
			return productDetail.delivery_fee || 0;
		}

		// 장바구니 모드인 경우: 각 농장별로 특가 상품의 배송비 합산
		if (pendingCartPurchase && cartData?.items) {
			const farmDeliveryFees = new Map<string, number>();

			Object.entries(groupedByFarm).forEach(([farmName, items]) => {
				// 해당 농장의 특가 상품 중 배송비가 있는 첫 번째 상품의 배송비 사용
				const specialItem = items.find((item) => {
					const productDetail = productDetailsMap.get(
						(item as (typeof items)[0] & { productId?: number }).productId || 0,
					);
					return (
						productDetail?.is_special && (productDetail?.delivery_fee || 0) > 0
					);
				});

				if (specialItem) {
					const productDetail = productDetailsMap.get(
						(specialItem as (typeof items)[0] & { productId?: number })
							.productId || 0,
					);
					if (productDetail?.delivery_fee) {
						farmDeliveryFees.set(farmName, productDetail.delivery_fee);
					}
				}
			});

			// 모든 농장의 배송비 합산
			return Array.from(farmDeliveryFees.values()).reduce(
				(sum, fee) => sum + fee,
				0,
			);
		}

		return 0;
	}, [
		pendingPurchase,
		productDetail,
		pendingCartPurchase,
		cartData,
		groupedByFarm,
		productDetailsMap,
	]);

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
		if (orderItems.length === 0) {
			alert("주문 정보가 없습니다.");
			return;
		}

		if (!allAgreed) {
			alert("주문 내용 확인 및 결제 동의를 완료해주세요.");
			return;
		}

		if (!defaultAddress) {
			alert("배송지를 등록해주세요.");
			return;
		}

		if (!pendingCartPurchase && !pendingPurchase) {
			alert("주문 정보가 없습니다.");
			return;
		}

		try {
			// 1. 주문 생성
			const orderData = pendingCartPurchase
				? {
						// 장바구니 모드
						order_type: "cart" as const,
						cart_item_ids: pendingCartPurchase.cartItemIds,
						delivery_info: {
							recipient_name: defaultAddress.recipient_name,
							recipient_phone: defaultAddress.recipient_phone,
							delivery_address: `${defaultAddress.address}${
								defaultAddress.detail_address
									? `, ${defaultAddress.detail_address}`
									: ""
							}`,
							delivery_memo: deliveryRequest || undefined,
						},
						payment_method: "CARD" as const,
						user_coupon_id: selectedCoupon
							? parseInt(selectedCoupon, 10)
							: null,
						point_used: debouncedPointsToUse,
					}
				: pendingPurchase
					? {
							// 직접 구매 모드
							order_type: "direct" as const,
							items: pendingPurchase.options.map((option) => ({
								product_option_id:
									typeof option.id === "number"
										? option.id
										: parseInt(String(option.id), 10),
								quantity: option.quantity,
							})),
							delivery_info: {
								recipient_name: defaultAddress.recipient_name,
								recipient_phone: defaultAddress.recipient_phone,
								delivery_address: `${defaultAddress.address}${
									defaultAddress.detail_address
										? `, ${defaultAddress.detail_address}`
										: ""
								}`,
								delivery_memo: deliveryRequest || undefined,
							},
							payment_method: "CARD" as const,
							user_coupon_id: selectedCoupon
								? parseInt(selectedCoupon, 10)
								: null,
							point_used: debouncedPointsToUse,
						}
					: null;

			if (!orderData) {
				alert("주문 정보가 없습니다.");
				return;
			}

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
					buyer_name: defaultAddress.recipient_name,
					buyer_tel: defaultAddress.recipient_phone,
					buyer_email: "",
					buyer_addr: `${defaultAddress.address}${
						defaultAddress.detail_address
							? `, ${defaultAddress.detail_address}`
							: ""
					}`,
					buyer_postcode: defaultAddress.zipcode || "",
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

							// 장바구니에서 주문한 경우, 주문한 장바구니 아이템들 삭제
							if (
								pendingCartPurchase &&
								pendingCartPurchase.cartItemIds.length > 0
							) {
								try {
									// 선택한 장바구니 아이템들을 하나씩 삭제
									for (const cartItemId of pendingCartPurchase.cartItemIds) {
										await deleteCartItemMutation.mutateAsync(cartItemId);
									}
								} catch (cartError) {
									// 장바구니 삭제 실패해도 결제는 완료되었으므로 계속 진행
									console.error("장바구니 아이템 삭제 실패:", cartError);
								}
							}

							// sessionStorage 정리
							sessionStorage.removeItem("pendingPurchase");
							sessionStorage.removeItem("pendingCartPurchase");

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
				{(() => {
					// 직접 구매 모드인 경우: productDetail 로딩 중
					if (pendingPurchase && !pendingCartPurchase) {
						if (isLoadingProduct || !productDetail) {
							return (
								<div className="bg-white px-5 py-4">
									<div className="text-sm text-[#8C8C8C]">로딩 중...</div>
								</div>
							);
						}
					}
					// 장바구니 모드인 경우: cartData 로딩 중
					if (pendingCartPurchase && !cartData) {
						return (
							<div className="bg-white px-5 py-4">
								<div className="text-sm text-[#8C8C8C]">로딩 중...</div>
							</div>
						);
					}
					// 주문 상품이 있는 경우
					if (orderItems.length > 0) {
						return (
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
																typeof item.image === "string" ? (
																	<Image
																		src={item.image}
																		alt={item.name}
																		fill
																		className="object-cover"
																		sizes="80px"
																	/>
																) : (
																	<Image
																		src={item.image.image_url}
																		alt={item.name}
																		fill
																		className="object-cover"
																		sizes="80px"
																	/>
																)
															) : (
																<div className="w-full h-full bg-[#D9D9D9]" />
															)}
														</div>
														<div className="flex-1">
															<p className="text-sm text-[#262626]">
																{item.name}
															</p>
															<p className="text-sm text-[#8C8C8C]">
																{item.optionName}
																{item.quantity > 1
																	? ` x ${item.quantity}개`
																	: ""}
															</p>
															<p className="mt-2 text-sm font-semibold text-[#262626]">
																{(item.price * item.quantity).toLocaleString()}
																원
															</p>
														</div>
													</div>
												))}
											</div>
											<div className="flex justify-between items-start px-4 py-3 gap-2">
												<span className="font-medium text-[#8C8C8C] flex-shrink-0">
													총 주문금액
												</span>
												<div className="flex items-center gap-1 flex-wrap justify-end">
													<span className="font-medium text-[#262626]">
														{items
															.reduce(
																(sum, item) => sum + item.price * item.quantity,
																0,
															)
															.toLocaleString()}
														원
													</span>
													{(() => {
														// 해당 농장의 배송비 계산
														const farmDeliveryFee = (() => {
															if (pendingCartPurchase && cartData?.items) {
																// 해당 농장의 특가 상품 중 배송비가 있는 첫 번째 상품의 배송비 사용
																const specialItem = items.find((item) => {
																	const productDetail = productDetailsMap.get(
																		(
																			item as (typeof items)[0] & {
																				productId?: number;
																			}
																		).productId || 0,
																	);
																	return (
																		productDetail?.is_special &&
																		(productDetail?.delivery_fee || 0) > 0
																	);
																});

																if (specialItem) {
																	const productDetail = productDetailsMap.get(
																		(
																			specialItem as (typeof items)[0] & {
																				productId?: number;
																			}
																		).productId || 0,
																	);
																	return productDetail?.delivery_fee || 0;
																}
																return 0;
															}
															// 직접 구매인 경우
															return deliveryFee;
														})();

														return farmDeliveryFee > 0 ? (
															<>
																<span className="font-medium text-[#FF5266] whitespace-nowrap">
																	+{farmDeliveryFee.toLocaleString()}원 (특가
																	상품 배송비)
																</span>
																<span className="font-medium text-[#262626] whitespace-nowrap">
																	={" "}
																	{(
																		items.reduce(
																			(sum, item) =>
																				sum + item.price * item.quantity,
																			0,
																		) + farmDeliveryFee
																	).toLocaleString()}
																	원
																</span>
															</>
														) : null;
													})()}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					}
					// 주문 상품이 없는 경우
					return (
						<div className="bg-white px-5 py-4">
							<div className="text-sm text-[#8C8C8C]">
								주문할 상품이 없습니다.
							</div>
						</div>
					);
				})()}

				{/* 구분선 */}
				<div className="h-[10px] bg-[#F7F7F7]" />

				{/* 배송지 정보 */}
				<div className="bg-white">
					<div className="px-5 py-4">
						<div className="flex justify-between items-center mb-3">
							<h2 className="text-base font-semibold text-[#262626]">
								배송지 정보
							</h2>
							{defaultAddress && (
								<button
									type="button"
									onClick={() => router.push("/account/addresses")}
									className="text-sm text-[#262626]"
								>
									변경하기
								</button>
							)}
						</div>
						{isLoadingAddresses ? (
							<div className="text-sm text-[#8C8C8C]">로딩 중...</div>
						) : defaultAddress ? (
							<>
								<div className="space-y-2">
									<p className="text-sm font-medium text-[#262626]">
										{defaultAddress.recipient_name}
									</p>
									<p className="text-sm font-medium text-[#262626]">
										{defaultAddress.recipient_phone}
									</p>
									<p className="text-sm font-medium text-[#262626]">
										{defaultAddress.address}
										{defaultAddress.detail_address &&
											`, ${defaultAddress.detail_address}`}
									</p>
								</div>
								<input
									type="text"
									value={deliveryRequest}
									onChange={(e) => setDeliveryRequest(e.target.value)}
									placeholder="배송 시 요청사항을 입력해주세요"
									className="mt-4 w-full p-3 border border-[#D9D9D9] text-sm"
								/>
							</>
						) : (
							<div className="flex flex-col gap-3">
								<p className="text-sm text-[#8C8C8C]">
									등록된 배송지가 없습니다.
								</p>
								<button
									type="button"
									onClick={() => router.push("/account/addresses/new")}
									className="w-full py-3 border border-[#133A1B] text-[#133A1B] font-semibold text-sm rounded"
								>
									배송지 등록하기
								</button>
							</div>
						)}
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
						!defaultAddress ||
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
