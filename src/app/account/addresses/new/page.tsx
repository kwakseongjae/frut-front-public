"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCreateAddress } from "@/lib/api/hooks/use-users";

const NewAddressPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOrdersheet = searchParams.get("from") === "ordersheet";
  const createAddressMutation = useCreateAddress();
  const isDefaultInputId = useId();

  // 카카오 우편번호 검색 팝업
  const scriptUrl =
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  const open = useDaumPostcodePopup(scriptUrl);

  const [formData, setFormData] = useState({
    address_name: "",
    recipient_name: "",
    recipient_phone: "",
    zipcode: "",
    address: "",
    detail_address: "",
    is_default: true,
    delivery_request: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 주소 검색 완료 핸들러
  const handleAddressComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    // 도로명 주소인 경우
    if (data.addressType === "R") {
      // 법정동명이 있을 경우 추가
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      // 건물명이 있고, 공동주택일 경우 추가
      if (data.buildingName !== "" && data.apartment === "Y") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
      if (extraAddress !== "") {
        fullAddress += ` (${extraAddress})`;
      }
    }

    // 우편번호와 주소 정보를 해당 필드에 넣는다.
    setFormData((prev) => ({
      ...prev,
      zipcode: data.zonecode,
      address: fullAddress,
      detail_address: "", // 상세주소는 초기화
    }));
  };

  // 주소 검색 팝업 열기
  const handleOpenAddressSearch = () => {
    open({
      onComplete: handleAddressComplete,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (
      !formData.recipient_name ||
      !formData.recipient_phone ||
      !formData.zipcode ||
      !formData.address
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      await createAddressMutation.mutateAsync({
        address_name: ".",
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        zipcode: formData.zipcode,
        address: formData.address,
        detail_address: formData.detail_address || null,
        is_default: formData.is_default,
        delivery_request: formData.delivery_request.trim()
          ? formData.delivery_request.trim()
          : "없음",
      });

      // 배송지 변경 페이지로 이동 (결제 페이지에서 왔으면 히스토리 교체)
      if (isFromOrdersheet) {
        router.replace(`/account/addresses?from=ordersheet`);
      } else {
        router.replace("/account/addresses");
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "배송지 등록에 실패했습니다."
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
              router.back();
            }}
            className="p-1 cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-lg font-semibold text-[#262626]">배송지 추가</h1>
          <div className="w-7" />
        </div>

        {/* 본문 */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-5">
              {/* 받는 사람 */}
              <div className="flex flex-col gap-[10px]">
                <label
                  htmlFor="recipient_name"
                  className="text-sm font-medium text-[#595959]"
                >
                  받는 사람 <span className="text-red-500">*</span>
                </label>
                <div className="w-full border border-[#D9D9D9] p-3">
                  <input
                    type="text"
                    id="recipient_name"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleInputChange}
                    placeholder="이름을 입력해 주세요"
                    className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                  />
                </div>
              </div>

              {/* 휴대폰 번호 */}
              <div className="flex flex-col gap-[10px]">
                <label
                  htmlFor="recipient_phone"
                  className="text-sm font-medium text-[#595959]"
                >
                  휴대폰 번호 <span className="text-red-500">*</span>
                </label>
                <div className="w-full border border-[#D9D9D9] p-3">
                  <input
                    type="tel"
                    id="recipient_phone"
                    name="recipient_phone"
                    value={formData.recipient_phone}
                    onChange={handleInputChange}
                    placeholder="휴대폰 번호를 입력해주세요"
                    className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                  />
                </div>
              </div>

              {/* 주소 */}
              <div className="flex flex-col gap-[10px]">
                <label className="text-sm font-medium text-[#595959]">
                  주소 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 border border-[#D9D9D9] p-3">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="주소 찾기"
                      readOnly
                      className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddressSearch}
                    className="px-4 py-3 border border-[#133A1B] bg-white text-[#133A1B] text-sm font-semibold whitespace-nowrap"
                  >
                    주소 검색
                  </button>
                </div>
                {/* 우편번호 표시 */}
                {formData.zipcode && (
                  <div className="w-full border border-[#D9D9D9] p-3 bg-[#F7F7F7]">
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      readOnly
                      className="w-full text-sm text-[#262626] focus:outline-none bg-transparent"
                    />
                  </div>
                )}
                <div className="w-full border border-[#D9D9D9] p-3">
                  <input
                    type="text"
                    name="detail_address"
                    value={formData.detail_address}
                    onChange={handleInputChange}
                    placeholder="상세 주소를 입력해주세요"
                    className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                  />
                </div>
              </div>

              {/* 배송 요청사항 */}
              <div className="flex flex-col gap-[10px]">
                <label
                  htmlFor="delivery_request"
                  className="text-sm font-medium text-[#595959]"
                >
                  배송 요청사항
                </label>
                <div className="w-full border border-[#D9D9D9] p-3">
                  <input
                    type="text"
                    id="delivery_request"
                    name="delivery_request"
                    value={formData.delivery_request}
                    onChange={handleInputChange}
                    placeholder="배송 요청사항을 입력해주세요"
                    className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                  />
                </div>
              </div>

              {/* 기본 배송지 설정 */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      is_default: !prev.is_default,
                    }));
                  }}
                  className="flex items-center justify-center cursor-pointer"
                  aria-label="기본배송지로 설정하기"
                >
                  {formData.is_default ? (
                    <FilledCheckbox />
                  ) : (
                    <UnfilledCheckbox />
                  )}
                </button>
                <span className="text-sm text-[#262626]">
                  기본배송지로 설정하기
                </span>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-auto bg-white px-5 py-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 border border-[#D9D9D9] bg-white text-[#262626] font-semibold text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={createAddressMutation.isPending}
                className="flex-1 py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAddressMutation.isPending ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default function NewAddressPage() {
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
      <NewAddressPageContent />
    </Suspense>
  );
}
