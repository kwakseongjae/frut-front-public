"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useAddresses,
  useDeleteAddress,
  useUpdateAddress,
} from "@/lib/api/hooks/use-users";

const AddressesPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOrdersheet = searchParams.get("from") === "ordersheet";
  const { data: addresses, isLoading } = useAddresses();
  const deleteAddressMutation = useDeleteAddress();
  const updateAddressMutation = useUpdateAddress();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (!confirm("정말 이 배송지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteAddressMutation.mutateAsync(id);
      // 삭제된 배송지가 선택되어 있었다면 선택 해제
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "배송지 삭제에 실패했습니다."
      );
    }
  };

  const handleCardClick = (addressId: number, isDefault: boolean) => {
    // 기본 배송지와 상관없이 선택 가능
    setSelectedAddressId(addressId);
  };

  const handleSetDefault = async () => {
    if (!selectedAddressId) return;

    const selectedAddress = addresses?.find(
      (addr) => addr.id === selectedAddressId
    );
    if (!selectedAddress) return;

    try {
      await updateAddressMutation.mutateAsync({
        id: selectedAddressId,
        request: {
          address_name: selectedAddress.address_name,
          recipient_name: selectedAddress.recipient_name,
          recipient_phone: selectedAddress.recipient_phone,
          zipcode: selectedAddress.zipcode,
          address: selectedAddress.address,
          detail_address: selectedAddress.detail_address,
          is_default: true,
          delivery_request: selectedAddress.delivery_request,
        },
      });
      setSelectedAddressId(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "기본 배송지 설정에 실패했습니다."
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
          <button
            type="button"
            onClick={() => {
              // 배송지 변경 페이지에서는 무조건 결제 페이지로 이동
              router.replace("/ordersheet");
            }}
            className="p-1 cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-lg font-semibold text-[#262626]">배송지 변경</h1>
          <div className="w-9" />
        </div>

        {/* 본문 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-center px-5 pt-32">
                <p className="text-[14px] font-medium text-[#949494]">
                  등록된 배송지가 없습니다.
                </p>
              </div>
              <div className="mt-auto bg-white px-5 py-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/account/addresses/new${
                        isFromOrdersheet ? "?from=ordersheet" : ""
                      }`
                    )
                  }
                  className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
                >
                  새 배송지 등록하기
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4 space-y-4 pb-24">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;

                  // 선택된 카드는 항상 기본배송지처럼 보이게 (초록색 border, 검은색 텍스트)
                  // 기본 배송지가 선택되지 않고 다른 카드가 선택된 경우, 기본 배송지는 일반 배송지처럼 보임 (회색 border, 회색 텍스트)
                  // 아무것도 선택되지 않았거나 기본 배송지가 선택된 경우, 기본 배송지는 초록색으로 유지
                  const isOtherCardSelected =
                    selectedAddressId !== null &&
                    addresses.find((addr) => addr.id === selectedAddressId)
                      ?.is_default !== true;

                  const borderColor = isSelected
                    ? "border-[#133A1B]"
                    : address.is_default && isOtherCardSelected
                    ? "border-[#D9D9D9]"
                    : address.is_default
                    ? "border-[#133A1B]"
                    : "border-[#D9D9D9]";
                  const textColor = isSelected
                    ? "text-[#262626]"
                    : address.is_default && isOtherCardSelected
                    ? "text-[#949494]"
                    : address.is_default
                    ? "text-[#262626]"
                    : "text-[#949494]";

                  const cardContent = (
                    <div className="relative p-4">
                      {/* 기본 배송지 태그 - 우측 상단 */}
                      {address.is_default && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 border border-[#133A1B] bg-white text-[#133A1B] text-[12px] font-semibold">
                            기본배송지
                          </span>
                        </div>
                      )}

                      {/* 이름, 주소, 번호 - 라벨 없이 값만 표시 */}
                      <div className="space-y-2 pr-20">
                        <p className={`text-[16px] font-semibold ${textColor}`}>
                          {address.recipient_name}
                        </p>
                        <p className={`text-sm ${textColor}`}>
                          {address.address}
                          {address.detail_address &&
                            `, ${address.detail_address}`}
                        </p>
                        <p className={`text-sm ${textColor}`}>
                          {address.recipient_phone}
                        </p>
                      </div>

                      {/* 수정/삭제 버튼 - 우측 하단 */}
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/account/addresses/${address.id}/edit${
                                isFromOrdersheet ? "?from=ordersheet" : ""
                              }`
                            );
                          }}
                          className="text-xs text-[#8C8C8C] hover:underline"
                        >
                          수정
                        </button>
                        <span className="text-[#8C8C8C]">|</span>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(address.id, e)}
                          disabled={deleteAddressMutation.isPending}
                          className="text-xs text-[#8C8C8C] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );

                  if (address.is_default) {
                    return (
                      <div
                        key={address.id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          handleCardClick(address.id, address.is_default)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCardClick(address.id, address.is_default);
                          }
                        }}
                        aria-label={`${address.recipient_name} 배송지 선택`}
                        className={`w-full text-left border ${borderColor} bg-white transition-colors cursor-pointer focus:outline-none`}
                      >
                        {cardContent}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={address.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleCardClick(address.id, address.is_default)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardClick(address.id, address.is_default);
                        }
                      }}
                      aria-label={`${address.recipient_name} 배송지 선택`}
                      className={`w-full text-left border ${borderColor} bg-white transition-colors cursor-pointer focus:outline-none`}
                    >
                      {cardContent}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 - 배송지 추가 & 선택 */}
        {addresses && addresses.length > 0 && (
          <div className="sticky bottom-0 bg-white px-5 py-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/account/addresses/new${
                      isFromOrdersheet ? "?from=ordersheet" : ""
                    }`
                  )
                }
                className="flex-1 py-4 border border-[#D9D9D9] bg-white text-[#262626] font-semibold text-sm"
              >
                배송지 추가
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedAddressId) {
                    // 선택된 배송지 ID를 쿼리 파라미터로 전달하여 결제 페이지로 이동
                    router.replace(
                      `/ordersheet?selectedAddressId=${selectedAddressId}`
                    );
                  } else {
                    // 기본 배송지가 있으면 기본 배송지 사용, 없으면 첫 번째 배송지 사용
                    const defaultAddr =
                      addresses.find((addr) => addr.is_default) || addresses[0];
                    if (defaultAddr) {
                      router.replace(
                        `/ordersheet?selectedAddressId=${defaultAddr.id}`
                      );
                    } else {
                      router.replace("/ordersheet");
                    }
                  }
                }}
                disabled={!addresses || addresses.length === 0}
                className="flex-1 py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                선택
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <div className="flex flex-col h-screen bg-white">
            <div className="flex items-center justify-center flex-1">
              <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
            </div>
          </div>
        </ProtectedRoute>
      }
    >
      <AddressesPageContent />
    </Suspense>
  );
}
