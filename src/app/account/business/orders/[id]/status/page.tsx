"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import {
  useSellerOrderDetail,
  useUpdateSellerOrderStatus,
} from "@/lib/api/hooks/use-order";

const DELIVERY_COMPANIES = [
  "CJ대한통운",
  "한진택배",
  "롯데택배",
  "우체국택배",
  "로젠택배",
  "경동택배",
  "대신택배",
  "일양로지스",
  "합동택배",
] as const;

const OrderStatusPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string, 10);

  const { data: orderDetail, isLoading } = useSellerOrderDetail(orderId);
  const updateOrderStatusMutation = useUpdateSellerOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 배송중 선택 시 필요한 필드들
  const [deliveryCompany, setDeliveryCompany] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [deliveryMemo, setDeliveryMemo] = useState<string>("");
  const [isDeliveryCompanyDropdownOpen, setIsDeliveryCompanyDropdownOpen] =
    useState(false);
  const deliveryCompanyDropdownRef = useRef<HTMLDivElement>(null);

  // 고유 ID 생성
  const deliveryCompanyId = useId();
  const trackingNumberId = useId();
  const deliveryMemoId = useId();

  // 상태 표시명 가져오기
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return "주문확인";
      case "CONFIRMED":
        return "배송준비";
      case "SHIPPED":
        return "배송중";
      case "DELIVERED":
        return "배송완료";
      case "CANCELLED":
        return "취소완료";
      default:
        return "";
    }
  };

  // 다음 상태 가져오기
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return { status: "CONFIRMED", display: "배송준비" };
      case "CONFIRMED":
        return { status: "SHIPPED", display: "배송중" };
      case "SHIPPED":
        return { status: "DELIVERED", display: "배송완료" };
      case "DELIVERED":
        return null;
      default:
        return null;
    }
  };

  // 상태별 설명 가져오기
  const getStatusDescription = (status: string) => {
    switch (status) {
      case "PENDING":
        return "고객이 주문을 완료했습니다.";
      case "CONFIRMED":
        return "결제가 정상적으로 완료되었습니다.";
      case "SHIPPED":
        return "상품 포장을 준비하고 있습니다";
      case "DELIVERED":
        return "배송이 완료되었습니다.";
      default:
        return "";
    }
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        deliveryCompanyDropdownRef.current &&
        !deliveryCompanyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDeliveryCompanyDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isDeliveryCompanyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isDeliveryCompanyDropdownOpen]);

  // 날짜 시간 포맷팅
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const nextStatus = orderDetail
    ? getNextStatus(orderDetail.item_status)
    : null;

  const currentStatusDisplay = orderDetail
    ? getStatusDisplay(orderDetail.item_status)
    : "";
  const selectedStatusDisplay = selectedStatus
    ? getStatusDisplay(selectedStatus)
    : currentStatusDisplay;

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
    // 배송중이 아닌 경우 택배 정보 초기화
    if (status !== "SHIPPED") {
      setDeliveryCompany("");
      setTrackingNumber("");
      setDeliveryMemo("");
    }
  };

  const handleDeliveryCompanySelect = (company: string) => {
    setDeliveryCompany(company);
    setIsDeliveryCompanyDropdownOpen(false);
  };

  const handleSave = async () => {
    if (!selectedStatus) return;

    try {
      const request: {
        item_status: "CONFIRMED" | "SHIPPED" | "DELIVERED";
        delivery_company?: string;
        tracking_number?: string;
        delivery_memo?: string;
      } = {
        item_status: selectedStatus as "CONFIRMED" | "SHIPPED" | "DELIVERED",
      };

      // 배송중으로 변경할 때만 택배 정보 포함
      if (selectedStatus === "SHIPPED") {
        request.delivery_company = deliveryCompany;
        request.tracking_number = trackingNumber;
        request.delivery_memo = deliveryMemo;
      }

      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        request,
      });

      router.back();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "주문 상태 변경에 실패했습니다."
      );
    }
  };

  const isShippedSelected = selectedStatus === "SHIPPED";
  const isFormValid =
    selectedStatus &&
    (!isShippedSelected ||
      (deliveryCompany && trackingNumber && trackingNumber.trim() !== ""));

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeftIcon />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#262626]">
              주문 상태 변경
            </h1>
          </div>
          <div className="w-7" />
        </div>
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeftIcon />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#262626]">
              주문 상태 변경
            </h1>
          </div>
          <div className="w-7" />
        </div>
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">
            주문 정보를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">
            주문 상태 변경
          </h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 pb-20">
        {/* 주문 정보 섹션 */}
        <div className="bg-white border border-[#E5E5E5] mx-4 mt-4 p-4">
          <h2 className="text-base font-semibold text-[#262626] mb-4">
            주문 정보
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#8C8C8C]">고객명</span>
              <span className="text-sm text-[#262626]">
                {orderDetail.recipient_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8C8C8C]">상품</span>
              <span className="text-sm text-[#262626] text-right">
                {orderDetail.product_name}{" "}
                {orderDetail.option_name && `x ${orderDetail.quantity}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8C8C8C]">주소</span>
              <span className="text-sm text-[#262626] text-right">
                {orderDetail.delivery_address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8C8C8C]">현재상태</span>
              <span className="text-sm font-semibold text-[#262626]">
                {getStatusDisplay(orderDetail.item_status)}
              </span>
            </div>
          </div>
        </div>

        {/* 상태 변경 섹션 */}
        <div className="bg-white border border-[#E5E5E5] mx-4 mt-4 p-4">
          <h2 className="text-base font-semibold text-[#262626] mb-4">
            상태 변경
          </h2>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => nextStatus && setIsDropdownOpen(!isDropdownOpen)}
              disabled={!nextStatus}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                nextStatus
                  ? "border-[#E5E5E5] bg-[#F7F7F7] cursor-pointer"
                  : "border-[#E5E5E5] bg-[#F7F7F7] cursor-not-allowed opacity-50"
              }`}
              aria-label="상태 선택"
            >
              <span className="text-sm text-[#262626]">
                {selectedStatusDisplay}
              </span>
              {nextStatus && <ChevronRightIcon className="w-4 h-4 rotate-90" />}
            </button>
            {isDropdownOpen && nextStatus && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => handleStatusSelect(nextStatus.status)}
                  className="w-full px-4 py-3 text-left text-sm text-[#262626] hover:bg-[#F7F7F7] first:rounded-t-lg"
                >
                  {nextStatus.display}
                </button>
              </div>
            )}
          </div>

          {/* 배송중 선택 시 택배 정보 입력폼 */}
          {isShippedSelected && (
            <div className="mt-4 space-y-4">
              {/* 택배회사 선택 */}
              <div>
                <label
                  htmlFor={deliveryCompanyId}
                  className="block text-sm font-medium text-[#262626] mb-2"
                >
                  택배회사
                </label>
                <div className="relative" ref={deliveryCompanyDropdownRef}>
                  <button
                    id={deliveryCompanyId}
                    type="button"
                    onClick={() =>
                      setIsDeliveryCompanyDropdownOpen(
                        !isDeliveryCompanyDropdownOpen
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] cursor-pointer"
                    aria-label="택배회사 선택"
                  >
                    <span className="text-sm text-[#262626]">
                      {deliveryCompany || "택배회사를 선택하세요"}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 rotate-90" />
                  </button>
                  {isDeliveryCompanyDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {DELIVERY_COMPANIES.map((company) => (
                        <button
                          key={company}
                          type="button"
                          onClick={() => handleDeliveryCompanySelect(company)}
                          className="w-full px-4 py-3 text-left text-sm text-[#262626] hover:bg-[#F7F7F7] first:rounded-t-lg"
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 송장번호 입력 */}
              <div>
                <label
                  htmlFor={trackingNumberId}
                  className="block text-sm font-medium text-[#262626] mb-2"
                >
                  송장번호
                </label>
                <input
                  id={trackingNumberId}
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="송장번호를 입력하세요"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
                />
              </div>

              {/* 배송메모 입력 */}
              <div>
                <label
                  htmlFor={deliveryMemoId}
                  className="block text-sm font-medium text-[#262626] mb-2"
                >
                  배송메모 (선택)
                </label>
                <textarea
                  id={deliveryMemoId}
                  value={deliveryMemo}
                  onChange={(e) => setDeliveryMemo(e.target.value)}
                  placeholder="배송메모를 입력하세요"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 주문 히스토리 섹션 */}
        <div className="bg-white border border-[#E5E5E5] mx-4 mt-4 p-4">
          <h2 className="text-base font-semibold text-[#262626] mb-4">
            주문 히스토리
          </h2>
          <div className="space-y-4">
            {orderDetail.order_history
              .filter((historyItem) => historyItem.timestamp !== "")
              .map((historyItem) => {
                const timestamp = formatDateTime(historyItem.timestamp);

                return (
                  <div
                    key={historyItem.status}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#262626]">
                        {historyItem.status_display}
                      </div>
                      <div className="text-xs text-[#8C8C8C] mt-1">
                        {getStatusDescription(historyItem.status)}
                      </div>
                    </div>
                    <div className="text-xs text-[#8C8C8C] ml-4">
                      {timestamp}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#E5E5E5] sm:left-auto sm:right-auto sm:w-[640px] sm:mx-auto">
        <div className="p-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid || updateOrderStatusMutation.isPending}
            className={`w-full py-3  text-base font-semibold ${
              isFormValid && !updateOrderStatusMutation.isPending
                ? "bg-[#133A1B] text-white cursor-pointer"
                : "bg-[#E5E5E5] text-[#8C8C8C] cursor-not-allowed"
            }`}
            aria-label="저장"
          >
            {updateOrderStatusMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
