"use client";

interface FarmCardProps {
  id: number;
  name: string;
  isFollowing?: boolean;
}

const FarmCard = ({ id, name, isFollowing = false }: FarmCardProps) => {
  return (
    <div className="flex items-center justify-between py-4 px-2">
      <p className="font-semibold text-[#262626]">{id}</p>
      <div className="flex items-center space-x-4 flex-1 ml-5">
        <div className="w-[70px] h-[70px] bg-[#D9D9D9] rounded-full"></div>
        <div className="text-sm font-semibold text-[#262626]">{name}</div>
      </div>
      <button className="rounded-sm cursor-pointer py-[6px] px-5 text-xs font-semibold text-[#262626] bg-[#F5F5F5]">
        {isFollowing ? "팔로잉" : "팔로우"}
      </button>
    </div>
  );
};

export default FarmCard;
