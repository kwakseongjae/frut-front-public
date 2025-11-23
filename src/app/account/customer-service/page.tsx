"use client";

import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";

const CustomerServicePage = () => {
	const handleNoticeClick = () => {
		// 공지사항 페이지로 이동
		console.log("공지사항");
	};

	const handleFAQClick = () => {
		// FAQ 페이지로 이동
		console.log("FAQ");
	};

	const handleAdvertisingClick = () => {
		// 광고문의 페이지로 이동
		console.log("광고문의");
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* 헤더 영역 */}
			<div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5 border-b border-[#E5E5E5]">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="p-1 cursor-pointer"
					aria-label="뒤로가기"
				>
					<ChevronLeftIcon />
				</button>
				<div>
					<h1 className="text-lg font-semibold text-[#262626]">고객센터</h1>
				</div>
				<div className="w-7" />
			</div>

			{/* 메뉴 아이템 그룹 */}
			<div className="flex flex-col">
				<button
					type="button"
					onClick={handleNoticeClick}
					className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
					aria-label="공지사항"
				>
					<span className="text-base text-[#262626]">공지사항</span>
					<ChevronRightIcon />
				</button>
				<button
					type="button"
					onClick={handleFAQClick}
					className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
					aria-label="FAQ"
				>
					<span className="text-base text-[#262626]">FAQ</span>
					<ChevronRightIcon />
				</button>
				<button
					type="button"
					onClick={handleAdvertisingClick}
					className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
					aria-label="광고문의"
				>
					<span className="text-base text-[#262626]">광고문의</span>
					<ChevronRightIcon />
				</button>
			</div>

			{/* 하단 고객센터 정보 영역 */}
			<div className="flex-1 flex items-end">
				<div className="w-full bg-[#F7F7F7] px-6 py-8">
					<div className="flex flex-col gap-2">
						<div className="text-lg font-bold text-[#262626]">
							고객센터: 031-1234-5678
						</div>
						<div className="text-sm text-[#262626]">abcd@dsidh.com</div>
						<div className="flex flex-col gap-1">
							<div className="text-sm text-[#262626]">
								운영시간: 평일 00:00 - 00:00
							</div>
							<div className="text-sm text-[#262626]">
								주말 및 공휴일은 휴무입니다
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerServicePage;
