import Image from "next/image";
import Link from "next/link";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import { ad_banner } from "@/assets/images/dummy";

const AccountPage = () => {
  return (
    <div className="flex flex-col bg-white">
      {/* 사용자 통계 섹션 */}
      <div className="flex items-center justify-around py-6 px-5 border-b border-[#E5E5E5]">
        <Link
          href="/account/coupons"
          className="flex flex-col items-center gap-1 flex-1 cursor-pointer active:opacity-70"
          tabIndex={0}
        >
          <p className="text-sm text-[#262626]">쿠폰</p>
          <p className="text-lg font-semibold text-[#262626]">0</p>
        </Link>
        <div className="w-px h-10 bg-[#E5E5E5]" />
        <Link
          href="/account/points"
          className="flex flex-col items-center gap-1 flex-1 cursor-pointer active:opacity-70"
          tabIndex={0}
        >
          <p className="text-sm text-[#262626]">포인트</p>
          <p className="text-lg font-semibold text-[#262626]">1024</p>
        </Link>
      </div>

      {/* 배너 섹션 */}
      <div className="w-full h-[140px] relative">
        <Image src={ad_banner} alt="배너" fill className="object-cover" />
      </div>

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
          href="/account/business"
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
    </div>
  );
};

export default AccountPage;
