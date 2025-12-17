"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BentRightDownIcon from "@/assets/icon/ic_bent_right_down_black_24.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightWhiteIcon from "@/assets/icon/ic_chevron_right_white_24.svg";
import CloseIcon from "@/assets/icon/ic_close_black_24.svg";
import DotMenuIcon from "@/assets/icon/ic_dot_menu_grey_14.svg";
import InternetIcon from "@/assets/icon/ic_internet_grey_16.svg";
import LikeIcon from "@/assets/icon/ic_like_grey_15.svg";
import LocationIcon from "@/assets/icon/ic_location_pin_grey_15.svg";
import MenuIcon from "@/assets/icon/ic_menu_24.svg";
import EmptyStarIcon from "@/assets/icon/ic_star_grey_18.svg";
import StarIcon from "@/assets/icon/ic_star_lightgreen_15.svg";
import StarLightGreenIcon from "@/assets/icon/ic_start_lightgreen_18.svg";
import ProductCard from "@/components/ProductCard";
import ProfileImageViewer from "@/components/ProfileImageViewer";
import ReviewImageViewer from "@/components/ReviewImageViewer";
import { useAuth } from "@/contexts/AuthContext";
import {
  useDeleteNews,
  useMyFarmNews,
  useMySellerProfile,
} from "@/lib/api/hooks/use-best-farms";
import { useMySellerItems } from "@/lib/api/hooks/use-products";
import {
  useCreateReviewReply,
  useMySellerReviews,
} from "@/lib/api/hooks/use-reviews";
import type { SellerReview } from "@/lib/api/reviews";
import type { FarmNews } from "@/lib/api/sellers";

interface NewsPost {
  id: number;
  farmName: string;
  date: string;
  title: string;
  content: string;
  images?: string[];
  url?: string;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  content: string;
  images?: string[];
  productName: string;
  reply?: {
    id: number;
    reply_content: string;
    created_at: string;
    farm_id?: number;
    farm_name: string;
    farm_image?: string;
  } | null;
}

const BusinessProfilePage = () => {
  const router = useRouter();
  const { user, isInitialized, isLoggedIn } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } =
    useMySellerProfile();
  const { data: newsData, isLoading: isNewsLoading } = useMyFarmNews();
  const { data: productsData, isLoading: isProductsLoading } =
    useMySellerItems();
  const [activeTab, setActiveTab] = useState<"news" | "products" | "reviews">(
    "news"
  );
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [needsExpandButton, setNeedsExpandButton] = useState<Set<number>>(
    new Set()
  );
  const [reviewFilterType, setReviewFilterType] = useState<
    "all" | "photo" | "text"
  >("all");
  const [reviewSortBy, setReviewSortBy] = useState<"latest" | "rating">(
    "latest"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
  const [openNewsMenuId, setOpenNewsMenuId] = useState<number | null>(null);
  const contentRefs = useRef<{ [key: number]: HTMLParagraphElement | null }>(
    {}
  );

  // 접근 제어: 초기화 완료 후, 로그인되어 있고, user가 로드되었을 때만 체크
  useEffect(() => {
    // 초기화가 완료되지 않았거나 로그인하지 않은 경우 대기
    if (!isInitialized || !isLoggedIn) {
      return;
    }

    // user가 아직 로드되지 않은 경우 대기 (로그인은 되어있지만 user 정보가 없는 경우)
    if (!user) {
      return;
    }

    // SELLER가 아니면 접근 차단
    if (user.user_type !== "SELLER") {
      alert("판매자 권한이 없습니다.");
      router.replace("/account");
    }
  }, [isInitialized, isLoggedIn, user, router]);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileEdit = () => {
    setIsSidebarOpen(false);
    router.push("/account/business/edit");
  };

  const handleWriteNews = () => {
    setIsSidebarOpen(false);
    router.push("/account/business/news/write");
  };

  const deleteNewsMutation = useDeleteNews();

  const handleDeleteNews = async (newsId: number) => {
    setOpenNewsMenuId(null);
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (confirmed) {
      try {
        await deleteNewsMutation.mutateAsync(newsId);
        alert("소식이 삭제되었습니다.");
      } catch (error) {
        console.error("소식 삭제 실패:", error);
        alert("소식 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleSettlement = () => {
    setIsSidebarOpen(false);
    router.push("/account/business/settlement");
  };

  const handleProductManagement = () => {
    setIsSidebarOpen(false);
    router.push("/account/business/products");
  };

  const handleOrderManagement = () => {
    setIsSidebarOpen(false);
    router.push("/account/business/orders");
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

  // API 데이터를 NewsPost 형식으로 변환
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const newsPosts: NewsPost[] =
    newsData?.map((news: FarmNews) => ({
      id: news.id,
      farmName: news.farm_name,
      date: formatDate(news.created_at),
      title: news.title,
      content: news.content,
      images:
        news.images && news.images.length > 0
          ? news.images.map((img) => img.image_url)
          : undefined,
    })) || [];

  useEffect(() => {
    const checkOverflow = () => {
      const newNeedsExpandButton = new Set<number>();
      Object.entries(contentRefs.current).forEach(([postId, element]) => {
        if (element) {
          // line-clamp가 적용된 상태에서 실제 내용 높이와 표시 높이 비교
          const scrollHeight = element.scrollHeight;
          const clientHeight = element.clientHeight;
          // 약간의 여유를 두고 비교 (1px 정도의 오차 허용)
          if (scrollHeight > clientHeight + 1) {
            newNeedsExpandButton.add(Number(postId));
          }
        }
      });
      setNeedsExpandButton(newNeedsExpandButton);
    };

    // DOM이 렌더링된 후 체크
    const timeoutId = setTimeout(checkOverflow, 0);
    window.addEventListener("resize", checkOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkOverflow);
    };
  });

  // 초기화 중이거나 로그인하지 않았거나 user가 아직 로드되지 않은 경우 로딩 표시
  if (!isInitialized || !isLoggedIn || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
        </div>
      </div>
    );
  }

  // SELLER가 아니면 접근 차단 (이미 useEffect에서 처리되지만, 렌더링 방지)
  if (user.user_type !== "SELLER") {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-[#262626]">비즈프로필</h1>
        </div>
        <button
          type="button"
          onClick={handleMenuClick}
          className="p-1 cursor-pointer"
          aria-label="메뉴"
        >
          <MenuIcon />
        </button>
      </div>

      {/* 비즈프로필 정보 섹션 */}
      <div className="px-5 py-4 border-b border-[#E5E5E5]">
        {isProfileLoading ? (
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-full bg-[#D9D9D9] flex-shrink-0 animate-pulse" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 bg-[#D9D9D9] rounded w-32 animate-pulse" />
              <div className="h-4 bg-[#D9D9D9] rounded w-full animate-pulse" />
              <div className="h-4 bg-[#D9D9D9] rounded w-24 animate-pulse" />
            </div>
          </div>
        ) : profileData ? (
          <div className="flex gap-6">
            {/* 프로필 이미지 */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsProfileViewerOpen(true);
              }}
              className="w-24 h-24 rounded-full bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden cursor-pointer z-10"
              aria-label="프로필 이미지 확대 보기"
            >
              {profileData.farm_image_url && (
                <Image
                  src={profileData.farm_image_url}
                  alt={`${profileData.farm_name} 프로필`}
                  fill
                  className="object-cover pointer-events-none"
                />
              )}
            </button>

            {/* 농장 정보 */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#262626]">
                  {profileData.farm_name}
                </h2>
                <div className="px-2 py-0.5 bg-[#E6F5E9] rounded-[3px]">
                  <p className="text-[10px] font-medium text-[#133A1B]">인증</p>
                </div>
              </div>
              {profileData.farm_description && (
                <p className="text-sm font-medium text-[#8C8C8C]">
                  {profileData.farm_description}
                </p>
              )}
              {profileData.location && (
                <div className="flex items-center gap-1">
                  <LocationIcon />
                  <span className="text-xs text-[#595959]">
                    {profileData.location}
                  </span>
                </div>
              )}
              {profileData.average_rating !== undefined &&
                profileData.total_review_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <StarIcon />
                    <span className="text-xs text-[#595959]">
                      {parseFloat(profileData.average_rating).toFixed(1)} (
                      {profileData.total_review_count.toLocaleString()})
                    </span>
                  </div>
                )}
              <div className="flex items-center gap-1">
                <LikeIcon />
                <span className="text-xs text-[#595959]">
                  팔로워 {profileData.follower_count.toLocaleString()}명
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 탭 내비게이션 */}
      <div className="sticky top-[52px] z-10 bg-white border-b-2 border-[#E5E5E5]">
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
            {isNewsLoading ? (
              <div className="px-5 py-4">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex-shrink-0 animate-pulse" />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="h-4 bg-[#D9D9D9] rounded w-24 animate-pulse" />
                    <div className="h-3 bg-[#D9D9D9] rounded w-16 animate-pulse" />
                  </div>
                </div>
                <div className="h-5 bg-[#D9D9D9] rounded w-32 mb-2 animate-pulse" />
                <div className="h-4 bg-[#D9D9D9] rounded w-full mb-1 animate-pulse" />
                <div className="h-4 bg-[#D9D9D9] rounded w-full animate-pulse" />
              </div>
            ) : newsPosts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[#8C8C8C]">
                  등록된 소식이 없습니다.
                </p>
              </div>
            ) : (
              newsPosts.map((post, index) => {
                const newsItem = newsData?.find((n) => n.id === post.id);
                return (
                  <div key={post.id}>
                    <div className="px-5 py-4">
                      <div className="flex gap-3 mb-3 relative">
                        {/* 프로필 이미지 */}
                        {newsItem?.farm_image ? (
                          <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex-shrink-0 relative overflow-hidden">
                            <Image
                              src={newsItem.farm_image}
                              alt={`${post.farmName} 프로필`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex-shrink-0" />
                        )}
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-sm font-semibold text-[#262626]">
                            {post.farmName}
                          </span>
                          <span className="text-xs text-[#8C8C8C]">
                            {post.date}
                          </span>
                        </div>
                        {/* 더보기 버튼 */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenNewsMenuId(
                                openNewsMenuId === post.id ? null : post.id
                              );
                            }}
                            className="p-1 cursor-pointer"
                            aria-label="더보기"
                          >
                            <DotMenuIcon className="rotate-90" />
                          </button>
                          {/* 드롭다운 모달 */}
                          {openNewsMenuId === post.id && (
                            <>
                              <button
                                type="button"
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenNewsMenuId(null)}
                                aria-label="메뉴 닫기"
                              />
                              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D9D9D9] rounded shadow-lg z-20 min-w-[120px]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenNewsMenuId(null);
                                    router.push(
                                      `/account/business/news/edit/${post.id}`
                                    );
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5] first:rounded-t last:rounded-b"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNews(post.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-[#F5F5F5] first:rounded-t last:rounded-b"
                                >
                                  삭제
                                </button>
                              </div>
                            </>
                          )}
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
                      {/* URL이 있는 경우 */}
                      {post.url && (
                        <>
                          <div className="w-full border-t border-[#D9D9D9] mb-3" />
                          <div className="flex items-center gap-1.5">
                            <InternetIcon />
                            <span className="text-sm text-[#8C8C8C]">
                              {post.url}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {index < newsPosts.length - 1 && (
                      <div className="h-[10px] bg-[#F7F7F7]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
        {activeTab === "products" && (
          <div className="px-5 py-8">
            {isProductsLoading ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
                {[1, 2, 3, 4].map((skeletonId) => (
                  <div
                    key={`product-skeleton-${skeletonId}`}
                    className="flex flex-col animate-pulse"
                  >
                    <div className="w-full aspect-[1/1] bg-[#D9D9D9] rounded" />
                    <div className="flex flex-col px-1 py-3 gap-2">
                      <div className="h-4 bg-[#D9D9D9] rounded w-24" />
                      <div className="h-5 bg-[#D9D9D9] rounded w-full" />
                      <div className="h-4 bg-[#D9D9D9] rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsData && productsData.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
                {productsData.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    hideCartButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#8C8C8C]">
                  등록된 상품이 없습니다.
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <BusinessReviewsTab
            filterType={reviewFilterType}
            sortBy={reviewSortBy}
            onFilterChange={setReviewFilterType}
            onSortChange={setReviewSortBy}
            profileData={profileData}
          />
        )}
      </div>

      {/* 사이드바 메뉴 */}
      <div
        className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* 백드롭 */}
        <button
          type="button"
          onClick={handleSidebarClose}
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-40" : "opacity-0"
          }`}
          aria-label="메뉴 닫기"
        />

        {/* 사이드바 */}
        <div
          className={`ml-auto h-full w-[280px] bg-white shadow-lg transform transition-transform duration-300 ease-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 사이드바 헤더 */}
          <div className="flex items-start p-5">
            <button
              type="button"
              onClick={handleSidebarClose}
              className="p-1 cursor-pointer"
              aria-label="메뉴 닫기"
            >
              <CloseIcon />
            </button>
          </div>

          {/* 메뉴 항목 */}
          <div className="flex flex-col pl-4">
            <button
              type="button"
              className="px-4 py-4 text-left text-base font-medium text-[#151313] hover:bg-[#F5F5F5] active:bg-[#F5F5F5] transition-colors rounded"
              onClick={handleProfileEdit}
            >
              프로필 수정
            </button>
            <button
              type="button"
              className="px-5 py-4 text-left text-base font-medium text-[#262626] hover:bg-[#F5F5F5] active:bg-[#F5F5F5] transition-colors rounded"
              onClick={handleProductManagement}
            >
              상품관리
            </button>
            <button
              type="button"
              className="px-5 py-4 text-left text-base font-medium text-[#262626] hover:bg-[#F5F5F5] active:bg-[#F5F5F5] transition-colors rounded"
              onClick={handleSettlement}
            >
              정산관리
            </button>
            <button
              type="button"
              className="px-5 py-4 text-left text-base font-medium text-[#262626] hover:bg-[#F5F5F5] active:bg-[#F5F5F5] transition-colors rounded"
              onClick={handleWriteNews}
            >
              소식작성
            </button>
            <button
              type="button"
              className="px-5 py-4 text-left text-base font-medium text-[#262626] hover:bg-[#F5F5F5] active:bg-[#F5F5F5] transition-colors rounded"
              onClick={handleOrderManagement}
            >
              주문관리
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 이미지 뷰어 */}
      <ProfileImageViewer
        imageUrl={profileData?.farm_image_url || ""}
        alt={`${profileData?.farm_name || ""} 프로필`}
        isOpen={isProfileViewerOpen}
        onClose={() => {
          setIsProfileViewerOpen(false);
        }}
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

// 비즈프로필 후기 탭 컴포넌트
interface BusinessReviewsTabProps {
  filterType: "all" | "photo" | "text";
  sortBy: "latest" | "rating";
  onFilterChange: (filterType: "all" | "photo" | "text") => void;
  onSortChange: (sortBy: "latest" | "rating") => void;
  profileData?: {
    farm_name: string;
    farm_image_url: string;
  } | null;
}

const BusinessReviewsTab = ({
  filterType: _filterType,
  sortBy: _sortBy,
  onFilterChange: _onFilterChange,
  onSortChange: _onSortChange,
  profileData,
}: BusinessReviewsTabProps) => {
  const { data: reviewsData, isLoading: isReviewsLoading } =
    useMySellerReviews();
  const createReplyMutation = useCreateReviewReply();
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // API 데이터를 Review 형식으로 변환
  const reviews: Review[] =
    reviewsData?.map((review: SellerReview) => ({
      id: review.id,
      userName: review.user_name,
      rating: review.rating,
      date: formatDate(review.created_at),
      content: review.review_content,
      images: review.image_url ? [review.image_url] : undefined,
      productName: review.product_name,
      reply: review.reply,
    })) || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <div key={index.toString()} className="w-4 h-4">
        {index < rating ? <StarLightGreenIcon /> : <EmptyStarIcon />}
      </div>
    ));
  };

  const handleImageClick = (images: string[], index: number) => {
    setViewerImages(images);
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  const handleReplyClick = (reviewId: number) => {
    setReplyingToId(reviewId);
    setReplyContent("");
  };

  const handleReplySubmit = async (reviewId: number) => {
    if (!replyContent.trim()) return;

    try {
      await createReplyMutation.mutateAsync({
        reviewId,
        request: { reply_content: replyContent.trim() },
      });
      setReplyingToId(null);
      setReplyContent("");
    } catch (error) {
      console.error("답글 작성 실패:", error);
    }
  };

  // 최신순으로 정렬된 리뷰
  const sortedReviews = [...reviews].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="flex flex-col">
      {/* 리뷰 목록 */}
      <div className="flex flex-col divide-y divide-[#D9D9D9]">
        {isReviewsLoading ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#8C8C8C]">리뷰를 불러오는 중...</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#8C8C8C]">등록된 리뷰가 없습니다.</p>
          </div>
        ) : (
          sortedReviews.map((review, index) => (
            <div key={review.id}>
              <div className="px-5 py-4">
                {/* 리뷰 헤더 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#262626]">
                      {review.userName}
                    </span>
                  </div>
                  <span className="text-xs text-[#8C8C8C]">{review.date}</span>
                </div>

                {/* 별점 */}
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(review.rating)}
                </div>

                {/* 구매 상품 정보 */}
                <div className="mb-2">
                  <span className="text-xs text-[#8C8C8C]">
                    {review.productName}
                  </span>
                </div>

                {/* 리뷰 내용 */}
                <p className="text-sm text-[#262626] mb-3 leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>

                {/* 리뷰 이미지 */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
                    {review.images.map((image, imgIndex) => (
                      <button
                        key={`${review.id}-${imgIndex}`}
                        type="button"
                        onClick={() =>
                          handleImageClick(review.images || [], imgIndex)
                        }
                        className="w-20 h-20 rounded relative overflow-hidden bg-[#D9D9D9] flex-shrink-0 cursor-pointer"
                        aria-label={`리뷰 이미지 ${imgIndex + 1} 보기`}
                      >
                        <Image
                          src={image}
                          alt={`리뷰 이미지 ${imgIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* 답글 영역 */}
                {review.reply ? (
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
                              src={review.reply.farm_image}
                              alt={review.reply.farm_name}
                              fill
                              className="object-cover"
                            />
                          ) : profileData?.farm_image_url ? (
                            <Image
                              src={profileData.farm_image_url}
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
                ) : replyingToId !== review.id ? (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleReplyClick(review.id)}
                      className="text-xs text-[#8C8C8C] underline"
                    >
                      답글달기
                    </button>
                  </div>
                ) : null}

                {/* 답글 작성 폼 */}
                {replyingToId === review.id && (
                  <div className="mt-3 border border-[#D9D9D9] rounded">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답글을 입력하세요"
                      className="w-full p-3 text-sm text-[#262626] resize-none outline-none rounded"
                      rows={4}
                    />
                    <div className="flex justify-end p-3">
                      <button
                        type="button"
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={
                          !replyContent.trim() || createReplyMutation.isPending
                        }
                        className={`px-4 py-2 text-sm rounded ${
                          replyContent.trim() && !createReplyMutation.isPending
                            ? "bg-[#133A1B] text-white"
                            : "bg-[#D9D9D9] text-[#8C8C8C] cursor-not-allowed"
                        }`}
                      >
                        완료
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {index < sortedReviews.length - 1 && (
                <div className="h-px bg-[#D9D9D9]" />
              )}
            </div>
          ))
        )}
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

export default BusinessProfilePage;
