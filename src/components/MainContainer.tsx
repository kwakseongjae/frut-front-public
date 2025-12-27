"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import TabBar from "@/components/TabBar";
import TopBar from "@/components/TopBar";

interface MainContainerProps {
  children: ReactNode;
}

const MainContainer = ({ children }: MainContainerProps) => {
  const pathname = usePathname();

  // Category, Farm, Product, Signin, Signup, Cart, Search, Orders detail 페이지에서는 TopBar와 TabBar 숨기기
  const shouldHideTopBar =
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/farms") ||
    pathname.startsWith("/products/") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/ordersheet") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/account/coupons") ||
    pathname.startsWith("/account/reviews") ||
    pathname.startsWith("/account/customer-service") ||
    pathname.startsWith("/account/points") ||
    pathname.startsWith("/account/refund") ||
    pathname.startsWith("/account/edit") ||
    pathname.startsWith("/account/withdraw") ||
    pathname.startsWith("/account/business") ||
    pathname.startsWith("/account/addresses") ||
    (pathname.includes("/orders/") && pathname.includes("/complete")) ||
    (pathname.startsWith("/orders/") && pathname !== "/orders");
  const shouldHideTabBar =
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/farms") ||
    pathname.startsWith("/products/") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/ordersheet") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/account/coupons") ||
    pathname.startsWith("/account/reviews") ||
    pathname.startsWith("/account/customer-service") ||
    pathname.startsWith("/account/points") ||
    pathname.startsWith("/account/refund") ||
    pathname.startsWith("/account/edit") ||
    pathname.startsWith("/account/withdraw") ||
    pathname.startsWith("/account/business") ||
    pathname.startsWith("/account/addresses") ||
    (pathname.includes("/orders/") && pathname.includes("/complete")) ||
    (pathname.startsWith("/orders/") && pathname !== "/orders");

  return (
    <div className="sm:w-[640px] sm:border-l sm:border-r sm:border-gray-200 h-[100dvh] mx-auto bg-white flex flex-col overflow-hidden">
      {!shouldHideTopBar && (
        <div className="sticky top-0 z-50 bg-white">
          <TopBar />
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide overscroll-none">
        {children}
      </div>
      {!shouldHideTabBar && (
        <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200">
          <TabBar />
        </div>
      )}
    </div>
  );
};

export default MainContainer;
