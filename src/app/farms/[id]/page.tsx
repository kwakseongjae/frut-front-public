"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import ChevronRightWhiteIcon from "@/assets/icon/ic_chevron_right_white_24.svg";
import InternetIcon from "@/assets/icon/ic_internet_grey_16.svg";
import LikeIcon from "@/assets/icon/ic_like_grey_15.svg";
import LocationIcon from "@/assets/icon/ic_location_pin_grey_15.svg";
import StarIcon from "@/assets/icon/ic_star_lightgreen_15.svg";
import { fruits } from "@/assets/images/dummy";
import ProductCard from "@/components/ProductCard";
import ProfileImageViewer from "@/components/ProfileImageViewer";
import ReviewImageViewer from "@/components/ReviewImageViewer";

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
  profileImage?: string;
}

const FarmProfilePage = () => {
  const params = useParams();
  const farmId = params.id as string;
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
  const contentRefs = useRef<{ [key: number]: HTMLParagraphElement | null }>(
    {}
  );

  // 더미 데이터 - 농장 정보
  const farmData = {
    id: parseInt(farmId, 10),
    name: "지혁이 농장",
    description: "항상 소비자를 생각하고 최선을 다하는 농장이 되겠습니다!",
    location: "김포시 걸포동 123길 123호",
    rating: 4.8,
    reviewCount: 152,
    followerCount: 5458,
    isCertified: true,
    profileImage: fruits[0]?.image || "",
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
    setIsFollowing((prev) => !prev);
  };

  // 더미 데이터 - 소식 게시물
  const newsPosts: NewsPost[] = [
    {
      id: 1,
      farmName: farmData.name,
      date: "2025.05.24",
      title: "신선한 수박이 도착했습니다!",
      content:
        "안녕하세요, 지혁이 농장입니다.\n\n오늘 아침에 수확한 신선한 수박이 도착했습니다. 이번 수박은 당도가 특히 높아서 정말 달콤합니다. 직접 농장에서 재배한 수박으로, 농약을 최소화하고 자연 친화적인 방법으로 키웠습니다.\n\n많은 분들이 기다리셨던 수박이니, 빠르게 주문해주시면 좋겠습니다. 수박은 신선할 때가 가장 맛있으니, 받으시는 즉시 드셔보시기 바랍니다.\n\n앞으로도 더 좋은 농산물로 찾아뵙겠습니다. 감사합니다!",
    },
    {
      id: 2,
      farmName: farmData.name,
      date: "2025.05.20",
      title: "제목",
      content: "내용\n내용\n내용",
      url: "www.abcdef.com",
    },
    {
      id: 3,
      farmName: farmData.name,
      date: "2025.05.18",
      title: "제목",
      content: "내용\n내용\n내용",
      images: [fruits[0]?.image].filter(Boolean) as string[],
    },
    {
      id: 4,
      farmName: farmData.name,
      date: "2025.05.15",
      title: "제목",
      content: "내용\n내용",
      images: [fruits[1]?.image].filter(Boolean) as string[],
      url: "www.abcdef.com",
    },
    {
      id: 5,
      farmName: farmData.name,
      date: "2025.05.12",
      title: "여러 장의 사진으로 농장을 소개합니다",
      content: "오늘은 농장의 모습을 여러 장의 사진으로 보여드리겠습니다.",
      images: fruits
        .slice(0, 5)
        .map((fruit) => fruit.image)
        .filter(Boolean) as string[],
    },
  ];

  // 더미 데이터 - 후기
  const reviews: Review[] = [
    {
      id: 1,
      userName: "김철수",
      rating: 5,
      date: "2025.05.20",
      content: "정말 신선하고 맛있어요! 다음에도 주문할게요.",
      productName: "신선한 수박",
      images: [
        fruits[0]?.image,
        fruits[1]?.image,
        fruits[2]?.image,
        fruits[3]?.image,
        fruits[4]?.image,
      ].filter(Boolean) as string[],
      profileImage: fruits[1]?.image || "",
    },
    {
      id: 2,
      userName: "이영희",
      rating: 4,
      date: "2025.05.18",
      content: "좋아요!",
      productName: "신선한 수박",
      images: [fruits[2]?.image, fruits[3]?.image, fruits[4]?.image].filter(
        Boolean
      ) as string[],
      profileImage: fruits[2]?.image || "",
    },
    {
      id: 3,
      userName: "박민수",
      rating: 5,
      date: "2025.05.15",
      content: "완벽해요!",
      productName: "신선한 수박",
      images: [
        fruits[1]?.image,
        fruits[2]?.image,
        fruits[3]?.image,
        fruits[4]?.image,
        fruits[5]?.image,
        fruits[0]?.image,
        fruits[1]?.image,
        fruits[2]?.image,
        fruits[3]?.image,
        fruits[4]?.image,
      ].filter(Boolean) as string[],
      profileImage: fruits[3]?.image || "",
    },
  ];

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
          <h1 className="text-lg font-semibold text-[#262626]">농장 프로필</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 농장 프로필 정보 섹션 */}
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
            className="relative w-24 h-24 rounded-full bg-[#D9D9D9] flex-shrink-0 overflow-hidden cursor-pointer z-10"
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
              <h2 className="font-semibold text-[#262626]">{farmData.name}</h2>
              {farmData.isCertified && (
                <div className="px-2 py-0.5 bg-[#E6F5E9] rounded-[3px]">
                  <p className="text-[10px] font-medium text-[#133A1B]">인증</p>
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
            <div className="flex items-center gap-1">
              <StarIcon />
              <span className="text-xs text-[#595959]">
                {farmData.rating} ({farmData.reviewCount})
              </span>
            </div>
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
            className={`w-full py-3 text-base font-semibold transition-colors ${
              isFollowing
                ? "bg-[#E5E5E5] text-[#262626]"
                : "bg-[#133A1B] text-white"
            }`}
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>
        </div>
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
            ))}
          </div>
        )}
        {activeTab === "products" && (
          <div className="px-5 py-8">
            <div className="grid grid-cols-2 gap-x-3 gap-y-[30px]">
              <ProductCard
                id={1}
                originalPrice={39800}
                discountedPrice={17900}
                discountRate={55}
                tags={["고당도", "특가"]}
                farmId={farmData.id}
                farmName={farmData.name}
              />
              <ProductCard
                id={2}
                originalPrice={39800}
                discountedPrice={17900}
                discountRate={55}
                tags={["고당도", "특가"]}
                farmId={farmData.id}
                farmName={farmData.name}
              />
              <ProductCard
                id={3}
                originalPrice={39800}
                discountedPrice={17900}
                discountRate={55}
                tags={["고당도", "특가"]}
                farmId={farmData.id}
                farmName={farmData.name}
              />
              <ProductCard
                id={4}
                originalPrice={39800}
                discountedPrice={17900}
                discountRate={55}
                tags={["고당도", "특가"]}
                farmId={farmData.id}
                farmName={farmData.name}
              />
            </div>
          </div>
        )}
        {activeTab === "reviews" && (
          <FarmReviewsTab
            filterType={reviewFilterType}
            sortBy={reviewSortBy}
            onFilterChange={setReviewFilterType}
            onSortChange={setReviewSortBy}
            reviews={reviews}
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
  filterType: "all" | "photo" | "text";
  sortBy: "latest" | "rating";
  onFilterChange: (filterType: "all" | "photo" | "text") => void;
  onSortChange: (sortBy: "latest" | "rating") => void;
  reviews: Review[];
}

const FarmReviewsTab = ({
  filterType,
  sortBy,
  onFilterChange,
  onSortChange,
  reviews,
}: FarmReviewsTabProps) => {
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const filteredReviews = reviews.filter((review) => {
    if (filterType === "photo")
      return review.images && review.images.length > 0;
    if (filterType === "text")
      return !review.images || review.images.length === 0;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  const handleImageClick = (images: string[], index: number) => {
    setViewerImages(images);
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* 필터 및 정렬 옵션 */}
      <div className="px-5 py-3 border-b border-[#D9D9D9]">
        <div className="flex items-center justify-between">
          {/* 좌측 필터 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              className={`text-sm ${
                filterType === "all"
                  ? "text-[#133A1B] font-semibold"
                  : "text-[#8C8C8C]"
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("photo")}
              className={`text-sm ${
                filterType === "photo"
                  ? "text-[#133A1B] font-semibold"
                  : "text-[#8C8C8C]"
              }`}
            >
              포토
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("text")}
              className={`text-sm ${
                filterType === "text"
                  ? "text-[#133A1B] font-semibold"
                  : "text-[#8C8C8C]"
              }`}
            >
              일반
            </button>
          </div>

          {/* 우측 드롭다운 정렬 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as "latest" | "rating")
              }
              className="text-sm text-[#8C8C8C] bg-transparent border-none outline-none appearance-none pr-6"
            >
              <option value="latest">최신순</option>
              <option value="rating">평점순</option>
            </select>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRightIcon className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="flex flex-col divide-y divide-[#D9D9D9]">
        {sortedReviews.map((review) => (
          <div key={review.id} className="px-5 py-4">
            <div className="flex gap-3 mb-3">
              {/* 사용자 프로필 이미지 */}
              <div className="relative w-10 h-10 rounded-full bg-[#D9D9D9] flex-shrink-0 overflow-hidden">
                {review.profileImage && (
                  <Image
                    src={review.profileImage}
                    alt={`${review.userName} 프로필`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#262626]">
                    {review.userName}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={`star-${review.id}-${i}`}
                        className={i < review.rating ? "" : "opacity-30"}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-[#8C8C8C]">{review.date}</span>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-sm text-[#262626] mb-1">{review.content}</p>
              <span className="text-xs text-[#8C8C8C]">
                상품: {review.productName}
              </span>
            </div>
            {/* 리뷰 이미지 */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {review.images.map((image, index) => (
                  <button
                    key={`${review.id}-${index}`}
                    type="button"
                    onClick={() => handleImageClick(review.images || [], index)}
                    className="relative w-20 h-20 rounded bg-[#D9D9D9] flex-shrink-0 cursor-pointer"
                    aria-label={`${review.userName} 리뷰 이미지 ${
                      index + 1
                    } 보기`}
                  >
                    <Image
                      src={image}
                      alt={`${review.userName} 리뷰 이미지 ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
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
