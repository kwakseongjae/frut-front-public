"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import KakaoIcon from "@/assets/icon/ic_social_kakaotalk.svg";
import NaverIcon from "@/assets/icon/ic_social_naver.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/lib/api/hooks/use-auth";

const SignInPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 로드 시 저장된 아이디 불러오기
    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      setId(savedId);
      setSaveId(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setError(null);

    try {
      const result = await loginMutation.mutateAsync({
        username: id.trim(),
        password: password.trim(),
      });

      // 로그인 성공 시 아이디 저장
      if (saveId) {
        localStorage.setItem("savedUserId", id);
      } else {
        localStorage.removeItem("savedUserId");
      }

      // AuthContext 업데이트
      login(result.user);

      // 홈으로 이동
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "로그인에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleToggleSaveId = () => {
    setSaveId(!saveId);
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
                onChange={(e) => {
                  setId(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleSaveId}
            className="flex items-center gap-3 cursor-pointer self-start"
          >
            {saveId ? <FilledCheckbox /> : <UnfilledCheckbox />}
            <span className="text-sm text-[#262626]">아이디 저장</span>
          </button>
          {error && <div className="text-sm text-red-500 py-2">{error}</div>}
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              className="cursor-pointer w-full py-[14px] bg-[#133A1B] text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
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
