"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface BestFarmCardProps {
  id: number;
  name: string;
  rank: number | null;
  isFollowing: boolean;
  farmImage?: string | null;
  onFollowToggle?: (id: number) => void;
}

const BestFarmCard = ({
  id,
  name,
  rank,
  isFollowing,
  farmImage,
  onFollowToggle,
}: BestFarmCardProps) => {
  const router = useRouter();

  const handleFarmProfileClick = () => {
    router.push(`/farms/${id}`);
  };

  const handleFollowClick = () => {
    onFollowToggle?.(id);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <button
        type="button"
        onClick={handleFarmProfileClick}
        className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-70 transition-opacity"
        aria-label={`${name} 농장 프로필 보기`}
      >
        <span className="text-sm text-[#262626] min-w-[24px] text-right">
          {rank}
        </span>
        <div className="w-[55px] h-[55px] bg-white border border-[#D9D9D9] rounded-full flex-shrink-0 relative overflow-hidden">
          {farmImage ? (
            <Image src={farmImage} alt={name} fill className="object-cover" />
          ) : null}
        </div>
        <div className="text-sm text-[#262626]">{name}</div>
      </button>
      <button
        type="button"
        onClick={handleFollowClick}
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

export default BestFarmCard;
