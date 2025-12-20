"use client";

import { useRouter } from "next/navigation";
import CheckIcon from "@/assets/icon/ic_circle_green_check_white_60.svg";

const CancelCompletePage = () => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-20">
        <div className="flex flex-col items-center gap-6 max-w-md">
          {/* 성공 아이콘 */}
          <div className="relative">
            <CheckIcon
              className="w-[60px] h-[60px]"
              aria-label="취소 요청 완료"
            />
          </div>

          {/* 성공 메시지 */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-[22px] font-medium text-[#262626]">
              취소 요청이 정상적으로 접수되었습니다.
            </h1>
            <p className="text-sm font-normal text-[#262626] leading-relaxed">
              판매자가 요청 내용을 확인 후 처리할 예정입니다.
              <br />
              처리 결과는 알림으로 안내드리겠습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
        <button
          type="button"
          onClick={handleHomeClick}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm cursor-pointer"
          aria-label="홈으로"
        >
          홈으로
        </button>
      </div>
    </div>
  );
};

export default CancelCompletePage;
