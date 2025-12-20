"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BentRightDownIcon from "@/assets/icon/ic_bent_right_down_black_24.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightWhiteIcon from "@/assets/icon/ic_chevron_right_white_24.svg";
import LikeIcon from "@/assets/icon/ic_like_grey_15.svg";
import LocationIcon from "@/assets/icon/ic_location_pin_grey_15.svg";
import StarIcon from "@/assets/icon/ic_star_lightgreen_15.svg";
import ProductCard from "@/components/ProductCard";
import ProfileImageViewer from "@/components/ProfileImageViewer";
import ReviewImageViewer from "@/components/ReviewImageViewer";
import {
  useFarmProfile,
  useFollowedFarms,
  useInfiniteFarmNews,
  useToggleFollowFarm,
} from "@/lib/api/hooks/use-best-farms";
import { useInfiniteSellerProducts } from "@/lib/api/hooks/use-products";
import { useSellerReviews } from "@/lib/api/hooks/use-reviews";
import type { Product } from "@/lib/api/products";
import type { SellerReview } from "@/lib/api/reviews";

interface NewsPost {
  id: number;
  farmName: string;
  date: string;
  title: string;
  content: string;
  images?: string[];
  url?: string;
}

const FarmProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const farmId = params.id as string;
  const numericFarmId = parseInt(farmId, 10);
  const [activeTab, setActiveTab] = useState<"news" | "products" | "reviews">(
    "news"
  );
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [needsExpandButton, setNeedsExpandButton] = useState<Set<number>>(
    new Set()
  );
  const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
  const contentRefs = useRef<{ [key: number]: HTMLParagraphElement | null }>(
    {}
  );

  // 농장 프로필 조회
  const { data: farmProfile, isLoading: isLoadingProfile } = useFarmProfile({
    farm_id: numericFarmId,
  });

  // is_own_farm이 true이면 비즈프로필로 리다이렉트
  useEffect(() => {
    if (farmProfile?.is_own_farm) {
      router.replace("/account/business");
    }
  }, [farmProfile?.is_own_farm, router]);

  // 농장 소식 목록 조회 (무한 스크롤)
  const {
    data: farmNewsData,
    isLoading: isLoadingNews,
    fetchNextPage: fetchNextNewsPage,
    hasNextPage: hasNextNewsPage,
    isFetchingNextPage: isFetchingNextNewsPage,
  } = useInfiniteFarmNews({
    farm_id: numericFarmId,
  });
  const newsObserverTarget = useRef<HTMLDivElement>(null);

  // 농장 상품 목록 조회 (무한 스크롤, 상품 탭이 활성화되었을 때만 요청)
  const {
    data: farmProductsData,
    isLoading: isLoadingProducts,
    fetchNextPage: fetchNextProductsPage,
    hasNextPage: hasNextProductsPage,
    isFetchingNextPage: isFetchingNextProductsPage,
  } = useInfiniteSellerProducts({
      farm_id: numericFarmId,
      enabled: activeTab === "products",
    });
  const productsObserverTarget = useRef<HTMLDivElement>(null);

  // 농장 리뷰 목록 조회 (후기 탭이 활성화되었을 때만 요청)
  const { data: farmReviewsData, isLoading: isLoadingReviews } =
    useSellerReviews({
      farm_id: numericFarmId,
      enabled: activeTab === "reviews",
    });

  // 팔로우한 농장 목록 조회 (팔로우 상태 확인용)
  const { data: followedFarmsData } = useFollowedFarms();

  // 팔로우 토글 mutation
  const toggleFollowMutation = useToggleFollowFarm();

  // 팔로우 상태 확인
  const isFollowing =
    followedFarmsData?.results.some((farm) => farm.id === numericFarmId) ??
    false;

  // 농장 데이터 (API 데이터 또는 기본값)
  const farmData = farmProfile
    ? {
        id: farmProfile.id,
        name: farmProfile.farm_name,
        description: farmProfile.farm_description,
        location: farmProfile.location,
        followerCount: farmProfile.follower_count,
        profileImage: farmProfile.farm_image_url || "",
        isCertified: false, // API 응답에 없으므로 기본값
        rating: 0, // API 응답에 없으므로 기본값
        reviewCount: 0, // API 응답에 없으므로 기본값
      }
    : {
        id: numericFarmId,
        name: "",
        description: "",
        location: "",
        followerCount: 0,
        profileImage: "",
        isCertified: false,
        rating: 0,
        reviewCount: 0,
      };

  const handleTabClick = (tab: "news" | "products" | "reviews") => {
    setActiveTab(tab);
  };

  const handleToggleExpand = (postId: number) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleFollowToggle = () => {
    toggleFollowMutation.mutate(numericFarmId);
  };

  // 날짜 포맷팅 함수
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }, []);

  // 모든 페이지의 소식 데이터를 평탄화
  const allNewsData = useMemo(() => {
    if (!farmNewsData?.pages) return [];
    return farmNewsData.pages
      .flatMap((page) => page?.results || [])
      .filter((news) => news !== undefined && news !== null);
  }, [farmNewsData]);

  // API 데이터를 NewsPost 형식으로 변환
  const newsPosts: NewsPost[] = useMemo(() => {
    if (!allNewsData || allNewsData.length === 0) return [];

    return allNewsData.map((news) => ({
      id: news.id,
      farmName: news.farm_name,
      date: formatDate(news.created_at),
      title: news.title,
      content: news.content,
      images:
        news.images && news.images.length > 0
          ? news.images.map((img) => img.image_url)
          : undefined,
    }));
  }, [allNewsData, formatDate]);

  // 모든 페이지의 상품 데이터를 평탄화
  const allProductsData = useMemo(() => {
    if (!farmProductsData?.pages) return [];
    return farmProductsData.pages
      .flatMap((page) => page?.results || [])
      .filter((product) => product !== undefined && product !== null);
  }, [farmProductsData]);

  // Intersection Observer로 무한 스크롤 구현 (소식)
  useEffect(() => {
    if (activeTab !== "news" || !hasNextNewsPage || isFetchingNextNewsPage)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextNewsPage &&
          !isFetchingNextNewsPage
        ) {
          fetchNextNewsPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = newsObserverTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [activeTab, hasNextNewsPage, isFetchingNextNewsPage, fetchNextNewsPage]);

  // Intersection Observer로 무한 스크롤 구현 (상품)
  useEffect(() => {
    if (
      activeTab !== "products" ||
      !hasNextProductsPage ||
      isFetchingNextProductsPage
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextProductsPage &&
          !isFetchingNextProductsPage
        ) {
          fetchNextProductsPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentTarget = productsObserverTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [
    activeTab,
    hasNextProductsPage,
    isFetchingNextProductsPage,
    fetchNextProductsPage,
  ]);

  useEffect(() => {
    const checkOverflow = () => {
      const newNeedsExpandButton = new Set<number>();
      Object.entries(contentRefs.current).forEach(([postId, element]) => {
        if (element) {
          const scrollHeight = element.scrollHeight;
          const clientHeight = element.clientHeight;
          if (scrollHeight > clientHeight + 1) {
            newNeedsExpandButton.add(Number(postId));
          }
        }
      });
      setNeedsExpandButton(newNeedsExpandButton);
    };

    const timeoutId = setTimeout(checkOverflow, 0);
    window.addEventListener("resize", checkOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkOverflow);
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 - 메뉴 버튼 없음 */}
      <div className="sticky top-0 z-20 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">농장 프로필</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 농장 프로필 정보 섹션 */}
      {isLoadingProfile ? (
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
          </div>
        </div>
      ) : farmProfile ? (
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <div className="flex gap-6">
            {/* 프로필 이미지 */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsProfileViewerOpen(true);
              }}
              className="relative w-24 h-24 rounded-full bg-[#D9D9D9] flex-shrink-0 overflow-hidden cursor-pointer"
              aria-label={`${farmData.name} 프로필 이미지 확대 보기`}
            >
              {farmData.profileImage && (
                <Image
                  src={farmData.profileImage}
                  alt={`${farmData.name} 프로필`}
                  fill
                  className="object-cover pointer-events-none"
                />
              )}
            </button>

            {/* 농장 정보 */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#262626]">
                  {farmData.name}
                </h2>
                {farmData.isCertified && (
                  <div className="px-2 py-0.5 bg-[#E6F5E9] rounded-[3px]">
                    <p className="text-[10px] font-medium text-[#133A1B]">
                      인증
                    </p>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-[#8C8C8C]">
                {farmData.description}
              </p>
              <div className="flex items-center gap-1">
                <LocationIcon />
                <span className="text-xs text-[#595959]">
                  {farmData.location}
                </span>
              </div>
              {farmProfile.average_rating !== undefined &&
                farmProfile.total_review_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <StarIcon />
                    <span className="text-xs text-[#595959]">
                      {parseFloat(farmProfile.average_rating).toFixed(1)} (
                      {farmProfile.total_review_count.toLocaleString()})
                    </span>
                  </div>
                )}
              <div className="flex items-center gap-1">
                <LikeIcon />
                <span className="text-xs text-[#595959]">
                  팔로워 {farmData.followerCount.toLocaleString()}명
                </span>
              </div>
            </div>
          </div>
          {/* 팔로우 버튼 */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleFollowToggle}
              disabled={toggleFollowMutation.isPending}
              className={`w-full py-3 text-base font-semibold transition-colors ${
                isFollowing
                  ? "bg-[#E5E5E5] text-[#262626]"
                  : "bg-[#133A1B] text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {toggleFollowMutation.isPending
                ? "처리 중..."
                : isFollowing
                ? "팔로잉"
                : "팔로우"}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-[#8C8C8C]">
              농장 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      )}

      {/* 탭 내비게이션 */}
      <div className="sticky top-[52px] z-20 bg-white border-b-2 border-[#E5E5E5]">
        <div className="flex">
          <button
            type="button"
            onClick={() => handleTabClick("news")}
            className={`flex-1 py-4 text-sm font-medium relative ${
              activeTab === "news" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="소식"
          >
            소식
            {activeTab === "news" && (
              <div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("products")}
            className={`flex-1 py-4 text-sm font-medium relative ${
              activeTab === "products" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="상품"
          >
            상품
            {activeTab === "products" && (
              <div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("reviews")}
            className={`flex-1 py-4 text-sm font-medium relative ${
              activeTab === "reviews" ? "text-[#133A1B]" : "text-[#8C8C8C]"
            }`}
            aria-label="후기"
          >
            후기
            {activeTab === "reviews" && (
              <div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#133A1B] z-10" />
            )}
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1">
        {activeTab === "news" && (
          <div className="flex flex-col">
            {isLoadingNews ? (
              <div className="px-5 py-10 flex items-center justify-center">
                <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
              </div>
            ) : newsPosts.length > 0 ? (
              <>
                {newsPosts.map((post, index) => (
                <div key={post.id}>
                  <div className="px-5 py-4">
                    <div className="flex gap-3 mb-3">
                      {/* 프로필 이미지 */}
                      <div className="relative w-10 h-10 rounded-full bg-[#D9D9D9] flex-shrink-0 overflow-hidden">
                        {farmData.profileImage && (
                          <Image
                            src={farmData.profileImage}
                            alt={`${post.farmName} 프로필`}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-sm font-semibold text-[#262626]">
                          {post.farmName}
                        </span>
                        <span className="text-xs text-[#8C8C8C]">
                          {post.date}
                        </span>
                      </div>
                    </div>
                    <div className="mb-5">
                      <h3 className="font-medium text-[#262626] mb-2">
                        {post.title}
                      </h3>
                      <div className="relative">
                        <p
                          ref={(el) => {
                            contentRefs.current[post.id] = el;
                          }}
                          className={`text-sm text-[#262626] whitespace-pre-line ${
                            expandedPosts.has(post.id) ? "" : "line-clamp-5"
                          }`}
                        >
                          {post.content}
                        </p>
                        {needsExpandButton.has(post.id) && (
                          <button
                            type="button"
                            onClick={() => handleToggleExpand(post.id)}
                            className="mt-2 text-sm text-[#8C8C8C] cursor-pointer"
                            aria-label={
                              expandedPosts.has(post.id) ? "접기" : "더보기"
                            }
                          >
                            {expandedPosts.has(post.id) ? "접기" : "더보기"}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* 이미지가 있는 경우 */}
                    {post.images && post.images.length > 0 && (
                      <NewsImageCarousel
                        images={post.images}
                        title={post.title}
                      />
                    )}
                  </div>
                  {index < newsPosts.length - 1 && (
                    <div className="h-[10px] bg-[#F7F7F7]" />
                  )}
                </div>
                ))}
                {/* 무한 스크롤 감지용 요소 */}
                {hasNextNewsPage && (
                  <div
                    ref={newsObserverTarget}
                    className="h-10 flex items-center justify-center"
                  >
                    {isFetchingNextNewsPage && (
                      <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="px-5 py-10 flex items-center justify-center">
                <p className="text-sm text-[#8C8C8C]">
                  등록된 소식이 없습니다.
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "products" && (
          <div className="px-5 py-8">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
              </div>
            ) : allProductsData && allProductsData.length > 0 ? (
              <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
                  {allProductsData.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    farmId={farmData.id}
                    farmName={farmData.name}
                  />
                ))}
              </div>
                {/* 무한 스크롤 감지용 요소 */}
                {hasNextProductsPage && (
                  <div
                    ref={productsObserverTarget}
                    className="h-10 flex items-center justify-center"
                  >
                    {isFetchingNextProductsPage && (
                      <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-[#8C8C8C]">
                  등록된 상품이 없습니다.
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <FarmReviewsTab
            reviewsData={farmReviewsData}
            isLoading={isLoadingReviews}
            farmProfileImage={farmData.profileImage}
          />
        )}
      </div>

      {/* 프로필 이미지 뷰어 */}
      <ProfileImageViewer
        imageUrl={farmData.profileImage || ""}
        alt={`${farmData.name} 프로필`}
        isOpen={isProfileViewerOpen}
        onClose={() => setIsProfileViewerOpen(false)}
      />
    </div>
  );
};

// 소식 게시물 이미지 캐러셀 컴포넌트
interface NewsImageCarouselProps {
  images: string[];
  title: string;
}

const NewsImageCarousel = ({ images, title }: NewsImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full aspect-square bg-[#D9D9D9] rounded overflow-hidden mb-3">
      {/* 이미지 카운터 - 적응형 글래스모피즘 */}
      {images.length > 1 && (
        <div className="absolute top-[14px] left-[20px] z-[5]">
          <div className="backdrop-blur-md bg-black/40 border border-black/20 text-white text-sm px-3 py-1.5 rounded-full shadow-lg">
            <span className="font-medium tracking-wide drop-shadow-sm">
              {selectedIndex + 1}/{images.length}
            </span>
          </div>
        </div>
      )}

      {/* 좌측 네비게이션 버튼 - 이미지가 2개 이상일 때만 표시 */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-[20px] top-1/2 transform -translate-y-1/2 z-[5] w-10 h-10 backdrop-blur-md bg-black/40 border border-black/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-200 group"
          aria-label="이전 이미지"
        >
          <ChevronRightWhiteIcon className="rotate-180 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
        </button>
      )}

      {/* 우측 네비게이션 버튼 - 이미지가 2개 이상일 때만 표시 */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-[20px] top-1/2 transform -translate-y-1/2 z-[5] w-10 h-10 backdrop-blur-md bg-black/40 border border-black/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/50 hover:scale-105 transition-all duration-200 group"
          aria-label="다음 이미지"
        >
          <ChevronRightWhiteIcon className="group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" />
        </button>
      )}

      {/* 캐러셀 컨테이너 */}
      <div className="embla overflow-hidden h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {images.map((image) => (
            <div
              key={image}
              className="embla__slide flex-[0_0_100%] min-w-0 pl-0 h-full"
            >
              <div className="w-full h-full relative">
                <Image
                  width={640}
                  height={640}
                  src={image}
                  alt={`${title} 이미지`}
                  className="w-full h-full object-cover block"
                  style={{ minHeight: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 농장 프로필 후기 탭 컴포넌트
interface FarmReviewsTabProps {
  reviewsData?: SellerReview[];
  isLoading: boolean;
  farmProfileImage?: string;
}

const FarmReviewsTab = ({
  reviewsData,
  isLoading,
  farmProfileImage,
}: FarmReviewsTabProps) => {
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 이미지 URL 처리 함수
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      return imageUrl;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${imageUrl}`;
  };

  // 별점 렌더링 함수
  const renderStars = (rating: number, reviewId: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={`star-${reviewId}-${i}`}
          className={i < rating ? "" : "opacity-30"}
        />
      );
    }
    return stars;
  };

  const handleImageClick = (imageUrl: string) => {
    if (imageUrl) {
      setViewerImages([imageUrl]);
      setViewerInitialIndex(0);
      setIsViewerOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="px-5 py-10 flex items-center justify-center">
        <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
      </div>
    );
  }

  if (!reviewsData || reviewsData.length === 0) {
    return (
      <div className="px-5 py-10 flex items-center justify-center">
        <p className="text-sm text-[#8C8C8C]">등록된 후기가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* 리뷰 목록 */}
      <div className="flex flex-col divide-y divide-[#D9D9D9]">
        {reviewsData.map((review) => {
          const reviewImageUrl = getImageUrl(review.image_url);
          return (
            <div key={review.id}>
              <div className="px-5 py-4">
                {/* 사용자명 */}
                <div className="mb-2">
                  <span className="text-sm font-medium text-[#262626]">
                    {review.user_name}
                  </span>
                </div>

                {/* 별점과 날짜 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating, review.id)}
                  </div>
                  <span className="text-xs text-[#8C8C8C]">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {/* 상품명 */}
                <div className="mb-3">
                  <span className="text-sm text-[#8C8C8C]">
                    {review.product_name}
                  </span>
                </div>

                {/* 상품 이미지 */}
                {reviewImageUrl && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => handleImageClick(reviewImageUrl)}
                      className="relative w-20 h-20 bg-[#D9D9D9] rounded flex-shrink-0 cursor-pointer overflow-hidden"
                      aria-label={`${review.user_name} 리뷰 이미지 보기`}
                    >
                      <Image
                        src={reviewImageUrl}
                        alt={`${review.user_name} 리뷰 이미지`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  </div>
                )}

                {/* 후기 내용 */}
                <p className="text-sm text-[#262626] leading-relaxed mb-3">
                  {review.review_content}
                </p>

                {/* 답변 (있는 경우) */}
                {review.reply && (
                  <div className="mt-3">
                    <div className="flex items-start gap-2 mb-2">
                      {/* 휘어있는 아이콘 */}
                      <div className="flex-shrink-0 mt-0.5">
                        <BentRightDownIcon />
                      </div>
                      {/* 프로필 이미지와 농장명 */}
                      <div className="flex items-center gap-2">
                        {/* 농장 아바타 */}
                        <div className="w-8 h-8 rounded-full bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                          {review.reply.farm_image ? (
                            <Image
                              src={
                                getImageUrl(review.reply.farm_image) ||
                                farmProfileImage ||
                                ""
                              }
                              alt={review.reply.farm_name}
                              fill
                              className="object-cover"
                            />
                          ) : farmProfileImage ? (
                            <Image
                              src={farmProfileImage}
                              alt={review.reply.farm_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#D9D9D9]" />
                          )}
                        </div>
                        {/* 농장명 */}
                        <span className="text-sm font-medium text-[#262626]">
                          {review.reply.farm_name}
                        </span>
                      </div>
                    </div>
                    {/* 답변 내용 (회색 배경 박스) */}
                    <div className="ml-[32px] bg-[#F5F5F5] rounded p-3">
                      <p className="text-sm text-[#262626] leading-relaxed whitespace-pre-line">
                        {review.reply.reply_content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 전체화면 이미지 뷰어 */}
      <ReviewImageViewer
        images={viewerImages}
        initialIndex={viewerInitialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

export default FarmProfilePage;
