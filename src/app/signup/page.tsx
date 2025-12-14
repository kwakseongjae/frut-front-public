"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FilledCheckbox from "@/assets/icon/ic_checkbox_green_18.svg";
import UnfilledCheckbox from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api/auth";
import { useLogin } from "@/lib/api/hooks/use-auth";

// zod 스키마 정의
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
						Boolean,
					).length;
					return typeCount >= 2;
				},
				{
					message: "비밀번호 조건을 만족하지 않습니다.",
				},
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
				},
			),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "비밀번호가 일치하지 않습니다.",
		path: ["confirmPassword"],
	});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
	const router = useRouter();
	const { login } = useAuth();
	const loginMutation = useLogin();
	const userIdId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();
	const nameId = useId();
	const phoneId = useId();
	const verificationCodeId = useId();
	const emailId = useId();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid },
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		mode: "onChange",
	});

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
		null,
	);
	const [isPhoneVerified, setIsPhoneVerified] = useState(false);
	const [isSigningUp, setIsSigningUp] = useState(false);
	const [signUpError, setSignUpError] = useState<string | null>(null);
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
				"올바른 한국 휴대폰 번호를 입력해주세요. (010, 011, 016, 017, 018, 019)",
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
					: "인증번호 발송에 실패했습니다. 다시 시도해주세요.",
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
					: "인증번호 확인에 실패했습니다. 다시 시도해주세요.",
			);
			setIsPhoneVerified(false);
		} finally {
			setIsVerifyingCode(false);
		}
	};

	const handleSignUp = async (data: SignUpFormData) => {
		if (!isFormValid) {
			return;
		}

		const phoneNumber = extractPhoneNumber(phone);

		setIsSigningUp(true);
		setSignUpError(null);

		try {
			await authApi.register({
				username: data.userId.trim(),
				name: name.trim(),
				email: data.email?.trim() || "",
				phone: phoneNumber,
				password: data.password,
				password_confirm: data.confirmPassword,
				marketing_agreed: agreements.marketing === true,
			});

			// 회원가입 성공 시 자동 로그인
			try {
				const loginResult = await loginMutation.mutateAsync({
					username: data.userId.trim(),
					password: data.password,
				});

				// AuthContext 업데이트
				login(loginResult.user);

				// 회원가입 완료 페이지로 리다이렉트
				router.push("/signup/complete");
			} catch {
				// 자동 로그인 실패 시 로그인 페이지로 리다이렉트
				router.push(
					"/signin?message=회원가입이 완료되었습니다. 로그인해주세요.",
				);
			}
		} catch (error) {
			const fieldErrorsData = (
				error as Error & { fieldErrors?: Record<string, string[]> }
			).fieldErrors;

			if (fieldErrorsData) {
				// 필드별 에러 메시지를 한글로 변환
				const errorMessages: string[] = [];
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
						if (msg.includes("already exists")) {
							errorMessages.push("이미 사용 중인 이메일입니다.");
						} else {
							errorMessages.push(`이메일: ${msg}`);
						}
					});
				}
				if (fieldErrorsData.phone) {
					fieldErrorsData.phone.forEach((msg) => {
						if (msg.includes("인증이 필요")) {
							errorMessages.push("전화번호 인증이 필요합니다.");
						} else {
							errorMessages.push(`전화번호: ${msg}`);
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
				setSignUpError(errorMessages.join("\n"));
			} else {
				setSignUpError(
					error instanceof Error
						? error.message
						: "회원가입에 실패했습니다. 다시 시도해주세요.",
				);
			}
		} finally {
			setIsSigningUp(false);
		}
	};

	const isFormValid =
		isValid &&
		name.trim() &&
		phone.trim() &&
		isPhoneVerified &&
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
					<h1 className="text-lg font-semibold text-[#262626]">회원가입</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 폼 영역 */}
			<div className="px-5 py-4">
				<div className="flex flex-col gap-5">
					{/* 아이디 */}
					<div className="flex flex-col gap-[10px]">
						<label
							htmlFor={userIdId}
							className="text-sm font-medium text-[#595959]"
						>
							아이디
						</label>
						<div className="w-full border border-[#D9D9D9] p-3">
							<input
								type="text"
								placeholder="영문/숫자 조합의 8자~20자"
								id={userIdId}
								{...register("userId")}
								className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
							/>
						</div>
						{errors.userId && (
							<div className="text-sm text-red-500">
								{errors.userId.message}
							</div>
						)}
					</div>

					{/* 비밀번호 */}
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
								placeholder="비밀번호 입력"
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
						{errors.password && watchedPassword === "" && (
							<div className="text-sm text-red-500">
								{errors.password.message}
							</div>
						)}
					</div>

					{/* 비밀번호 확인 */}
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
						{errors.confirmPassword && (
							<div className="text-sm text-red-500">
								{errors.confirmPassword.message}
							</div>
						)}
					</div>

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
								{...register("email")}
								className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
							/>
						</div>
						{errors.email && (
							<div className="text-sm text-red-500">{errors.email.message}</div>
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

export default SignUpPage;
