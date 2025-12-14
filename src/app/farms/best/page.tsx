"use client";

import { useMemo } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import BestFarmCard from "@/components/BestFarmCard";
import {
  useBestFarmsAllInfinite,
  useToggleFollowFarm,
} from "@/lib/api/hooks/use-best-farms";

export default function BestFarmsPage() {
  // 베스트 농장 전체 목록 조회 (무한 스크롤)
  const {
    data: bestFarmsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBestFarmsAllInfinite(100);

  // 팔로우 토글 mutation
  const toggleFollowMutation = useToggleFollowFarm();

  // 스켈레톤 로딩용 고유 ID 생성
  const skeletonIds = useMemo(
    () => Array.from({ length: 8 }, () => crypto.randomUUID()),
    []
  );

  // 모든 페이지의 결과를 하나의 배열로 합치기
  const allFarms = useMemo(() => {
    if (!bestFarmsData?.pages) return [];
    return bestFarmsData.pages.flatMap((page) => page.results);
  }, [bestFarmsData]);

  const handleFollowToggle = (id: number) => {
    toggleFollowMutation.mutate(id);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

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
          <h1 className="text-lg font-semibold text-[#262626]">
            이달의 베스트 농장
          </h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 농장 목록 영역 */}
      {isLoading ? (
        <div className="px-5 py-4 flex flex-col divide-y divide-[#E5E5E5]">
          {skeletonIds.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between py-4 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-4 h-4 bg-[#D9D9D9] rounded" />
                <div className="w-[55px] h-[55px] bg-[#D9D9D9] rounded-full" />
                <div className="w-20 h-4 bg-[#D9D9D9] rounded" />
              </div>
              <div className="w-16 h-8 bg-[#D9D9D9] rounded" />
            </div>
          ))}
        </div>
      ) : allFarms.length > 0 ? (
        <>
          <div className="px-5 py-4 flex flex-col divide-y divide-[#E5E5E5]">
            {allFarms.map((farm, index) => (
              <BestFarmCard
                key={farm.farm_id}
                id={farm.farm_id}
                name={farm.farm_name}
                rank={farm.rank ?? index + 1}
                isFollowing={farm.is_following}
                farmImage={farm.farm_image}
                onFollowToggle={handleFollowToggle}
              />
            ))}
          </div>
          {hasNextPage && (
            <div className="px-5 py-4 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="px-6 py-2 text-sm font-semibold text-[#133A1B] border border-[#133A1B] rounded hover:bg-[#133A1B] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="더보기"
              >
                {isFetchingNextPage ? "로딩 중..." : "더보기"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="px-5 py-4 flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-[#8C8C8C]">농장 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
