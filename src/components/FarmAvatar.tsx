interface FarmAvatarProps {
	rank: number;
	farmName: string;
}

const FarmAvatar = ({ rank, farmName }: FarmAvatarProps) => {
	return (
		<div className="flex flex-col items-center gap-2 max-w-[80px]">
			<div className="w-15 h-15 bg-[#D9D9D9] rounded-full"></div>
			<div className="text-center flex">
				<span className="text-sm font-semibold text-[#262626]">{rank}</span>
				<span className="text-sm font-medium text-[#262626] ml-0.5 truncate block">
					{farmName}
				</span>
			</div>
		</div>
	);
};

export default FarmAvatar;
