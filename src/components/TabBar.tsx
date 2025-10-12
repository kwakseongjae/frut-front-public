"use client";

import HomeIcon from "@/assets/icon/ic_home_24.svg";
import WishlistIcon from "@/assets/icon/ic_heart_24.svg";
import CategoriesIcon from "@/assets/icon/ic_menu_24.svg";
import OrdersIcon from "@/assets/icon/ic_shipment_24.svg";
import ProfileIcon from "@/assets/icon/ic_profile_24.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";

function TabBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
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
