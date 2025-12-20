"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WishlistIcon from "@/assets/icon/ic_heart_24.svg";
import HomeIcon from "@/assets/icon/ic_home_24.svg";
import CategoriesIcon from "@/assets/icon/ic_menu_24.svg";
import ProfileIcon from "@/assets/icon/ic_profile_24.svg";
import OrdersIcon from "@/assets/icon/ic_shipment_24.svg";

function TabBar() {
  const pathname = usePathname();

  // 홈 관련 경로 목록 (더보기 페이지 포함)
  const homePaths = [
    "/",
    "/categories/type/special",
    "/categories/type/popular",
    "/categories/type/recommended",
    "/categories/type/weekly_best",
    "/farms/best",
  ];

  const isActive = (path: string) => {
    // 홈 경로인 경우
    if (path === "/") {
      return homePaths.includes(pathname);
    }
    // 다른 경로인 경우
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const getIconColor = (path: string) => {
    return isActive(path) ? "#133A1B" : "#9E9E9E";
  };

  const getTextColor = (path: string) => {
    return isActive(path) ? "text-[#133A1B]" : "text-[#9E9E9E]";
  };

  return (
    <div className="flex items-center py-3">
      <Link
        href="/categories"
        className="flex flex-col gap-1 items-center flex-1"
      >
        <CategoriesIcon color={getIconColor("/categories")} />
        <p
          className={`text-[10px] font-regular ${getTextColor("/categories")}`}
        >
          카테고리
        </p>
      </Link>
      <Link
        href="/wishlist"
        className="flex flex-col gap-1 items-center flex-1"
      >
        <WishlistIcon color={getIconColor("/wishlist")} />
        <p className={`text-[10px] font-regular ${getTextColor("/wishlist")}`}>
          찜
        </p>
      </Link>
      <Link href="/" className="flex flex-col gap-1 items-center flex-1">
        <HomeIcon color={getIconColor("/")} />
        <p className={`text-[10px] font-regular ${getTextColor("/")}`}>홈</p>
      </Link>
      <Link href="/orders" className="flex flex-col gap-1 items-center flex-1">
        <OrdersIcon color={getIconColor("/orders")} />
        <p className={`text-[10px] font-regular ${getTextColor("/orders")}`}>
          주문배송
        </p>
      </Link>
      <Link href="/account" className="flex flex-col gap-1 items-center flex-1">
        <ProfileIcon color={getIconColor("/account")} />
        <p className={`text-[10px] font-regular ${getTextColor("/account")}`}>
          마이페이지
        </p>
      </Link>
    </div>
  );
}

export default TabBar;
