"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { useWithdraw } from "@/lib/api/hooks/use-auth";

const WithdrawPage = () => {
  const router = useRouter();
  const withdrawMutation = useWithdraw();
  const consentId = useId();
  const reasonId = useId();
  const passwordId = useId();

  const [isConsented, setIsConsented] = useState(false);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [detail, setDetail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const detailId = useId();
  const otherReasonId = useId();

  const withdrawalReasons = [
    "원하는 상품이 없어서",
    "가격이 기대보다 높아서",
    "상품 품질이 만족스럽지 않아서",
    "배송이 늦거나 불편해서",
    "교환/환불 등 CS 경험이 불만족스러워서",
    "앱/웹 사용이 불편해서",
    "혜택(쿠폰/이벤트)이 부족해서",
    "자주 이용할 필요가 없어서",
    "기타(직접 입력)",
  ];

  const isOtherReason = reason === "기타(직접 입력)";

  const handleSubmit = async () => {
    setError(null);

    if (!isConsented) {
      setError("탈퇴 동의를 확인해주세요.");
      return;
    }

    if (!password.trim()) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!reason.trim()) {
      setError("탈퇴 사유를 선택해주세요.");
      return;
    }

    if (isOtherReason && !otherReason.trim()) {
      setError("기타 탈퇴 사유를 입력해주세요.");
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        password: password.trim(),
        reason: isOtherReason ? otherReason.trim() : reason.trim(),
        detail: detail.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원탈퇴에 실패했습니다.");
    }
  };

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
          <h1 className="text-lg font-semibold text-[#262626]">회원탈퇴</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 px-5 py-4">
        <div className="flex flex-col gap-5">
          {/* 탈퇴 전 확인 사항 */}
          <div className="border border-[#D9D9D9] rounded-lg p-4 bg-white">
            <div className="flex flex-col gap-3">
              {/* 메인 제목 */}
              <p className="text-[14px] font-semibold text-[#595959]">
                ※ 탈퇴 전 아래 내용을 확인해주세요.
              </p>

              {/* 조건 및 결과 항목들 */}
              <ul className="flex flex-col list-none">
                <li className="flex items-center gap-2">
                  <span className="text-[#595959]">-</span>
                  <span className="text-[12px] font-medium text-[#595959]">
                    진행 중인 주문·환불·CS가 있을 경우
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#595959]">-</span>
                  <span className="text-[12px] font-medium text-[#595959]">
                    모든 처리가 완료된 후 탈퇴가 가능합니다.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#595959]">-</span>
                  <span className="text-[12px] font-medium text-[#595959]">
                    탈퇴 시 보유 중인 쿠폰, 적립금, 팔로우 목록, 개인화 정보는
                    즉시 삭제되며 복구할 수 없습니다.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#595959]">-</span>
                  <span className="text-[12px] font-medium text-[#595959]">
                    탈퇴 후 동일 아이디로 재가입은 불가합니다.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#595959]">-</span>
                  <span className="text-[12px] font-medium text-[#595959]">
                    관련 법령에 따라 아래 정보는 일정 기간 보관 후 파기됩니다.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#595959]">-</span>
                  <span className="text-[12px] font-medium text-[#595959]">
                    (전자상거래 등에서의 소비자보호에 관한 법률 기준)
                  </span>
                </li>
              </ul>

              {/* 데이터 보관 기간 목록 */}
              <ul className="flex flex-col gap-1 ml-4 list-none">
                <li className="flex items-center gap-2">
                  <p className="text-[#133A1B]">•</p>
                  <p className="text-[12px] font-medium text-[#133A1B]">
                    계약·청약철회 관련 기록: 5년
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <p className="text-[#133A1B]">•</p>
                  <p className="text-[12px] font-medium text-[#133A1B]">
                    대금결제 및 재화 공급에 관한 기록: 5년
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <p className="text-[#133A1B]">•</p>
                  <p className="text-[12px] font-medium text-[#133A1B]">
                    소비자의 불만·분쟁처리 기록: 3년
                  </p>
                </li>
                <li className="flex items-center gap-2">
                  <p className="text-[#133A1B]">•</p>
                  <p className="text-[12px] font-medium text-[#133A1B]">
                    표시·광고에 관한 기록: 6개월
                  </p>
                </li>
              </ul>

              {/* 데이터 사용 제한 */}
              <p className="text-[12px] font-medium text-[#595959]">
                ※ 법적 의무 보관 기간 동안은 관련 목적 외 사용되지 않습니다.
              </p>

              {/* 탈퇴 후 마케팅 통신 */}
              <p className="text-[12px] font-medium text-[#595959]">
                - 탈퇴 전에 동의하신 광고성 SMS, E-mail은 시스템 특성상 최대
                7일간 발송될 수 있습니다.
              </p>
            </div>
          </div>

          {/* 탈퇴 사유 드롭다운 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={reasonId}
              className="text-sm font-medium text-[#595959]"
            >
              탈퇴 사유
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <select
                id={reasonId}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value !== "기타(직접 입력)") {
                    setOtherReason("");
                  }
                }}
                className="w-full text-sm text-[#262626] focus:outline-none caret-[#133A1B] bg-white"
              >
                <option value="">탈퇴 사유를 선택하세요</option>
                {withdrawalReasons.map((reasonOption) => (
                  <option key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 기타 탈퇴 사유 직접 입력란 (기타 선택 시에만 표시) */}
          {isOtherReason && (
            <div className="flex flex-col gap-[10px]">
              <label
                htmlFor={otherReasonId}
                className="text-sm font-medium text-[#595959]"
              >
                탈퇴 사유
              </label>
              <div className="w-full border border-[#D9D9D9] p-3">
                <input
                  type="text"
                  id={otherReasonId}
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="탈퇴 사유를 입력해주세요"
                  className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                />
              </div>
            </div>
          )}

          {/* 상세 사유 입력란 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={detailId}
              className="text-sm font-medium text-[#595959]"
            >
              상세 사유 (선택)
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <textarea
                id={detailId}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="상세 사유를 입력해주세요"
                rows={4}
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] resize-none"
              />
            </div>
          </div>

          {/* 현재 비밀번호 입력란 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={passwordId}
              className="text-sm font-medium text-[#595959]"
            >
              현재 비밀번호
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <input
                type="password"
                id={passwordId}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
              />
            </div>
          </div>

          {/* 동의 체크박스 */}
          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => setIsConsented(!isConsented)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsConsented(!isConsented);
                }
              }}
              className="cursor-pointer"
              aria-label="탈퇴 동의"
            >
              {isConsented ? <FilledCheckbox /> : <UnfilledCheckbox />}
            </button>
            <label
              htmlFor={consentId}
              className="text-sm text-[#262626] cursor-pointer"
              onClick={() => setIsConsented(!isConsented)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsConsented(!isConsented);
                }
              }}
            >
              유의사항을 확인하였고 회원탈퇴에 동의합니다.
            </label>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !isConsented ||
            !password.trim() ||
            !reason.trim() ||
            (isOtherReason && !otherReason.trim()) ||
            withdrawMutation.isPending
          }
          className={`w-full py-[14px] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
            isConsented &&
            password.trim() &&
            reason.trim() &&
            !(isOtherReason && !otherReason.trim()) &&
            !withdrawMutation.isPending
              ? "bg-[#133A1B] text-white"
              : "bg-[#D9D9D9] text-[#262626]"
          }`}
        >
          {withdrawMutation.isPending ? "처리 중..." : "확인"}
        </button>
      </div>
    </div>
  );
};

export default WithdrawPage;
