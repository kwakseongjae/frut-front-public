"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CartIcon from "@/assets/icon/ic_cart_24.svg";
import LogoIcon from "@/assets/icon/ic_logo.svg";
import SearchIcon from "@/assets/icon/ic_search_24.svg";
import { useAuth } from "@/contexts/AuthContext";

const TopBar = () => {
	const router = useRouter();
	const { isLoggedIn } = useAuth();

	const handleCartClick = () => {
		if (!isLoggedIn) {
			router.push("/signin");
		} else {
			router.push("/cart");
		}
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
			</div>
		</div>
	);
};

export default TopBar;
