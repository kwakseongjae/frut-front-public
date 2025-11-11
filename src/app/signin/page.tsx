"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import KakaoIcon from "@/assets/icon/ic_social_kakaotalk.svg";
import NaverIcon from "@/assets/icon/ic_social_naver.svg";
import { useAuth } from "@/contexts/AuthContext";

const SignInPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // 간단한 로그인 로직 (실제로는 서버와 통신해야 함)
    if (id.trim() && password.trim()) {
      login();
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">로그인</h1>
        </div>
        <div className="w-7" />
      </div>
      {/* 로그인 폼 영역 */}
      <div className="px-5 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[10px]">
            <label htmlFor="id" className="text-sm font-medium text-[#595959]">
              아이디
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <input
                type="text"
                placeholder="아이디를 입력해주세요"
                id={useId()}
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#595959]"
            >
              비밀번호
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                id={useId()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleLogin}
              className="cursor-pointer w-full py-[14px] bg-[#133A1B] text-sm font-semibold text-white"
            >
              로그인
            </button>
            <div className="w-full flex justify-center divide-x divide-[#D9D9D9]">
              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-[#949494] pr-2"
              >
                아이디 찾기
              </button>
              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-[#949494] pl-2"
              >
                비밀번호 찾기
              </button>
            </div>
            <button
              type="button"
              className="cursor-pointer w-full py-[14px] text-sm font-semibold text-[#133A1B] border border-[#133A1B]"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
      {/* 소셜 로그인 영역 */}
      <div className="flex justify-center gap-4 mt-12">
        <KakaoIcon className="cursor-pointer" />
        <NaverIcon className="cursor-pointer" />
      </div>
    </div>
  );
};

export default SignInPage;
