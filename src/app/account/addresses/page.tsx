"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
	useAddresses,
	useDeleteAddress,
	useUpdateAddress,
} from "@/lib/api/hooks/use-users";

export default function AddressesPage() {
	const router = useRouter();
	const [isFromOrdersheet, setIsFromOrdersheet] = useState(false);

	useEffect(() => {
		// 결제 페이지에서 왔는지 확인
		if (typeof window !== "undefined") {
			const referrer = document.referrer;
			setIsFromOrdersheet(referrer.includes("/ordersheet"));
		}
	}, []);
	const { data: addresses, isLoading } = useAddresses();
	const deleteAddressMutation = useDeleteAddress();
	const updateAddressMutation = useUpdateAddress();
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
		null,
	);

	const handleDelete = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation(); // 카드 클릭 이벤트 방지
		if (!confirm("정말 이 배송지를 삭제하시겠습니까?")) {
			return;
		}

		try {
			await deleteAddressMutation.mutateAsync(id);
			// 삭제된 배송지가 선택되어 있었다면 선택 해제
			if (selectedAddressId === id) {
				setSelectedAddressId(null);
			}
		} catch (error) {
			alert(
				error instanceof Error ? error.message : "배송지 삭제에 실패했습니다.",
			);
		}
	};

	const handleCardClick = (addressId: number, isDefault: boolean) => {
		// 기본 배송지가 아닌 경우에만 선택
		if (!isDefault) {
			setSelectedAddressId(addressId);
		}
	};

	const handleSetDefault = async () => {
		if (!selectedAddressId) return;

		const selectedAddress = addresses?.find(
			(addr) => addr.id === selectedAddressId,
		);
		if (!selectedAddress) return;

		try {
			await updateAddressMutation.mutateAsync({
				id: selectedAddressId,
				request: {
					address_name: selectedAddress.address_name,
					recipient_name: selectedAddress.recipient_name,
					recipient_phone: selectedAddress.recipient_phone,
					zipcode: selectedAddress.zipcode,
					address: selectedAddress.address,
					detail_address: selectedAddress.detail_address,
					is_default: true,
					delivery_request: selectedAddress.delivery_request,
				},
			});
			setSelectedAddressId(null);
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: "기본 배송지 설정에 실패했습니다.",
			);
		}
	};

	return (
		<ProtectedRoute>
			<div className="flex flex-col h-screen bg-white">
				{/* 헤더 */}
				<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5 border-b border-[#E5E5E5]">
					<button
						type="button"
						onClick={() => {
							if (isFromOrdersheet) {
								// 결제 페이지에서 왔다면 히스토리를 교체하여 이동
								router.replace("/ordersheet");
							} else {
								// 그 외의 경우 일반 뒤로가기
								router.back();
							}
						}}
						className="p-1 cursor-pointer"
						aria-label="뒤로가기"
					>
						<ChevronLeftIcon />
					</button>
					<h1 className="text-lg font-semibold text-[#262626]">배송지 변경</h1>
					<button
						type="button"
						onClick={() => router.push("/account/addresses/new")}
						className="text-sm text-[#262626] font-medium"
					>
						배송지 추가
					</button>
				</div>

				{/* 본문 */}
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-10">
							<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
						</div>
					) : !addresses || addresses.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 px-5">
							<p className="text-sm text-[#8C8C8C] mb-4">
								등록된 배송지가 없습니다.
							</p>
							<button
								type="button"
								onClick={() => router.push("/account/addresses/new")}
								className="px-6 py-3 bg-[#133A1B] text-white font-semibold text-sm rounded"
							>
								배송지 추가하기
							</button>
						</div>
					) : (
						<div className="px-5 py-4 space-y-4 pb-24">
							{addresses.map((address) => {
								const isSelected =
									selectedAddressId === address.id && !address.is_default;

								const cardContent = (
									<>
										{/* 별칭 및 기본 배송지 태그 */}
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium text-[#262626]">
												별칭
											</span>
											{address.is_default && (
												<span className="px-2 py-0.5 bg-[#E8F5E9] text-[#133A1B] text-xs font-medium rounded">
													기본 배송지
												</span>
											)}
										</div>
										<p className="text-sm text-[#262626] mb-3">
											{address.address_name}
										</p>

										{/* 이름 */}
										<div className="mb-2">
											<span className="text-sm font-medium text-[#262626]">
												이름
											</span>
										</div>
										<p className="text-sm text-[#262626] mb-3">
											{address.recipient_name}
										</p>

										{/* 주소 */}
										<div className="mb-2">
											<span className="text-sm font-medium text-[#262626]">
												주소
											</span>
										</div>
										<p className="text-sm text-[#262626] mb-3">
											{address.address}
											{address.detail_address && `, ${address.detail_address}`}
										</p>

										{/* 전화번호 */}
										<div className="mb-2">
											<span className="text-sm font-medium text-[#262626]">
												전화번호
											</span>
										</div>
										<p className="text-sm text-[#262626] mb-4">
											{address.recipient_phone}
										</p>

										{/* 수정/삭제 버튼 */}
										<div className="flex gap-2 pt-3 border-t border-[#E5E5E5]">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/account/addresses/${address.id}/edit`);
												}}
												className="flex-1 py-2 border border-[#D9D9D9] text-sm text-[#262626] font-medium rounded hover:bg-[#F7F7F7] transition-colors"
											>
												수정
											</button>
											<button
												type="button"
												onClick={(e) => handleDelete(address.id, e)}
												disabled={deleteAddressMutation.isPending}
												className="flex-1 py-2 border border-[#D9D9D9] text-sm text-[#262626] font-medium rounded hover:bg-[#F7F7F7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												삭제
											</button>
										</div>
									</>
								);

								if (address.is_default) {
									return (
										<div
											key={address.id}
											className="w-full text-left border border-[#133A1B] rounded-lg p-4 bg-white transition-colors"
										>
											{cardContent}
										</div>
									);
								}

								return (
									<button
										key={address.id}
										type="button"
										onClick={() =>
											handleCardClick(address.id, address.is_default)
										}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleCardClick(address.id, address.is_default);
											}
										}}
										aria-label={`${address.recipient_name} 배송지 선택`}
										className={`w-full text-left border border-[#133A1B] rounded-lg p-4 bg-white transition-colors ${
											isSelected ? "bg-[#F7F7F7]" : ""
										} cursor-pointer`}
									>
										{cardContent}
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* 기본 배송지로 설정 버튼 */}
				{selectedAddressId &&
					addresses?.find((addr) => addr.id === selectedAddressId)
						?.is_default === false && (
						<div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-5 py-3">
							<button
								type="button"
								onClick={handleSetDefault}
								disabled={updateAddressMutation.isPending}
								className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{updateAddressMutation.isPending
									? "설정 중..."
									: "기본 배송지로 설정"}
							</button>
						</div>
					)}
			</div>
		</ProtectedRoute>
	);
}















