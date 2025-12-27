"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, type SnsType, snsAuthApi } from "@/lib/api/auth";
import { useLogin } from "@/lib/api/hooks/use-auth";

// zod 스키마 정의 (일반 회원가입용)
const signUpSchema = z
  .object({
    userId: z
      .string()
      .min(1, "아이디를 입력해주세요.")
      .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문과 숫자만 사용할 수 있습니다.")
      .min(8, "아이디는 8자 이상이어야 합니다.")
      .max(20, "아이디는 20자 이하여야 합니다."),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요.")
      .refine(
        (value) => {
          if (value.length < 8 || value.length > 20) return false;
          const hasLetter = /[a-zA-Z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          const typeCount = [hasLetter, hasNumber, hasSpecial].filter(
            Boolean
          ).length;
          return typeCount >= 2;
        },
        {
          message: "비밀번호 조건을 만족하지 않습니다.",
        }
      ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    email: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value || value.trim() === "") return true;
          return z.string().email().safeParse(value).success;
        },
        {
          message: "올바른 이메일 형식을 입력해주세요.",
        }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

// 소셜 회원가입용 스키마 (비밀번호 없음)
const snsSignUpSchema = z.object({
  email: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === "") return true;
        return z.string().email().safeParse(value).success;
      },
      {
        message: "올바른 이메일 형식을 입력해주세요.",
      }
    ),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SnsSignUpFormData = z.infer<typeof snsSignUpSchema>;

const SignUpPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const userIdId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const nameId = useId();
  const phoneId = useId();
  const verificationCodeId = useId();
  const emailId = useId();

  // 소셜 회원가입 모드 확인
  const snsParam = searchParams.get("sns");
  const isSnsSignUp = snsParam === "kakao" || snsParam === "naver";
  const [snsSignupData, setSnsSignupData] = useState<{
    sns_type: SnsType;
    code: string;
    redirect_uri?: string;
    state?: string;
    prepare_token?: string;
    username: string;
    name: string;
    email: string | null;
  } | null>(null);

  // 소셜 회원가입 모드일 때 스키마 선택
  const formSchema = isSnsSignUp ? snsSignUpSchema : signUpSchema;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData | SnsSignUpFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  // 소셜 회원가입 데이터 로드 및 에러 정보 확인
  useEffect(() => {
    if (isSnsSignUp && typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("snsSignupData");
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setSnsSignupData(data);
          // 이름과 이메일 초기화
          if (data.name) {
            setName(data.name);
          }
          if (data.email) {
            // 이메일은 form의 watch로 관리되므로 setValue 사용
            // 하지만 현재 구조상 useState로 관리하는 것이 더 간단
          }
        } catch (error) {
          console.error("소셜 회원가입 데이터 파싱 실패:", error);
          router.replace("/signup");
        }
      } else {
        // 소셜 회원가입 모드인데 데이터가 없으면 일반 회원가입으로 리다이렉트
        router.replace("/signup");
      }

      // 콜백 페이지에서 전달된 필드별 에러 정보 확인
      const fieldErrorsStr = sessionStorage.getItem("snsSignupFieldErrors");
      if (fieldErrorsStr) {
        try {
          const fieldErrors = JSON.parse(fieldErrorsStr) as Record<
            string,
            string[]
          >;

          // 전화번호 에러 처리
          if (fieldErrors.phone) {
            fieldErrors.phone.forEach((msg) => {
              if (
                msg.includes("already exists") ||
                msg.includes("이미 사용") ||
                msg.includes("사용 중")
              ) {
                setPhoneError("이미 사용 중인 전화번호입니다.");
              } else if (msg.includes("인증이 필요")) {
                setPhoneError("전화번호 인증이 필요합니다.");
              } else {
                setPhoneError(`전화번호: ${msg}`);
              }
            });
          }

          // 이메일 에러 처리
          if (fieldErrors.email) {
            fieldErrors.email.forEach((msg) => {
              if (
                msg.includes("already exists") ||
                msg.includes("이미 사용") ||
                msg.includes("사용 중")
              ) {
                setEmailError("이미 사용 중인 이메일입니다.");
              } else {
                setEmailError(`이메일: ${msg}`);
              }
            });
          }

          // 에러 정보 사용 후 삭제
          sessionStorage.removeItem("snsSignupFieldErrors");
        } catch (error) {
          console.error("필드 에러 정보 파싱 실패:", error);
          sessionStorage.removeItem("snsSignupFieldErrors");
        }
      }
    }
  }, [isSnsSignUp, router]);

  const watchedPassword = watch("password") || "";

  // 비밀번호 검증 조건 체크
  const isPasswordLengthValid =
    watchedPassword.length >= 8 && watchedPassword.length <= 20;
  const hasLetter = /[a-zA-Z]/.test(watchedPassword);
  const hasNumber = /[0-9]/.test(watchedPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword);
  const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
  const isPasswordCombinationValid = typeCount >= 2;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [usernameCheckMessage, setUsernameCheckMessage] = useState<
    string | null
  >(null);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const agreeToAll =
    agreements.terms && agreements.privacy && agreements.marketing;

  const handleToggleAllAgreements = () => {
    const allChecked = agreeToAll;
    setAgreements({
      terms: !allChecked,
      privacy: !allChecked,
      marketing: !allChecked,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const watchedUserId = watch("userId") || "";

  const handleCheckUsername = async () => {
    const userId = watchedUserId.trim();

    if (!userId) {
      setUsernameCheckMessage("아이디를 입력해주세요.");
      setIsUsernameAvailable(false);
      setIsUsernameChecked(false);
      return;
    }

    // 아이디 형식 검증
    if (!/^[a-zA-Z0-9]+$/.test(userId)) {
      setUsernameCheckMessage("아이디는 영문과 숫자만 사용할 수 있습니다.");
      setIsUsernameAvailable(false);
      setIsUsernameChecked(false);
      return;
    }

    if (userId.length < 8 || userId.length > 20) {
      setUsernameCheckMessage("아이디는 8자 이상 20자 이하여야 합니다.");
      setIsUsernameAvailable(false);
      setIsUsernameChecked(false);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameCheckMessage(null);
    setIsUsernameChecked(false);

    try {
      const result = await authApi.checkUsername(userId);
      setIsUsernameAvailable(result.available);
      setIsUsernameChecked(true);
      if (result.available) {
        setUsernameCheckMessage("사용 가능한 아이디입니다.");
      } else {
        setUsernameCheckMessage("이미 사용 중인 아이디입니다.");
      }
    } catch (error) {
      setIsUsernameAvailable(false);
      setIsUsernameChecked(true);
      setUsernameCheckMessage(
        error instanceof Error
          ? error.message
          : "아이디 중복 확인에 실패했습니다."
      );
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const extractPhoneNumber = (phoneInput: string): string => {
    // 하이픈, 공백 제거하고 숫자만 추출
    return phoneInput.replace(/[^0-9]/g, "");
  };

  const isValidKoreanPhoneNumber = (phoneNumber: string): boolean => {
    // 한국 휴대폰 번호 형식 검증 (010, 011, 016, 017, 018, 019)
    const koreanMobilePrefixes = ["010", "011", "016", "017", "018", "019"];
    if (phoneNumber.length !== 11) return false;
    const prefix = phoneNumber.substring(0, 3);
    return koreanMobilePrefixes.includes(prefix);
  };

  const handleRequestVerification = async () => {
    const phoneNumber = extractPhoneNumber(phone);

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

  const handleVerifyCode = async () => {
    const phoneNumber = extractPhoneNumber(phone);

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
      const response = await authApi.verifySmsCode({
        phone: phoneNumber,
        code: verificationCode,
      });
      setIsPhoneVerified(true);
      setVerificationError(null);
      setSmsSuccess(response.message || "전화번호 인증이 완료되었습니다.");
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

  const handleSignUp = async (data: SignUpFormData | SnsSignUpFormData) => {
    if (!isFormValid) {
      return;
    }

    const phoneNumber = extractPhoneNumber(phone);

    setIsSigningUp(true);
    setSignUpError(null);

    try {
      if (isSnsSignUp && snsSignupData) {
        // 소셜 회원가입 - 현재 페이지에서 직접 처리
        setPhoneError(null);
        setEmailError(null);
        setSignUpError(null);

        // prepare_token이 있으면 사용하고, 없으면 prepare 호출
        let prepareToken: string;

        if (snsSignupData.prepare_token) {
          // 이미 prepare_token이 있으면 사용
          prepareToken = snsSignupData.prepare_token;
        } else {
          // prepare_token이 없으면 prepare 호출하여 획득
          if (!snsSignupData.code) {
            setSignUpError("인증 정보가 없습니다. 다시 시도해주세요.");
            setIsSigningUp(false);
            return;
          }

          const prepareRequest =
            snsSignupData.sns_type === "KAKAO"
              ? {
                  sns_type: "KAKAO" as SnsType,
                  code: snsSignupData.code,
                  redirect_uri: snsSignupData.redirect_uri || "",
                }
              : {
                  sns_type: "NAVER" as SnsType,
                  code: snsSignupData.code,
                  state: snsSignupData.state || "",
                };

          const prepareResult = await snsAuthApi.prepare(prepareRequest);
          prepareToken = prepareResult.prepare_token;
        }

        // register 호출
        await snsAuthApi.register({
          prepare_token: prepareToken,
          name: name.trim(),
          phone: phoneNumber,
          email:
            (data as SnsSignUpFormData).email?.trim() ||
            snsSignupData.email ||
            undefined,
          marketing_agreed: agreements.marketing === true,
        });

        // 회원가입 성공 시 sessionStorage 정리
        sessionStorage.removeItem("snsSignupData");
        sessionStorage.removeItem("snsSignupFieldErrors");

        // 회원가입 완료 페이지로 이동
        router.push("/signup/complete");
      } else {
        // 일반 회원가입
        // 아이디 중복 확인이 완료되지 않았거나 사용 불가능한 경우
        if (!isUsernameChecked || !isUsernameAvailable) {
          setSignUpError("아이디 중복 확인을 완료해주세요.");
          setIsSigningUp(false);
          return;
        }

        await authApi.register({
          username: (data as SignUpFormData).userId.trim(),
          name: name.trim(),
          email: (data as SignUpFormData).email?.trim() || "",
          phone: phoneNumber,
          password: (data as SignUpFormData).password,
          password_confirm: (data as SignUpFormData).confirmPassword,
          marketing_agreed: agreements.marketing === true,
        });

        // 회원가입 성공 시 자동 로그인
        try {
          const loginResult = await loginMutation.mutateAsync({
            username: (data as SignUpFormData).userId.trim(),
            password: (data as SignUpFormData).password,
          });

          // AuthContext 업데이트
          login(loginResult.user);

          // 회원가입 완료 페이지로 리다이렉트
          router.push("/signup/complete");
        } catch {
          // 자동 로그인 실패 시 로그인 페이지로 리다이렉트
          router.push(
            "/signin?message=회원가입이 완료되었습니다. 로그인해주세요."
          );
        }
      }
    } catch (error) {
      const fieldErrorsData = (
        error as Error & { fieldErrors?: Record<string, string[]> }
      ).fieldErrors;

      if (fieldErrorsData) {
        // 필드별 에러 메시지를 한글로 변환
        const errorMessages: string[] = [];
        let phoneErrorMessage: string | null = null;
        let emailErrorMessage: string | null = null;

        if (fieldErrorsData.username) {
          fieldErrorsData.username.forEach((msg) => {
            if (msg.includes("already exists")) {
              errorMessages.push("이미 사용 중인 아이디입니다.");
            } else {
              errorMessages.push(`아이디: ${msg}`);
            }
          });
        }
        if (fieldErrorsData.email) {
          fieldErrorsData.email.forEach((msg) => {
            if (
              msg.includes("already exists") ||
              msg.includes("이미 사용") ||
              msg.includes("사용 중")
            ) {
              emailErrorMessage = "이미 사용 중인 이메일입니다.";
            } else {
              emailErrorMessage = `이메일: ${msg}`;
            }
          });
        }
        if (fieldErrorsData.phone) {
          fieldErrorsData.phone.forEach((msg) => {
            if (msg.includes("인증이 필요")) {
              phoneErrorMessage = "전화번호 인증이 필요합니다.";
            } else if (
              msg.includes("already exists") ||
              msg.includes("이미 사용") ||
              msg.includes("사용 중")
            ) {
              phoneErrorMessage = "이미 사용 중인 전화번호입니다.";
            } else {
              phoneErrorMessage = `전화번호: ${msg}`;
            }
          });
        }
        if (fieldErrorsData.password) {
          fieldErrorsData.password.forEach((msg) => {
            errorMessages.push(`비밀번호: ${msg}`);
          });
        }
        if (fieldErrorsData.password_confirm) {
          fieldErrorsData.password_confirm.forEach((msg) => {
            errorMessages.push(`비밀번호 확인: ${msg}`);
          });
        }
        if (fieldErrorsData.name) {
          fieldErrorsData.name.forEach((msg) => {
            errorMessages.push(`이름: ${msg}`);
          });
        }

        // 전화번호와 이메일 에러는 별도 state로 관리
        setPhoneError(phoneErrorMessage);
        setEmailError(emailErrorMessage);

        // 전화번호와 이메일 에러를 제외한 나머지 에러만 회원가입 버튼 위에 표시
        setSignUpError(
          errorMessages.length > 0 ? errorMessages.join("\n") : null
        );
      } else {
        setSignUpError(
          error instanceof Error
            ? error.message
            : "회원가입에 실패했습니다. 다시 시도해주세요."
        );
        setPhoneError(null);
        setEmailError(null);
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const isFormValid = isSnsSignUp
    ? // 소셜 회원가입: 이름, 전화번호 인증, 약관 동의만 필요
      isValid &&
      name.trim() &&
      phone.trim() &&
      isPhoneVerified &&
      agreements.terms &&
      agreements.privacy
    : // 일반 회원가입: 기존 조건
      isValid &&
      name.trim() &&
      phone.trim() &&
      isPhoneVerified &&
      isUsernameChecked &&
      isUsernameAvailable &&
      agreements.terms &&
      agreements.privacy;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">
            {isSnsSignUp ? "소셜 회원가입" : "회원가입"}
          </h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 폼 영역 */}
      <div className="px-5 py-4">
        <div className="flex flex-col gap-5">
          {/* 아이디 - 소셜 회원가입 모드에서는 숨김 */}
          {!isSnsSignUp && (
            <div className="flex flex-col gap-[10px]">
              <label
                htmlFor={userIdId}
                className="text-sm font-medium text-[#595959]"
              >
                아이디
              </label>
              <div className="flex gap-2">
                <div className="flex-1 border border-[#D9D9D9] p-3">
                  <input
                    type="text"
                    placeholder="영문/숫자 조합의 8자~20자"
                    id={userIdId}
                    {...register("userId", {
                      onChange: () => {
                        // 아이디가 변경되면 중복 확인 상태 초기화
                        setIsUsernameChecked(false);
                        setIsUsernameAvailable(null);
                        setUsernameCheckMessage(null);
                      },
                    })}
                    className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={
                    isCheckingUsername ||
                    !watchedUserId.trim() ||
                    watchedUserId.trim().length < 8 ||
                    watchedUserId.trim().length > 20 ||
                    !/^[a-zA-Z0-9]+$/.test(watchedUserId.trim())
                  }
                  className="px-4 py-3 bg-[#133A1B] text-white text-sm font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCheckingUsername ? "확인 중..." : "중복 확인"}
                </button>
              </div>
              {usernameCheckMessage && (
                <div
                  className={`text-sm ${
                    isUsernameAvailable ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {usernameCheckMessage}
                </div>
              )}
              {!isSnsSignUp && "userId" in errors && errors.userId && (
                <div className="text-sm text-red-500">
                  {errors.userId.message}
                </div>
              )}
            </div>
          )}

          {/* 비밀번호 - 소셜 회원가입 모드에서는 숨김 */}
          {!isSnsSignUp && (
            <div className="flex flex-col gap-[10px]">
              <label
                htmlFor={passwordId}
                className="text-sm font-medium text-[#595959]"
              >
                비밀번호
              </label>
              <div className="w-full border border-[#D9D9D9] p-3">
                <input
                  type="password"
                  placeholder="영문/숫자/특수기호 조합중 2가지 이상을 활용하여 8자~20자 이하"
                  id={passwordId}
                  {...register("password")}
                  className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                />
              </div>
              {watchedPassword && (
                <div className="flex flex-col gap-1">
                  {!isPasswordCombinationValid && (
                    <div className="text-sm text-red-500">
                      영문/숫자/특수기호 조합중 2가지 이상 활용
                    </div>
                  )}
                  {!isPasswordLengthValid && (
                    <div className="text-sm text-red-500">8자~20자 이하</div>
                  )}
                </div>
              )}
              {!isSnsSignUp &&
                "password" in errors &&
                errors.password &&
                watchedPassword === "" && (
                  <div className="text-sm text-red-500">
                    {errors.password.message}
                  </div>
                )}
            </div>
          )}

          {/* 비밀번호 확인 - 소셜 회원가입 모드에서는 숨김 */}
          {!isSnsSignUp && (
            <div className="flex flex-col gap-[10px]">
              <div className="w-full border border-[#D9D9D9] p-3">
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  id={confirmPasswordId}
                  {...register("confirmPassword")}
                  className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                />
              </div>
              {!isSnsSignUp &&
                "confirmPassword" in errors &&
                errors.confirmPassword && (
                  <div className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </div>
                )}
            </div>
          )}

          {/* 이름 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={nameId}
              className="text-sm font-medium text-[#595959]"
            >
              이름
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <input
                type="text"
                placeholder="이름 입력"
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
              />
            </div>
          </div>

          {/* 휴대전화 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={phoneId}
              className="text-sm font-medium text-[#595959]"
            >
              휴대전화
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-[#D9D9D9] p-3">
                <input
                  type="text"
                  placeholder="- 제외하고 번호 입력"
                  id={phoneId}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setSmsError(null);
                    setSmsSuccess(null);
                    setIsPhoneVerified(false);
                    setVerificationCode("");
                    setVerificationError(null);
                    setPhoneError(null);
                  }}
                  className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                />
              </div>
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={!phone.trim() || isSendingSms || isPhoneVerified}
                className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPhoneVerified
                    ? "bg-[#949494] border border-[#949494] text-white"
                    : "text-[#133A1B] border border-[#133A1B]"
                }`}
              >
                {isSendingSms
                  ? "발송 중..."
                  : isPhoneVerified
                  ? "인증 완료"
                  : "인증 요청"}
              </button>
            </div>
            {smsError && <div className="text-sm text-red-500">{smsError}</div>}
            {smsSuccess && (
              <div className="text-sm text-[#133A1B]">{smsSuccess}</div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-[#D9D9D9] p-3">
                <input
                  type="text"
                  placeholder="인증번호 입력"
                  id={verificationCodeId}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 6);
                    setVerificationCode(value);
                    setVerificationError(null);
                  }}
                  disabled={isPhoneVerified}
                  className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={
                  verificationCode.length !== 6 ||
                  isVerifyingCode ||
                  isPhoneVerified
                }
                className="px-4 py-3.5 text-sm font-medium text-[#133A1B] border border-[#133A1B] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingCode ? "확인 중..." : "확인"}
              </button>
            </div>
            {verificationError && (
              <div className="text-sm text-red-500">{verificationError}</div>
            )}
            {phoneError && (
              <div className="text-sm text-red-500">{phoneError}</div>
            )}
          </div>

          {/* 이메일 */}
          <div className="flex flex-col gap-[10px]">
            <label
              htmlFor={emailId}
              className="text-sm font-medium text-[#595959]"
            >
              이메일 (선택)
            </label>
            <div className="w-full border border-[#D9D9D9] p-3">
              <input
                type="email"
                placeholder="이메일 주소 입력"
                id={emailId}
                defaultValue={
                  isSnsSignUp && snsSignupData?.email ? snsSignupData.email : ""
                }
                {...register("email", {
                  onChange: () => {
                    // 이메일이 변경되면 에러 초기화
                    setEmailError(null);
                  },
                })}
                className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
              />
            </div>
            {errors.email && (
              <div className="text-sm text-red-500">{errors.email.message}</div>
            )}
            {emailError && (
              <div className="text-sm text-red-500">{emailError}</div>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="flex flex-col gap-[10px]">
            <div className="text-sm font-medium text-[#595959]">약관 동의</div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleToggleAllAgreements}
                className="flex items-center gap-3 cursor-pointer"
                aria-label="이용약관 전체동의"
                tabIndex={0}
              >
                {agreeToAll ? <FilledCheckbox /> : <UnfilledCheckbox />}
                <span className="text-sm text-[#262626]">
                  이용약관 전체동의
                </span>
              </button>
              <div className="w-full h-px bg-[#D9D9D9]" />
              <button
                type="button"
                onClick={() => handleAgreementChange("terms")}
                className="flex items-center gap-3 cursor-pointer"
              >
                {agreements.terms ? <FilledCheckbox /> : <UnfilledCheckbox />}
                <span className="text-sm text-[#262626]">
                  이용약관 동의 (필수)
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleAgreementChange("privacy")}
                className="flex items-center gap-3 cursor-pointer"
              >
                {agreements.privacy ? <FilledCheckbox /> : <UnfilledCheckbox />}
                <span className="text-sm text-[#262626]">
                  개인정보 처리 방침 동의 (필수)
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleAgreementChange("marketing")}
                className="flex items-center gap-3 cursor-pointer"
              >
                {agreements.marketing ? (
                  <FilledCheckbox />
                ) : (
                  <UnfilledCheckbox />
                )}
                <span className="text-sm text-[#262626]">
                  마케팅 수신 동의 (선택)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회원가입 버튼 */}
      <div className="mt-auto px-5 pb-8">
        {signUpError && (
          <div className="text-sm text-red-500 mb-3">
            {signUpError.split("\n").map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit(handleSignUp)}
          disabled={!isFormValid || isSigningUp}
          className={`cursor-pointer w-full py-[14px] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
            isFormValid
              ? "bg-[#133A1B] text-white"
              : "bg-[#D9D9D9] text-[#262626]"
          }`}
        >
          {isSigningUp ? "회원가입 중..." : "회원가입"}
        </button>
      </div>
    </div>
  );
};

const SignUpPage = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
};

export default SignUpPage;
