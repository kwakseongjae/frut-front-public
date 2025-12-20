"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import FarmCard from "@/components/FarmCard";
import { useInfiniteFollowedFarms } from "@/lib/api/hooks/use-best-farms";
import { sellersApi } from "@/lib/api/sellers";

export default function FarmsPage() {
  // 팔로우한 농장 목록 조회 (무한 스크롤)
  const {
    data: followedFarmsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFollowedFarms();
  const observerTarget = useRef<HTMLDivElement>(null);

  // 팔로우 농장 페이지 전용 mutation (쿼리 무효화 없음)
  const toggleFollowMutation = useMutation({
    mutationFn: (farmId: number) => sellersApi.toggleFollowFarm(farmId),
    onSuccess: () => {
      // 팔로우 농장 페이지에서는 쿼리 무효화하지 않음
      // 화면 재진입 시에만 리스트가 업데이트됨
    },
  });

  // 로컬 팔로우 상태 관리 (팔로우 취소 시 즉시 제거하지 않기 위해)
  const [localFollowStates, setLocalFollowStates] = useState<
    Record<number, boolean>
  >({});

  // 모든 페이지의 데이터를 평탄화
  const allFarms = useMemo(() => {
    if (!followedFarmsData?.pages) return [];
    return followedFarmsData.pages
      .flatMap((page) => page?.results || [])
      .filter((farm) => farm !== undefined && farm !== null);
  }, [followedFarmsData]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 팔로우 상태 결정: 로컬 상태가 있으면 로컬 상태 사용, 없으면 API 데이터 사용
  const getFollowState = (farmId: number) => {
    if (farmId in localFollowStates) {
      return localFollowStates[farmId];
    }
    return true; // API에서 가져온 데이터는 모두 팔로우 상태
  };

  const handleFollowToggle = (id: number) => {
    const currentState = getFollowState(id);
    const newState = !currentState;

    // 로컬 상태 먼저 업데이트 (즉시 UI 반영)
    setLocalFollowStates((prev) => ({
      ...prev,
      [id]: newState,
    }));

    // API 호출 (쿼리 무효화 없음)
    toggleFollowMutation.mutate(id);
  };

  // 팔로우 취소한 농장도 리스트에 유지 (로컬 상태가 false인 경우도 표시)
  const farms = useMemo(() => {
    return allFarms;
  }, [allFarms]);

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
        <>
        <div className="px-5 py-4 flex flex-col divide-y divide-[#D9D9D9]">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              id={farm.id}
              name={farm.farm_name}
              farmImage={farm.farm_image}
              isFollowing={getFollowState(farm.id)}
              onFollowToggle={handleFollowToggle}
            />
          ))}
        </div>
          {/* 무한 스크롤 감지용 요소 */}
          {hasNextPage && (
            <div
              ref={observerTarget}
              className="h-10 flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
              )}
            </div>
          )}
        </>
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
