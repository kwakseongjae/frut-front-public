"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface FarmAvatarProps {
	rank: number;
	farmName: string;
	farmId?: number;
	farmImage?: string | null;
}

const FarmAvatar = ({ rank, farmName, farmId, farmImage }: FarmAvatarProps) => {
	const router = useRouter();

	const handleClick = () => {
		if (farmId) {
			router.push(`/farms/${farmId}`);
		}
	};

	return (
		<button
			type="button"
			className="flex flex-col items-center gap-2 max-w-[80px] cursor-pointer bg-transparent border-none p-0"
			onClick={handleClick}
			aria-label={`${farmName} 농장 프로필 보기`}
		>
			<div className="w-[60px] h-[60px] bg-[#D9D9D9] rounded-full relative overflow-hidden">
				{farmImage ? (
					<Image src={farmImage} alt={farmName} fill className="object-cover" />
				) : null}
			</div>
			<div className="text-center flex">
				<span className="text-sm font-semibold text-[#262626]">{rank}</span>
				<span className="text-sm font-medium text-[#262626] ml-0.5 truncate block">
					{farmName}
				</span>
			</div>
		</button>
	);
};

export default FarmAvatar;
