"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface FarmCardProps {
	id: number;
	name: string;
	farmImage?: string | null;
	isFollowing?: boolean;
	onFollowToggle?: (id: number) => void;
}

const FarmCard = ({
	id,
	name,
	farmImage,
	isFollowing = false,
	onFollowToggle,
}: FarmCardProps) => {
	const router = useRouter();

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFollowToggle?.(id);
	};

	const handleFarmProfileClick = () => {
		router.push(`/farms/${id}`);
	};

	return (
		<div className="flex items-center justify-between py-4">
			<button
				type="button"
				onClick={handleFarmProfileClick}
				className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-70 transition-opacity"
				aria-label={`${name} 농장 프로필 보기`}
			>
				<div className="w-[70px] h-[70px] bg-white border border-[#D9D9D9] rounded-full flex-shrink-0 relative overflow-hidden">
					{farmImage && (
						<Image src={farmImage} alt={name} fill className="object-cover" />
					)}
				</div>
				<div className="text-sm font-semibold text-[#262626]">{name}</div>
			</button>
			<button
				type="button"
				onClick={handleClick}
				className={`rounded cursor-pointer py-[6px] px-5 text-xs font-semibold flex-shrink-0 ${
					isFollowing
						? "text-[#262626] bg-[#F5F5F5]"
						: "text-white bg-[#133A1B]"
				}`}
				aria-label={isFollowing ? "팔로잉 취소" : "팔로우"}
			>
				{isFollowing ? "팔로잉" : "팔로우"}
			</button>
		</div>
	);
};

export default FarmCard;
