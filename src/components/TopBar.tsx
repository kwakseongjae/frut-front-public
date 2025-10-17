import Link from "next/link";
import CartIcon from "@/assets/icon/ic_cart_24.svg";
import LogoIcon from "@/assets/icon/ic_logo.svg";
import SearchIcon from "@/assets/icon/ic_search_24.svg";

function TopBar() {
	return (
		<div className="flex justify-between items-center py-3 px-5">
			<Link href="/">
				<LogoIcon />
			</Link>
			<div className="flex items-center space-x-6">
				<SearchIcon color="black" className="cursor-pointer" />
				<CartIcon color="black" className="cursor-pointer" />
			</div>
		</div>
	);
}

export default TopBar;
