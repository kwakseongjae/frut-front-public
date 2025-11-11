"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";

const EditAccountPage = () => {
  const router = useRouter();

  // 더미 데이터
  const [userId, setUserId] = useState("kwakseongjae");
  const [email, setEmail] = useState("kwak@gmail.com");
  const [phone, setPhone] = useState("010-1234-5678");
  const [address, setAddress] = useState("경기도 김포시 걸포로 32, 105호");
  const [smsConsent, setSmsConsent] = useState(true);
  const [emailConsent, setEmailConsent] = useState(true);

  const handleChangeId = () => {
    // TODO: 아이디 변경 API 연결
    console.log("아이디 변경:", userId);
  };

  const handleChangeEmail = () => {
    // TODO: 이메일 변경 API 연결
    console.log("이메일 변경:", email);
  };

  const handleChangePhone = () => {
    // TODO: 휴대폰 번호 변경 API 연결
    console.log("휴대폰 번호 변경:", phone);
  };

  const handleChangeAddress = () => {
    // TODO: 주소 변경 API 연결
    console.log("주소 변경:", address);
  };

  const handlePasswordChange = () => {
    router.push("/account/edit/password");
  };

  const handleLogout = () => {
    // 로그아웃 로직
    console.log("로그아웃");
  };

  const handleWithdraw = () => {
    // 회원탈퇴 로직
    console.log("회원탈퇴");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5 border-b border-[#E5E5E5]">
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
      <div className="flex flex-col">
        {/* 아이디 */}
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <label
            htmlFor="userId"
            className="text-xs font-medium text-[#595959] mb-2 block"
          >
            아이디
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              id={useId()}
              autoComplete="off"
              name="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디"
              className="flex-1 px-3 py-2 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
            />
            <button
              type="button"
              aria-label="아이디 변경"
              onClick={handleChangeId}
              className="text-sm text-[#8C8C8C] cursor-pointer"
            >
              변경하기
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <div className="text-sm font-medium text-[#595959] block">
            비밀번호
          </div>
          <button
            type="button"
            onClick={handlePasswordChange}
            className="text-sm text-[#8C8C8C] ml-4 cursor-pointer"
          >
            변경하기
          </button>
        </div>

        {/* 휴대폰 번호 */}
        <div className="px-5 py-4 ">
          <label
            htmlFor="phone"
            className="text-xs font-medium text-[#595959] mb-2 block"
          >
            휴대폰 번호
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              id={useId()}
              autoComplete="off"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 text-sm text-[#262626] focus:outline-none pb-1 border-b border-[#E5E5E5]"
            />
            <button
              type="button"
              onClick={handleChangePhone}
              className="text-sm text-[#8C8C8C] cursor-pointer"
            >
              변경하기
            </button>
          </div>
        </div>

        {/* 이메일 */}
        <div className="px-5 py-4 ">
          <label
            htmlFor="email"
            className="text-xs font-medium text-[#595959] mb-2 block"
          >
            이메일
          </label>
          <div className="flex items-center gap-4">
            <input
              type="email"
              id={useId()}
              autoComplete="off"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-sm text-[#262626] focus:outline-none pb-1 border-b border-[#E5E5E5]"
            />
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-sm text-[#8C8C8C] cursor-pointer"
            >
              변경하기
            </button>
          </div>
        </div>

        {/* 주소 */}
        <div className="px-5 py-4 ">
          <label
            htmlFor="address"
            className="text-xs font-medium text-[#595959] mb-2 block"
          >
            주소
          </label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              id={useId()}
              autoComplete="off"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 text-sm text-[#262626] focus:outline-none pb-1 border-b border-[#E5E5E5]"
            />
            <button
              type="button"
              onClick={handleChangeAddress}
              className="text-sm text-[#8C8C8C] cursor-pointer"
            >
              변경하기
            </button>
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
          <button
            type="button"
            onClick={() => setSmsConsent(!smsConsent)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {smsConsent ? <FilledCheckbox /> : <UnfilledCheckbox />}
            <span className="text-sm text-[#262626]">SMS 수신 동의</span>
          </button>
          <button
            type="button"
            onClick={() => setEmailConsent(!emailConsent)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {emailConsent ? <FilledCheckbox /> : <UnfilledCheckbox />}
            <span className="text-sm text-[#262626]">이메일 수신 여부</span>
          </button>
        </div>
      </div>

      {/* 디바이더 */}
      <div className="h-px bg-[#E5E5E5]" />

      {/* 계정 관리 */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5] cursor-pointer active:bg-[#F5F5F5]"
        >
          <span className="text-base text-[#262626]">로그아웃</span>
        </button>
        <button
          type="button"
          onClick={handleWithdraw}
          className="flex items-center justify-between px-5 py-4 cursor-pointer active:bg-[#F5F5F5]"
        >
          <span className="text-base text-[#262626]">회원탈퇴</span>
        </button>
      </div>
    </div>
  );
};

export default EditAccountPage;
