"use client";

interface FarmCardProps {
	id: number;
	name: string;
	isFollowing?: boolean;
	onFollowToggle?: (id: number) => void;
}

const FarmCard = ({
	id,
	name,
	isFollowing = false,
	onFollowToggle,
}: FarmCardProps) => {
	const handleClick = () => {
		onFollowToggle?.(id);
	};

	return (
		<div className="flex items-center justify-between py-4">
			<div className="flex items-center gap-4 flex-1">
				<div className="w-[70px] h-[70px] bg-white border border-[#D9D9D9] rounded-full flex-shrink-0"></div>
				<div className="text-sm font-semibold text-[#262626]">{name}</div>
			</div>
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
