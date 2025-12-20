"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { authApi } from "@/lib/api/auth";
import {
  useChangePhone,
  useUpdateProfile,
  useUserProfile,
} from "@/lib/api/hooks/use-users";

const EditAccountPage = () => {
  const router = useRouter();
  const { data: profile, isLoading } = useUserProfile();
  const changePhoneMutation = useChangePhone();
  const updateProfileMutation = useUpdateProfile();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);

  // 전체 동의 계산 (둘 다 동의인 경우에만 true)
  const marketingConsent = smsConsent && emailConsent;

  // 휴대폰 번호 변경 관련 상태
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const phoneInputId = useId();
  const verificationInputId = useId();
  const emailInputId = useId();

  // API 데이터로 폼 초기화
  useEffect(() => {
    if (profile) {
      setEmail(profile.email || "");
      // 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
      const formattedPhone = profile.phone
        ? profile.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
        : "";
      setPhone(formattedPhone);
      setSmsConsent(profile.is_sms_consented || false);
      setEmailConsent(profile.is_email_consented || false);
    }
  }, [profile]);

  // 전체 동의 토글 핸들러
  const handleToggleMarketingConsent = async () => {
    const newValue = !marketingConsent;
    const updatedSmsConsent = newValue;
    const updatedEmailConsent = newValue;

    setSmsConsent(updatedSmsConsent);
    setEmailConsent(updatedEmailConsent);

    try {
      await updateProfileMutation.mutateAsync({
        is_marketing_consented: newValue,
        is_sms_consented: updatedSmsConsent,
        is_email_consented: updatedEmailConsent,
      });
    } catch (error) {
      // 에러 발생 시 이전 상태로 복구
      setSmsConsent(!updatedSmsConsent);
      setEmailConsent(!updatedEmailConsent);
      console.error("마케팅 동의 변경 실패:", error);
    }
  };

  // 전화번호에서 하이픈, 공백 제거하고 숫자만 추출
  const extractPhoneNumber = (phoneInput: string): string => {
    return phoneInput.replace(/[^0-9]/g, "");
  };

  // 한국 휴대폰 번호 형식 검증
  const isValidKoreanPhoneNumber = (phoneNumber: string): boolean => {
    const koreanMobilePrefixes = ["010", "011", "016", "017", "018", "019"];
    if (phoneNumber.length !== 11) return false;
    const prefix = phoneNumber.substring(0, 3);
    return koreanMobilePrefixes.includes(prefix);
  };

  // 휴대폰 번호 변경 시작
  const handleChangePhone = () => {
    setIsChangingPhone(true);
    setNewPhone("");
    setVerificationCode("");
    setIsPhoneVerified(false);
    setSmsError(null);
    setSmsSuccess(null);
    setVerificationError(null);
  };

  // 인증번호 요청
  const handleVerificationRequest = async () => {
    const phoneNumber = extractPhoneNumber(newPhone);

    if (!phoneNumber) {
      setSmsError("전화번호를 입력해주세요.");
      setSmsSuccess(null);
      return;
    }

    if (!isValidKoreanPhoneNumber(phoneNumber)) {
      setSmsError(
        "올바른 한국 휴대폰 번호를 입력해주세요. (010, 011, 016, 017, 018, 019)"
      );
      setSmsSuccess(null);
      return;
    }

    setIsSendingSms(true);
    setSmsError(null);
    setSmsSuccess(null);
    setIsPhoneVerified(false);
    setVerificationCode("");
    setVerificationError(null);

    try {
      const response = await authApi.sendSmsVerification({
        phone: phoneNumber,
      });
      setSmsSuccess(response.message || "인증번호가 발송되었습니다.");
      setSmsError(null);
    } catch (error) {
      setSmsError(
        error instanceof Error
          ? error.message
          : "인증번호 발송에 실패했습니다. 다시 시도해주세요."
      );
      setSmsSuccess(null);
    } finally {
      setIsSendingSms(false);
    }
  };

  // 인증번호 검증 및 번호 변경
  const handleVerifyCode = async () => {
    const phoneNumber = extractPhoneNumber(newPhone);

    if (!phoneNumber) {
      setVerificationError("전화번호를 입력해주세요.");
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationError("인증번호 6자리를 입력해주세요.");
      return;
    }

    setIsVerifyingCode(true);
    setVerificationError(null);

    try {
      await authApi.verifySmsCode({
        phone: phoneNumber,
        code: verificationCode,
      });
      setIsPhoneVerified(true);
      setVerificationError(null);
      setSmsSuccess("전화번호 인증이 완료되었습니다.");

      // 번호 변경 API 호출 (포맷팅된 번호로 전송)
      const formattedPhone = phoneNumber.replace(
        /(\d{3})(\d{4})(\d{4})/,
        "$1-$2-$3"
      );
      await changePhoneMutation.mutateAsync(formattedPhone);

      // 성공 후 상태 초기화
      setIsChangingPhone(false);
      setNewPhone("");
      setVerificationCode("");
      setIsPhoneVerified(false);
      setSmsError(null);
      setSmsSuccess(null);
      setVerificationError(null);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "인증번호 확인에 실패했습니다. 다시 시도해주세요."
      );
      setIsPhoneVerified(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // 번호 변경 취소
  const _handleCancelPhoneChange = () => {
    setIsChangingPhone(false);
    setNewPhone("");
    setVerificationCode("");
    setIsPhoneVerified(false);
    setSmsError(null);
    setSmsSuccess(null);
    setVerificationError(null);
  };

  const handleChangeEmail = async () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        email: email.trim(),
      });
      alert("이메일이 변경되었습니다.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "이메일 변경에 실패했습니다."
      );
    }
  };

  const handlePasswordChange = () => {
    router.push("/account/edit/password");
  };

  const _handleLogout = () => {
    // 로그아웃 로직
    console.log("로그아웃");
  };

  const handleWithdraw = () => {
    router.push("/account/withdraw");
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
          <h1 className="text-lg font-semibold text-[#262626]">
            개인정보 수정
          </h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 개인정보 필드 */}
      <div className="px-5 py-4">
        <div className="flex flex-col gap-5">
          {/* 아이디 */}
          <div className="flex flex-col gap-[10px]">
            <div className="text-sm font-medium text-[#595959]">아이디</div>
            <div className="w-full border border-[#D9D9D9] p-3">
              <div className="w-full text-sm text-[#262626]">
                {isLoading ? "로딩 중..." : profile?.username || ""}
              </div>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-[10px]">
            <div className="text-sm font-medium text-[#595959]">비밀번호</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-[#D9D9D9] p-3">
                <div className="w-full text-sm text-[#949494]">••••••••</div>
              </div>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="w-[112px] py-3 text-sm font-medium text-[#133A1B] border border-[#133A1B] whitespace-nowrap cursor-pointer"
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          {/* 휴대폰 번호 */}
          {!isChangingPhone ? (
            <div className="flex flex-col gap-[10px]">
              <div className="text-sm font-medium text-[#595959]">
                휴대폰 번호
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 border border-[#D9D9D9] p-3">
                  <div className="w-full text-sm text-[#262626]">
                    {isLoading ? "로딩 중..." : phone || "010-0000-0000"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleChangePhone}
                  className="w-[112px] py-3 text-sm font-medium text-[#133A1B] border border-[#133A1B] whitespace-nowrap cursor-pointer"
                >
                  번호 변경
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* 휴대폰 입력 섹션 */}
              <div className="flex flex-col gap-[10px]">
                <label
                  htmlFor={phoneInputId}
                  className="text-sm font-medium text-[#595959]"
                >
                  휴대폰
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 border border-[#D9D9D9] p-3">
                    <input
                      type="tel"
                      placeholder="- 제외하고 번호 입력"
                      id={phoneInputId}
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      disabled={isSendingSms || isVerifyingCode}
                      className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerificationRequest}
                    disabled={
                      !newPhone.trim() || isSendingSms || isVerifyingCode
                    }
                    className="w-[85px] py-3 text-sm font-medium text-[#133A1B] border border-[#133A1B] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingSms ? "발송 중..." : "인증요청"}
                  </button>
                </div>
                {smsError && (
                  <div className="text-sm text-red-500">{smsError}</div>
                )}
                {smsSuccess && (
                  <div className="text-sm text-[#133A1B]">{smsSuccess}</div>
                )}
              </div>

              {/* 인증번호 입력 섹션 */}
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 border border-[#D9D9D9] p-3">
                    <input
                      type="text"
                      placeholder="인증번호 입력"
                      id={verificationInputId}
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        setVerificationError(null);
                      }}
                      maxLength={6}
                      disabled={isVerifyingCode || isPhoneVerified}
                      className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={
                      !newPhone.trim() ||
                      !verificationCode.trim() ||
                      isVerifyingCode ||
                      verificationCode.length !== 6
                    }
                    className="w-[85px] py-3.5 text-sm font-medium text-[#133A1B] border border-[#133A1B] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingCode ? "확인 중..." : "확인"}
                  </button>
                </div>
                {verificationError && (
                  <div className="text-sm text-red-500">
                    {verificationError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 이메일 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={emailInputId}
              className="text-sm font-medium text-[#595959]"
            >
              이메일
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-[#D9D9D9] px-3 py-2.5">
                <input
                  type="email"
                  id={emailInputId}
                  autoComplete="off"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="이메일 입력"
                  className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={updateProfileMutation.isPending || isLoading}
                className="px-4 py-3 text-sm font-medium text-[#133A1B] border border-[#133A1B] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? "변경 중..." : "변경하기"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 디바이더 */}
      <div className="h-[10px] bg-[#F7F7F7]" />

      {/* 마케팅 수신 동의 */}
      <div className="px-5 py-4">
        <h2 className="text-base font-semibold text-[#262626] mb-3">
          마케팅 수신 동의
        </h2>
        <div className="flex flex-col gap-3">
          {/* 전체 동의 */}
          <button
            type="button"
            onClick={handleToggleMarketingConsent}
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-3 cursor-pointer disabled:opacity-50"
            aria-label="마케팅 수신 전체 동의"
          >
            {marketingConsent ? <FilledCheckbox /> : <UnfilledCheckbox />}
            <span className="text-sm text-[#262626]">
              마케팅 수신 전체 동의
            </span>
          </button>
          {/* 구분선 */}
          <div className="w-full h-px bg-[#D9D9D9]" />
          {/* SMS 수신 동의 */}
          <button
            type="button"
            onClick={async () => {
              const newValue = !smsConsent;
              setSmsConsent(newValue);

              try {
                await updateProfileMutation.mutateAsync({
                  is_sms_consented: newValue,
                });
              } catch (error) {
                // 에러 발생 시 이전 상태로 복구
                setSmsConsent(!newValue);
                console.error("SMS 수신 동의 변경 실패:", error);
              }
            }}
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {smsConsent ? <FilledCheckbox /> : <UnfilledCheckbox />}
            <span className="text-sm text-[#262626]">SMS 수신 동의</span>
          </button>
          {/* 이메일 수신 동의 */}
          <button
            type="button"
            onClick={async () => {
              const newValue = !emailConsent;
              setEmailConsent(newValue);

              try {
                await updateProfileMutation.mutateAsync({
                  is_email_consented: newValue,
                });
              } catch (error) {
                // 에러 발생 시 이전 상태로 복구
                setEmailConsent(!newValue);
                console.error("이메일 수신 동의 변경 실패:", error);
              }
            }}
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {emailConsent ? <FilledCheckbox /> : <UnfilledCheckbox />}
            <span className="text-sm text-[#262626]">이메일 수신 동의</span>
          </button>
        </div>
      </div>

      {/* 디바이더 */}
      <div className="h-[10px] bg-[#F7F7F7]" />

      {/* 회원탈퇴 */}
      <div className="px-5 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleWithdraw}
            className="flex items-center gap-1 text-sm text-[#8C8C8C] cursor-pointer active:opacity-70"
          >
            <span>회원탈퇴</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#8C8C8C]"
              aria-label="회원탈퇴"
              role="img"
            >
              <title>회원탈퇴</title>
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountPage;
