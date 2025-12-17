"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useId, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAddresses, useUpdateAddress } from "@/lib/api/hooks/use-users";

export default function EditAddressPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const { id } = use(params);
	const addressId = parseInt(id, 10);
	const { data: addresses, isLoading } = useAddresses();
	const updateAddressMutation = useUpdateAddress();
	const isDefaultInputId = useId();

	const currentAddress = addresses?.find((addr) => addr.id === addressId);

	const [formData, setFormData] = useState({
		address_name: "",
		recipient_name: "",
		recipient_phone: "",
		zipcode: "",
		address: "",
		detail_address: "",
		is_default: false,
		delivery_request: "",
	});

	// 주소 데이터 로드
	useEffect(() => {
		if (currentAddress) {
			setFormData({
				address_name: currentAddress.address_name,
				recipient_name: currentAddress.recipient_name,
				recipient_phone: currentAddress.recipient_phone,
				zipcode: currentAddress.zipcode,
				address: currentAddress.address,
				detail_address: currentAddress.detail_address || "",
				is_default: currentAddress.is_default,
				delivery_request:
					currentAddress.delivery_request === "없음"
						? ""
						: currentAddress.delivery_request || "",
			});
		}
	}, [currentAddress]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			is_default: e.target.checked,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 필수 필드 검증
		if (
			!formData.address_name ||
			!formData.recipient_name ||
			!formData.recipient_phone ||
			!formData.zipcode ||
			!formData.address
		) {
			alert("필수 항목을 모두 입력해주세요.");
			return;
		}

		try {
			await updateAddressMutation.mutateAsync({
				id: addressId,
				request: {
					address_name: formData.address_name,
					recipient_name: formData.recipient_name,
					recipient_phone: formData.recipient_phone,
					zipcode: formData.zipcode,
					address: formData.address,
					detail_address: formData.detail_address || null,
					is_default: formData.is_default,
					delivery_request: formData.delivery_request.trim()
						? formData.delivery_request.trim()
						: "없음",
				},
			});

			// 배송지 변경 페이지로 이동
			router.push("/account/addresses");
		} catch (error) {
			alert(
				error instanceof Error ? error.message : "배송지 수정에 실패했습니다.",
			);
		}
	};

	if (isLoading) {
		return (
			<ProtectedRoute>
				<div className="flex flex-col h-screen bg-white">
					<div className="flex items-center justify-center flex-1">
						<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	if (!currentAddress) {
		return (
			<ProtectedRoute>
				<div className="flex flex-col h-screen bg-white">
					<div className="flex items-center justify-center flex-1">
						<p className="text-sm text-[#8C8C8C]">배송지를 찾을 수 없습니다.</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<div className="flex flex-col h-screen bg-white">
				{/* 헤더 */}
				<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
					<button
						type="button"
						onClick={() => router.back()}
						className="p-1 cursor-pointer"
						aria-label="뒤로가기"
					>
						<ChevronLeftIcon />
					</button>
					<h1 className="text-lg font-semibold text-[#262626]">배송지 수정</h1>
					<div className="w-7" />
				</div>

				{/* 본문 */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
						{/* 주소 별명 */}
						<div>
							<input
								type="text"
								name="address_name"
								value={formData.address_name}
								onChange={handleInputChange}
								placeholder="주소 별명 (예: 집, 회사)"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 수령인 */}
						<div>
							<input
								type="text"
								name="recipient_name"
								value={formData.recipient_name}
								onChange={handleInputChange}
								placeholder="수령인"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 우편번호 */}
						<div>
							<input
								type="text"
								name="zipcode"
								value={formData.zipcode}
								onChange={handleInputChange}
								placeholder="우편번호"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 주소 */}
						<div>
							<input
								type="text"
								name="address"
								value={formData.address}
								onChange={handleInputChange}
								placeholder="주소"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 상세주소 */}
						<div>
							<input
								type="text"
								name="detail_address"
								value={formData.detail_address}
								onChange={handleInputChange}
								placeholder="상세주소"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 휴대폰 */}
						<div>
							<input
								type="tel"
								name="recipient_phone"
								value={formData.recipient_phone}
								onChange={handleInputChange}
								placeholder="휴대폰"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 배송 요청사항 */}
						<div>
							<input
								type="text"
								name="delivery_request"
								value={formData.delivery_request}
								onChange={handleInputChange}
								placeholder="배송 시 요청사항 (선택사항)"
								className="w-full p-3 border-b border-[#E5E5E5] text-sm text-[#262626] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#133A1B]"
							/>
						</div>

						{/* 기본 배송지 설정 */}
						<div className="flex items-center gap-3 pt-2">
							<input
								type="checkbox"
								id={isDefaultInputId}
								name="is_default"
								checked={formData.is_default}
								onChange={handleCheckboxChange}
								className="w-4 h-4 text-[#133A1B] border-[#D9D9D9] rounded focus:ring-[#133A1B]"
							/>
							<label
								htmlFor={isDefaultInputId}
								className="text-sm text-[#262626] cursor-pointer"
							>
								기본 배송지로 설정
							</label>
						</div>
					</div>

					{/* 하단 버튼 */}
					<div className="mt-auto bg-white border-t border-[#E5E5E5] px-5 py-3">
						<button
							type="submit"
							disabled={updateAddressMutation.isPending}
							className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{updateAddressMutation.isPending
								? "수정 중..."
								: "배송지 수정하기"}
						</button>
					</div>
				</form>
			</div>
		</ProtectedRoute>
	);
}















