"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CartIcon from "@/assets/icon/ic_cart_24.svg";
import LogoIcon from "@/assets/icon/ic_logo.svg";
import SearchIcon from "@/assets/icon/ic_search_24.svg";
import { useAuth } from "@/contexts/AuthContext";

const TopBar = () => {
	const router = useRouter();
	const { isLoggedIn, logout } = useAuth();

	const handleCartClick = () => {
		if (!isLoggedIn) {
			router.push("/signin");
		} else {
			router.push("/cart");
		}
	};

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	return (
		<div className="flex justify-between items-center py-3 px-5">
			<Link href="/">
				<LogoIcon />
			</Link>
			<div className="flex items-center gap-4">
				<Link href="/search">
					<SearchIcon color="black" className="cursor-pointer" />
				</Link>
				<CartIcon
					color="black"
					className="cursor-pointer"
					onClick={handleCartClick}
				/>
				{isLoggedIn ? (
					<button
						type="button"
						onClick={handleLogout}
						className="bg-[#133A1B] text-white px-4 py-2 rounded text-sm font-medium"
						aria-label="로그아웃"
					>
						로그아웃
					</button>
				) : (
					<Link
						href="/signin"
						className="bg-[#133A1B] text-white px-4 py-2 rounded text-sm font-medium"
					>
						로그인/회원가입
					</Link>
				)}
			</div>
		</div>
	);
};

export default TopBar;
