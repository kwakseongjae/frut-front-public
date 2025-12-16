"use client";

import Image from "next/image";
import Link from "next/link";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { ad_banner } from "@/assets/images/dummy";
import BannerCarousel from "@/components/BannerCarousel";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/lib/api/hooks/use-auth";
import { useBannerAds } from "@/lib/api/hooks/use-banner-ads";
import { useUserCoupons } from "@/lib/api/hooks/use-coupons";
import { usePointsBalance } from "@/lib/api/hooks/use-points";

const AccountPage = () => {
  const { user } = useAuth();
  const { data: userCouponsData } = useUserCoupons();
  const couponCount = userCouponsData?.available_count || 0;
  const { data: pointsData } = usePointsBalance();
  const pointsBalance = pointsData?.balance || 0;
  const logoutMutation = useLogout();

  // MYPAGE 타입 배너 조회
  const { data: mypageBanners, isLoading: isLoadingMypageBanners } =
    useBannerAds({
      ad_type: "MYPAGE",
    });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert(
        error instanceof Error ? error.message : "로그아웃에 실패했습니다."
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col bg-white">
        {/* 사용자 통계 섹션 */}
        <div className="flex items-center justify-around py-6 px-5 border-b border-[#E5E5E5]">
          <Link
            href="/account/coupons"
            className="flex flex-col items-center gap-1 flex-1 cursor-pointer active:opacity-70"
            tabIndex={0}
          >
            <p className="text-sm text-[#262626]">쿠폰</p>
            <p className="text-lg font-semibold text-[#262626]">
              {couponCount}
            </p>
          </Link>
          <div className="w-px h-10 bg-[#E5E5E5]" />
          <Link
            href="/account/points"
            className="flex flex-col items-center gap-1 flex-1 cursor-pointer active:opacity-70"
            tabIndex={0}
          >
            <p className="text-sm text-[#262626]">포인트</p>
            <p className="text-lg font-semibold text-[#262626]">
              {pointsBalance.toLocaleString()}P
            </p>
          </Link>
        </div>

        {/* 배너 섹션 */}
        {isLoadingMypageBanners ? (
          <div className="w-full h-[140px] bg-[#D9D9D9] animate-pulse" />
        ) : mypageBanners && mypageBanners.length > 0 ? (
          <BannerCarousel
            banners={mypageBanners}
            height="140px"
            autoSlideInterval={5000}
          />
        ) : (
          <div className="w-full h-[140px] relative">
            <Image src={ad_banner} alt="배너" fill className="object-cover" />
          </div>
        )}

        {/* 메뉴 아이템 그룹 1: 사용자 상호작용/선호도 */}
        <div className="flex flex-col">
          <Link
            href="/farms"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">팔로우 농장</span>
            <ChevronRightIcon />
          </Link>
          <Link
            href="/wishlist"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">찜</span>
            <ChevronRightIcon />
          </Link>
        </div>

        {/* 디바이더 1 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 메뉴 아이템 그룹 2: 주문/서비스 관리 */}
        <div className="flex flex-col">
          <Link
            href="/orders"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">주문/배송 조회</span>
            <ChevronRightIcon />
          </Link>
          <Link
            href="/account/refund"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">환불/반품</span>
            <ChevronRightIcon />
          </Link>
          <Link
            href="/account/reviews"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">상품 후기</span>
            <ChevronRightIcon />
          </Link>
        </div>

        {/* 디바이더 2 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 메뉴 아이템 그룹 3: 계정 및 지원 */}
        <div className="flex flex-col">
          <Link
            href="/account/edit"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">개인정보 수정</span>
            <ChevronRightIcon />
          </Link>
          <Link
            href={
              user?.user_type === "SELLER"
                ? "/account/business"
                : "/account/business/apply"
            }
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">비즈프로필 관리</span>
            <ChevronRightIcon />
          </Link>
          <Link
            href="/account/customer-service"
            className="flex items-center justify-between py-4 px-5 active:bg-[#F5F5F5]"
            tabIndex={0}
          >
            <span className="text-base text-[#262626]">고객 센터</span>
            <ChevronRightIcon />
          </Link>
        </div>

        {/* 디바이더 */}
        <div className="h-[10px] bg-[#F7F7F7]" />

        {/* 로그아웃 */}
        <div className="px-5 py-4 mb-10">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-1 text-sm text-[#8C8C8C] cursor-pointer active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>로그아웃</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#8C8C8C]"
                aria-label="로그아웃"
                role="img"
              >
                <title>로그아웃</title>
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AccountPage;
