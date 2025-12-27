"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type SnsType, snsAuthApi } from "@/lib/api/auth";

const KakaoCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // 이미 처리 중이거나 완료된 경우 중복 실행 방지
    if (isProcessingRef.current) {
      return;
    }

    const handleCallback = async () => {
      isProcessingRef.current = true;
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("카카오 로그인이 취소되었습니다.");
        setTimeout(() => {
          router.replace("/signin");
        }, 2000);
        return;
      }

      if (!code) {
        setError("인증 코드를 받지 못했습니다.");
        setTimeout(() => {
          router.replace("/signin");
        }, 2000);
        return;
      }

      // 저장된 state와 비교 (CSRF 방지)
      const savedState = sessionStorage.getItem("kakao_state");
      if (state && savedState !== state) {
        setError("인증 정보가 일치하지 않습니다.");
        setTimeout(() => {
          router.replace("/signin");
        }, 2000);
        return;
      }

      try {
        const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || "";

        // 회원가입 모드 확인
        const isSignupMode =
          sessionStorage.getItem("kakao_signup_mode") === "true";

        if (isSignupMode) {
          // 회원가입 모드: prepare 호출 후 prepare_token을 사용하여 register API 호출
          const signupFormDataStr = sessionStorage.getItem("snsSignupFormData");
          if (!signupFormDataStr) {
            setError("회원가입 정보를 찾을 수 없습니다.");
            setTimeout(() => {
              router.replace("/signup");
            }, 2000);
            return;
          }

          try {
            // prepare 호출하여 prepare_token 획득
            const prepareResult = await snsAuthApi.prepare({
              sns_type: "KAKAO",
              code,
              redirect_uri: redirectUri,
            });

            const signupFormData = JSON.parse(signupFormDataStr);

            await snsAuthApi.register({
              prepare_token: prepareResult.prepare_token,
              name: signupFormData.name,
              phone: signupFormData.phone,
              email: signupFormData.email,
              marketing_agreed: signupFormData.marketing_agreed,
            });

            // 회원가입 성공 시 sessionStorage 정리
            sessionStorage.removeItem("snsSignupFormData");
            sessionStorage.removeItem("kakao_signup_mode");
            sessionStorage.removeItem("kakao_state");

            // 회원가입 완료 페이지로 이동
            router.replace("/signup/complete");
          } catch (registerError) {
            console.error("카카오 회원가입 실패:", registerError);
            let errorMessage = "회원가입에 실패했습니다.";

            // API 에러 응답 처리
            const fieldErrors = (
              registerError as Error & {
                fieldErrors?: Record<string, string[]>;
              }
            ).fieldErrors;

            if (fieldErrors?.code) {
              // code 관련 에러인 경우 (유효하지 않은 인증 코드)
              errorMessage =
                "인증 코드가 만료되었거나 유효하지 않습니다. 다시 시도해주세요.";
            } else if (registerError instanceof Error) {
              errorMessage = registerError.message;
            }

            setError(errorMessage);

            // 에러 발생 시 sessionStorage 정리
            sessionStorage.removeItem("snsSignupFormData");
            sessionStorage.removeItem("kakao_signup_mode");
            sessionStorage.removeItem("kakao_state");

            setTimeout(() => {
              router.replace("/signup");
            }, 3000);
          }
          return;
        }

        // 일반 로그인 모드: SNS 정보 확인
        const prepareResult = await snsAuthApi.prepare({
          sns_type: "KAKAO",
          code,
          redirect_uri: redirectUri,
        });

        if (prepareResult.is_existing_user) {
          // 기존 회원 - 로그인
          // Rate limiting 방지를 위해 prepare와 login 사이에 최소 1초 딜레이 추가
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const loginResult = await snsAuthApi.login({
            sns_type: "KAKAO",
            code,
            redirect_uri: redirectUri,
            prepare_token: prepareResult.prepare_token,
          });

          // 토큰 저장
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", loginResult.tokens.access);
            localStorage.setItem("refreshToken", loginResult.tokens.refresh);
          }

          // AuthContext 업데이트
          login(loginResult.user);

          // 홈으로 리다이렉트
          router.replace("/");
        } else {
          // 신규 회원 - 회원가입 페이지로 이동 (소셜 회원가입 모드)
          sessionStorage.setItem(
            "snsSignupData",
            JSON.stringify({
              sns_type: "KAKAO" as SnsType,
              code,
              redirect_uri: redirectUri,
              username: prepareResult.username,
              name: prepareResult.name,
              email: prepareResult.email,
            })
          );
          router.replace("/signup?sns=kakao");
        }
      } catch (err) {
        console.error("카카오 로그인 실패:", err);
        console.error("에러 상세:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          code,
          state,
        });

        let errorMessage = "카카오 로그인에 실패했습니다.";
        if (err instanceof Error) {
          if (
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError")
          ) {
            errorMessage =
              "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        setTimeout(() => {
          router.replace("/signin");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <p className="text-sm text-[#8C8C8C]">로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5">
      <p className="text-sm text-[#8C8C8C]">카카오 로그인 처리 중...</p>
    </div>
  );
};

const KakaoCallbackPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen px-5">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
};

export default KakaoCallbackPage;
