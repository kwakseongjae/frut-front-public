"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";

const ChangePasswordPage = () => {
	const router = useRouter();
	const currentPasswordId = useId();
	const newPasswordId = useId();
	const confirmPasswordId = useId();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			alert("모든 필드를 입력해주세요.");
			return;
		}
		if (newPassword !== confirmPassword) {
			alert("새 비밀번호가 일치하지 않습니다.");
			return;
		}
		// 비밀번호 변경 로직
		console.log("비밀번호 변경:", {
			currentPassword,
			newPassword,
			confirmPassword,
		});
		router.back();
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
						비밀번호 변경
					</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 콘텐츠 영역 */}
			<div className="flex-1 px-5 py-4">
				<div className="flex flex-col gap-4">
					{/* 현재 비밀번호 */}
					<div>
						<label
							htmlFor={currentPasswordId}
							className="text-sm text-[#262626] mb-2 block"
						>
							현재 비밀번호
						</label>
						<input
							type="password"
							id={currentPasswordId}
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="현재 비밀번호를 입력하세요"
							className="w-full p-3 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
						/>
					</div>

					{/* 새 비밀번호 */}
					<div>
						<label
							htmlFor={newPasswordId}
							className="text-sm text-[#262626] mb-2 block"
						>
							새 비밀번호
						</label>
						<input
							type="password"
							id={newPasswordId}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="새 비밀번호를 입력하세요"
							className="w-full p-3 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
						/>
					</div>

					{/* 새 비밀번호 확인 */}
					<div>
						<label
							htmlFor={confirmPasswordId}
							className="text-sm text-[#262626] mb-2 block"
						>
							새 비밀번호 확인
						</label>
						<input
							type="password"
							id={confirmPasswordId}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="새 비밀번호를 다시 입력하세요"
							className="w-full p-3 border border-[#D9D9D9] rounded text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
						/>
					</div>
				</div>
			</div>

			{/* 하단 고정 버튼 */}
			<div className="sticky bottom-0 z-10 bg-white border-t border-[#E5E5E5] px-5 py-3">
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!currentPassword || !newPassword || !confirmPassword}
					className={`w-full py-4 bg-[#133A1B] text-white font-semibold text-sm ${
						!currentPassword || !newPassword || !confirmPassword
							? "opacity-50 cursor-not-allowed"
							: ""
					}`}
					aria-label="비밀번호 변경하기"
				>
					비밀번호 변경하기
				</button>
			</div>
		</div>
	);
};

export default ChangePasswordPage;
