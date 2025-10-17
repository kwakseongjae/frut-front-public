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

	// Category, Farm, Product, Signin 페이지에서는 TopBar와 TabBar 숨기기
	const shouldHideTopBar =
		pathname.startsWith("/categories/") ||
		pathname.startsWith("/farms") ||
		pathname.startsWith("/products/") ||
		pathname.startsWith("/signin") ||
		pathname.startsWith("/ordersheet");
	const shouldHideTabBar =
		pathname.startsWith("/farms") ||
		pathname.startsWith("/products/") ||
		pathname.startsWith("/signin") ||
		pathname.startsWith("/ordersheet");

	return (
		<div className="sm:w-[640px] sm:border-l sm:border-r sm:border-gray-200 h-screen mx-auto bg-white flex flex-col">
			{!shouldHideTopBar && <TopBar />}
			<div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
			{!shouldHideTabBar && <TabBar />}
		</div>
	);
};

export default MainContainer;
