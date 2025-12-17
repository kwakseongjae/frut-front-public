"use client";

import { useRouter } from "next/navigation";

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
          {/* 성공 메시지 */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-lg font-semibold text-[#262626]">
              취소 요청이 정상적으로 접수되었습니다.
            </h1>
            <p className="text-sm text-[#8C8C8C] leading-relaxed">
              판매자가 요청 내용을 확인 후 처리할 예정입니다.
              <br />
              처리 결과는 알림으로 안내드리겠습니다.
            </p>
          </div>

          {/* 홈으로 버튼 */}
          <button
            type="button"
            onClick={handleHomeClick}
            className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
            aria-label="홈으로"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelCompletePage;
