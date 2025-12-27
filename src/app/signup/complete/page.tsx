"use client";

import { useRouter } from "next/navigation";
import CheckIcon from "@/assets/icon/ic_circle_green_check_white_60.svg";

export default function SignUpCompletePage() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push("/signin");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-center py-3 px-5">
        <h1 className="text-lg font-semibold text-[#262626]">회원가입 완료</h1>
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        {/* 성공 아이콘 */}
        <div className="relative mb-8">
          <CheckIcon className="w-[60px] h-[60px]" aria-label="회원가입 완료" />
        </div>

        {/* 완료 메시지 */}
        <div className="text-center mb-12">
          <h2 className="text-[22px] font-medium text-[#262626] mb-2">
            회원가입이 완료되었습니다
          </h2>
          <p className="text-sm font-normal text-[#262626]">
            환영합니다! 이제 서비스를 이용하실 수 있습니다
          </p>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white px-5 py-3">
        <button
          type="button"
          onClick={handleGoToLogin}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm cursor-pointer"
          aria-label="로그인 페이지로 이동"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );
}
