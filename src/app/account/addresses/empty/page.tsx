"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAddresses } from "@/lib/api/hooks/use-users";

const EmptyAddressesPageContent = () => {
	const router = useRouter();
	const { data: addresses, isLoading } = useAddresses();

	// 배송지가 있으면 배송지 변경 페이지로 리다이렉트
	useEffect(() => {
		if (!isLoading && addresses && addresses.length > 0) {
			router.replace("/account/addresses?from=ordersheet");
		}
	}, [addresses, isLoading, router]);

	return (
		<ProtectedRoute>
			<div className="flex flex-col h-screen bg-white">
				{/* 헤더 */}
				<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
					<button
						type="button"
						onClick={() => router.replace("/ordersheet")}
						className="p-1 cursor-pointer"
						aria-label="뒤로가기"
					>
						<ChevronLeftIcon />
					</button>
					<h1 className="text-lg font-semibold text-[#262626]">배송지</h1>
					<div className="w-9" />
				</div>

				{/* 본문 */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{isLoading ? (
						<div className="flex-1 flex items-center justify-center py-10">
							<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
						</div>
					) : (
						<div className="flex-1 flex flex-col">
							<div className="flex items-center justify-center px-5 pt-32">
								<p className="text-[14px] font-medium text-[#949494]">
									등록된 배송지가 없습니다.
								</p>
							</div>
							<div className="mt-auto bg-white px-5 py-3">
								<button
									type="button"
									onClick={() => router.push("/account/addresses/new?from=ordersheet")}
									className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm"
								>
									새 배송지 등록하기
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default function EmptyAddressesPage() {
	return (
		<Suspense fallback={
			<ProtectedRoute>
				<div className="flex flex-col h-screen bg-white">
					<div className="flex items-center justify-center flex-1">
						<p className="text-sm text-[#8C8C8C]">로딩 중...</p>
					</div>
				</div>
			</ProtectedRoute>
		}>
			<EmptyAddressesPageContent />
		</Suspense>
	);
}

