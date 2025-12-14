"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import { authApi } from "@/lib/api/auth";

const FindAccountPageContent = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState<"id" | "password">("id");
	const phoneId = useId();
	const verificationId = useId();

	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab === "password") {
			setActiveTab("password");
			setPasswordStep("username");
		} else {
			setActiveTab("id");
		}
	}, [searchParams]);

	// 탭 변경 시 비밀번호 찾기 상태 초기화
	useEffect(() => {
		if (activeTab === "password") {
			setPasswordStep("username");
			setUsername("");
			setPhone("");
			setVerificationCode("");
			setResetToken(null);
			setNewPassword("");
			setNewPasswordConfirm("");
			setIsPhoneVerified(false);
			setSmsError(null);
			setSmsSuccess(null);
			setVerificationError(null);
			setPasswordResetError(null);
		} else {
			setPasswordStep("username");
		}
	}, [activeTab]);

	const [phone, setPhone] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [isSendingSms, setIsSendingSms] = useState(false);
	const [isVerifyingCode, setIsVerifyingCode] = useState(false);
	const [isFindingAccount, setIsFindingAccount] = useState(false);
	const [isPhoneVerified, setIsPhoneVerified] = useState(false);
	const [smsError, setSmsError] = useState<string | null>(null);
	const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
	const [verificationError, setVerificationError] = useState<string | null>(
		null,
	);
	const [findError, setFindError] = useState<string | null>(null);
	const [foundUsername, setFoundUsername] = useState<string | null>(null);

	// 비밀번호 찾기 관련 상태
	const [passwordStep, setPasswordStep] = useState<
		"username" | "phone" | "newPassword" | "complete"
	>("username");
	const [username, setUsername] = useState("");
	const [resetToken, setResetToken] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
	const [isVerifyingPasswordReset, setIsVerifyingPasswordReset] =
		useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [passwordResetError, setPasswordResetError] = useState<string | null>(
		null,
	);
	const passwordInputId = useId();
	const passwordConfirmId = useId();
	const usernameInputId = useId();

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

	// 인증번호 요청
	const handleVerificationRequest = async () => {
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
					: "인증번호 발송에 실패했습니다. 다시 시도해주세요.",
			);
			setSmsSuccess(null);
		} finally {
			setIsSendingSms(false);
		}
	};

	// 인증번호 검증
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

			// 아이디 찾기 탭이면 자동으로 아이디 찾기 실행
			if (activeTab === "id") {
				await handleFindUsername();
			} else if (activeTab === "password") {
				// 비밀번호 찾기 탭이면 본인 확인 API 호출
				await handleVerifyPasswordReset();
			}
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

	// 아이디 찾기
	const handleFindUsername = async () => {
		if (!isPhoneVerified) {
			setFindError("전화번호 인증을 완료해주세요.");
			return;
		}

		const phoneNumber = extractPhoneNumber(phone);

		setIsFindingAccount(true);
		setFindError(null);
		setFoundUsername(null);

		try {
			const result = await authApi.findUsername(phoneNumber);
			setFoundUsername(result.username);
			setFindError(null);
		} catch (error) {
			setFindError(
				error instanceof Error
					? error.message
					: "아이디 찾기에 실패했습니다. 다시 시도해주세요.",
			);
			setFoundUsername(null);
		} finally {
			setIsFindingAccount(false);
		}
	};

	// 비밀번호 찾기 - 아이디 입력 후 다음 단계로
	const handlePasswordFindNext = () => {
		if (!username.trim()) {
			setPasswordResetError("아이디를 입력해주세요.");
			return;
		}
		setPasswordStep("phone");
		setPasswordResetError(null);
	};

	// 비밀번호 재설정 본인 확인
	const handleVerifyPasswordReset = async () => {
		const phoneNumber = extractPhoneNumber(phone);

		if (!phoneNumber) {
			setPasswordResetError("전화번호를 입력해주세요.");
			return;
		}

		setIsVerifyingPasswordReset(true);
		setPasswordResetError(null);

		try {
			const result = await authApi.verifyPasswordReset(username, phoneNumber);
			setResetToken(result.reset_token);
			setPasswordStep("newPassword");
			setPasswordResetError(null);
		} catch (error) {
			setPasswordResetError(
				error instanceof Error
					? error.message
					: "본인 확인에 실패했습니다. 다시 시도해주세요.",
			);
		} finally {
			setIsVerifyingPasswordReset(false);
		}
	};

	// 비밀번호 변경
	const handleResetPassword = async () => {
		if (!resetToken) {
			setPasswordResetError("재설정 토큰이 없습니다.");
			return;
		}

		if (!newPassword.trim() || !newPasswordConfirm.trim()) {
			setPasswordResetError("비밀번호를 입력해주세요.");
			return;
		}

		// 비밀번호 조건 검증
		if (newPassword.length < 8 || newPassword.length > 20) {
			setPasswordResetError("비밀번호는 8자 이상 20자 이하여야 합니다.");
			return;
		}

		const hasLetter = /[a-zA-Z]/.test(newPassword);
		const hasNumber = /[0-9]/.test(newPassword);
		const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
		const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

		if (typeCount < 2) {
			setPasswordResetError(
				"비밀번호는 영문, 숫자, 특수기호 중 2가지 이상을 조합해야 합니다.",
			);
			return;
		}

		if (newPassword !== newPasswordConfirm) {
			setPasswordResetError("비밀번호가 일치하지 않습니다.");
			return;
		}

		setIsResettingPassword(true);
		setPasswordResetError(null);

		try {
			await authApi.resetPassword(resetToken, newPassword, newPasswordConfirm);
			setPasswordStep("complete");
			setPasswordResetError(null);
		} catch (error) {
			setPasswordResetError(
				error instanceof Error
					? error.message
					: "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
			);
		} finally {
			setIsResettingPassword(false);
		}
	};

	// 확인 버튼 핸들러
	const handleConfirm = async () => {
		if (activeTab === "id") {
			if (!isPhoneVerified) {
				// 인증이 안 되어 있으면 인증번호 검증 시도 (성공 시 자동으로 아이디 찾기 실행)
				await handleVerifyCode();
			}
		} else {
			// 비밀번호 찾기
			if (passwordStep === "username") {
				handlePasswordFindNext();
			} else if (passwordStep === "phone") {
				if (!isPhoneVerified) {
					// 인증이 안 되어 있으면 인증번호 검증 시도 (성공 시 자동으로 본인 확인 실행)
					await handleVerifyCode();
				}
			}
		}
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
						아이디 / 비밀번호 찾기
					</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 탭 네비게이션 */}
			<div className="sticky top-[52px] z-10 bg-white border-b-2 border-[#E5E5E5]">
				<div className="flex">
					<button
						type="button"
						onClick={() => setActiveTab("id")}
						className={`flex-1 py-4 text-sm font-medium relative ${
							activeTab === "id" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
						aria-label="아이디 찾기"
					>
						아이디 찾기
						{activeTab === "id" && (
							<div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("password")}
						className={`flex-1 py-4 text-sm font-medium relative ${
							activeTab === "password" ? "text-[#133A1B]" : "text-[#8C8C8C]"
						}`}
						aria-label="비밀번호 찾기"
					>
						비밀번호 찾기
						{activeTab === "password" && (
							<div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
						)}
					</button>
				</div>
			</div>

			{/* 콘텐츠 영역 */}
			<div className="flex-1 px-5 py-4">
				{activeTab === "id" && foundUsername ? (
					/* 아이디 찾기 결과 화면 */
					<div className="flex flex-col">
						{/* 결과 메시지 */}
						<h2 className="text-base font-semibold text-[#262626] mb-6">
							입력하신 정보와 일치하는 아이디입니다
						</h2>

						{/* 아이디 표시 박스 */}
						<div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg p-4 mb-8">
							<div className="flex flex-col gap-1">
								<p className="text-sm font-semibold text-[#262626]">아이디</p>
								<p className="text-base text-[#8C8C8C]">{foundUsername}</p>
							</div>
						</div>

						{/* 하단 버튼 */}
						<div className="flex gap-3 mt-auto">
							<button
								type="button"
								onClick={() => {
									setActiveTab("password");
									setFoundUsername(null);
									setIsPhoneVerified(false);
									setPhone("");
									setVerificationCode("");
									setSmsError(null);
									setSmsSuccess(null);
									setVerificationError(null);
									setFindError(null);
								}}
								className="flex-1 py-[14px] text-sm font-semibold text-[#262626] border border-[#D9D9D9] bg-white rounded-lg"
							>
								비밀번호 찾기
							</button>
							<button
								type="button"
								onClick={() => router.push("/signin")}
								className="flex-1 py-[14px] text-sm font-semibold text-white bg-[#133A1B] rounded-lg"
							>
								로그인
							</button>
						</div>
					</div>
				) : activeTab === "password" && passwordStep === "complete" ? (
					/* 비밀번호 변경 완료 화면 */
					<div className="flex flex-col items-center justify-center min-h-[60vh]">
						{/* 성공 아이콘 */}
						<div className="relative mb-8">
							<div className="w-24 h-24 rounded-full bg-[#8BC53F] flex items-center justify-center">
								<svg
									width="48"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-white"
									role="img"
									aria-label="비밀번호 변경 완료"
								>
									<title>비밀번호 변경 완료</title>
									<path
										d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
										fill="currentColor"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>

						{/* 완료 메시지 */}
						<div className="text-center mb-12">
							<h2 className="text-2xl font-bold text-[#262626] mb-2">
								비밀번호가 변경되었습니다
							</h2>
							<p className="text-base text-[#8C8C8C]">
								새로운 비밀번호로 로그인해주세요
							</p>
						</div>

						{/* 로그인 버튼 */}
						<button
							type="button"
							onClick={() => router.push("/signin")}
							className="w-full max-w-md py-[14px] bg-[#133A1B] text-sm font-semibold text-white rounded-lg"
						>
							로그인
						</button>
					</div>
				) : activeTab === "password" && passwordStep === "newPassword" ? (
					/* 새 비밀번호 입력 화면 */
					<div className="flex flex-col gap-5">
						<h2 className="text-base font-semibold text-[#262626] mb-2">
							새로운 비밀번호를 입력해 주세요
						</h2>

						{/* 비밀번호 입력 */}
						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={passwordInputId}
								className="text-sm font-medium text-[#595959]"
							>
								비밀번호
							</label>
							<div className="border border-[#D9D9D9] p-3">
								<input
									type="password"
									placeholder="영문/숫자/특수기호 조합중 2가지 이상을 활용하여 8자~20자 이하"
									id={passwordInputId}
									value={newPassword}
									onChange={(e) => {
										setNewPassword(e.target.value);
										setPasswordResetError(null);
									}}
									className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
								/>
							</div>
						</div>

						{/* 비밀번호 확인 입력 */}
						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={passwordConfirmId}
								className="text-sm font-medium text-[#595959]"
							>
								비밀번호 확인
							</label>
							<div className="border border-[#D9D9D9] p-3">
								<input
									type="password"
									placeholder="비밀번호 확인"
									id={passwordConfirmId}
									value={newPasswordConfirm}
									onChange={(e) => {
										setNewPasswordConfirm(e.target.value);
										setPasswordResetError(null);
									}}
									className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
								/>
							</div>
						</div>

						{/* 에러 메시지 */}
						{passwordResetError && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-500">{passwordResetError}</p>
							</div>
						)}

						{/* 비밀번호 변경하기 버튼 */}
						<button
							type="button"
							onClick={handleResetPassword}
							disabled={
								!newPassword.trim() ||
								!newPasswordConfirm.trim() ||
								isResettingPassword
							}
							className="w-full py-[14px] bg-[#133A1B] text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
						>
							{isResettingPassword ? "변경 중..." : "비밀번호 변경하기"}
						</button>
					</div>
				) : activeTab === "password" && passwordStep === "username" ? (
					/* 비밀번호 찾기 - 아이디 입력 화면 */
					<div className="flex flex-col gap-5">
						<p className="text-sm text-[#262626] mb-2">
							비밀번호를 찾고자 하는 아이디를 입력해주세요
						</p>

						{/* 아이디 입력 */}
						<div className="flex flex-col gap-[10px]">
							<div className="border border-[#D9D9D9] p-3">
								<input
									type="text"
									placeholder="아이디를 입력해주세요"
									id={usernameInputId}
									value={username}
									onChange={(e) => {
										setUsername(e.target.value);
										setPasswordResetError(null);
									}}
									className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
								/>
							</div>
						</div>

						{/* 에러 메시지 */}
						{passwordResetError && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-500">{passwordResetError}</p>
							</div>
						)}

						{/* 비밀번호 찾기 버튼 */}
						<button
							type="button"
							onClick={handlePasswordFindNext}
							disabled={!username.trim()}
							className="w-full py-[14px] bg-[#133A1B] text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
						>
							비밀번호 찾기
						</button>
					</div>
				) : activeTab === "password" && passwordStep === "phone" ? (
					/* 비밀번호 찾기 - 휴대폰 인증 화면 */
					<div className="flex flex-col gap-5">
						{/* 휴대폰 입력 섹션 */}
						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={phoneId}
								className="text-sm font-medium text-[#595959]"
							>
								휴대폰
							</label>
							<div className="flex gap-2">
								<div className="flex-1 border border-[#D9D9D9] p-3">
									<input
										type="tel"
										placeholder="- 제외하고 번호 입력"
										id={phoneId}
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
									/>
								</div>
								<button
									type="button"
									onClick={handleVerificationRequest}
									disabled={!phone.trim() || isSendingSms}
									className="px-4 py-3 border border-[#D9D9D9] text-sm font-medium text-[#262626] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
								>
									{isSendingSms ? "발송 중..." : "인증요청"}
								</button>
							</div>
						</div>

						{/* 인증번호 입력 섹션 */}
						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={verificationId}
								className="text-sm font-medium text-[#595959]"
							>
								인증번호
							</label>
							<div className="border border-[#D9D9D9] p-3">
								<input
									type="text"
									placeholder="인증번호 입력"
									id={verificationId}
									value={verificationCode}
									onChange={(e) => {
										setVerificationCode(e.target.value);
										setVerificationError(null);
									}}
									maxLength={6}
									className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
								/>
							</div>
							{verificationError && (
								<p className="text-sm text-red-500">{verificationError}</p>
							)}
							{smsSuccess && (
								<p className="text-sm text-[#133A1B]">{smsSuccess}</p>
							)}
							{smsError && <p className="text-sm text-red-500">{smsError}</p>}
						</div>

						{/* 에러 메시지 */}
						{passwordResetError && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-500">{passwordResetError}</p>
							</div>
						)}

						{/* 확인 버튼 */}
						<button
							type="button"
							onClick={handleConfirm}
							disabled={
								!phone.trim() ||
								!verificationCode.trim() ||
								isVerifyingCode ||
								isVerifyingPasswordReset
							}
							className="w-full py-[14px] bg-[#133A1B] text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
						>
							{isVerifyingCode || isVerifyingPasswordReset
								? "확인 중..."
								: "확인"}
						</button>
					</div>
				) : (
					/* 아이디 찾기 입력 폼 */
					<div className="flex flex-col gap-5">
						{/* 휴대폰 입력 섹션 */}
						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={phoneId}
								className="text-sm font-medium text-[#595959]"
							>
								휴대폰
							</label>
							<div className="flex gap-2">
								<div className="flex-1 border border-[#D9D9D9] p-3">
									<input
										type="tel"
										placeholder="- 제외하고 번호 입력"
										id={phoneId}
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
									/>
								</div>
								<button
									type="button"
									onClick={handleVerificationRequest}
									disabled={!phone.trim() || isSendingSms}
									className="px-4 py-3 border border-[#D9D9D9] text-sm font-medium text-[#262626] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
								>
									{isSendingSms ? "발송 중..." : "인증요청"}
								</button>
							</div>
						</div>

						{/* 인증번호 입력 섹션 */}
						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={verificationId}
								className="text-sm font-medium text-[#595959]"
							>
								인증번호
							</label>
							<div className="border border-[#D9D9D9] p-3">
								<input
									type="text"
									placeholder="인증번호 입력"
									id={verificationId}
									value={verificationCode}
									onChange={(e) => {
										setVerificationCode(e.target.value);
										setVerificationError(null);
									}}
									maxLength={6}
									className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
								/>
							</div>
							{verificationError && (
								<p className="text-sm text-red-500">{verificationError}</p>
							)}
							{smsSuccess && (
								<p className="text-sm text-[#133A1B]">{smsSuccess}</p>
							)}
							{smsError && <p className="text-sm text-red-500">{smsError}</p>}
						</div>

						{/* 에러 메시지 */}
						{findError && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-500">{findError}</p>
							</div>
						)}

						{/* 확인 버튼 */}
						<button
							type="button"
							onClick={handleConfirm}
							disabled={
								!phone.trim() ||
								!verificationCode.trim() ||
								isVerifyingCode ||
								isFindingAccount
							}
							className="w-full py-[14px] bg-[#133A1B] text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
						>
							{isVerifyingCode
								? "인증 중..."
								: isFindingAccount
									? "찾는 중..."
									: "확인"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

const FindAccountPage = () => {
	return (
		<Suspense fallback={<div>로딩 중...</div>}>
			<FindAccountPageContent />
		</Suspense>
	);
};

export default FindAccountPage;
