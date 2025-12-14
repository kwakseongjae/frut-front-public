"use client";

import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import FarmCard from "@/components/FarmCard";
import {
  useFollowedFarms,
  useToggleFollowFarm,
} from "@/lib/api/hooks/use-best-farms";

export default function FarmsPage() {
  // 팔로우한 농장 목록 조회
  const { data: followedFarmsData, isLoading } = useFollowedFarms();

  // 팔로우 토글 mutation
  const toggleFollowMutation = useToggleFollowFarm();

  const handleFollowToggle = (id: number) => {
    toggleFollowMutation.mutate(id);
  };

  const farms = followedFarmsData?.results || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">팔로우 농장</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 농장 목록 영역 */}
      {isLoading ? (
        <div className="px-5 py-4 flex items-center justify-center">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
        </div>
      ) : farms.length > 0 ? (
        <div className="px-5 py-4 flex flex-col divide-y divide-[#D9D9D9]">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              id={farm.id}
              name={farm.farm_name}
              farmImage={farm.farm_image}
              isFollowing={true}
              onFollowToggle={handleFollowToggle}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-20 flex flex-col items-center justify-center text-center">
          <p className="font-medium text-[#8C8C8C]">
            팔로우한 농장이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
