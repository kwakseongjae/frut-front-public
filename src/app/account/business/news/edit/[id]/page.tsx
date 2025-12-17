"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import { useMyFarmNews, useUpdateNews } from "@/lib/api/hooks/use-best-farms";
import { uploadApi } from "@/lib/api/upload";

const EditNewsPage = () => {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  const numericNewsId = parseInt(newsId, 10);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const contentId = useId();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
  const [originalImageUrlToPathMap, setOriginalImageUrlToPathMap] = useState<
    Map<string, string>
  >(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: newsData } = useMyFarmNews();
  const updateNewsMutation = useUpdateNews();

  // 소식 데이터 로드
  useEffect(() => {
    if (newsData) {
      const newsItem = newsData.find((news) => news.id === numericNewsId);
      if (newsItem) {
        setTitle(newsItem.title);
        setContent(newsItem.content);
        const imageUrls =
          newsItem.images && newsItem.images.length > 0
            ? newsItem.images.map((img) => img.image_url)
            : [];
        setExistingImageUrls(imageUrls);
        setImages(imageUrls);

        // paths 배열에서 path 값 추출
        const imagePaths =
          newsItem.paths && newsItem.paths.length > 0
            ? newsItem.paths.map((pathItem) => pathItem.path)
            : [];
        setExistingImagePaths(imagePaths);

        // URL과 path를 매핑하는 Map 생성
        const urlToPathMap = new Map<string, string>();
        if (newsItem.images && newsItem.paths) {
          newsItem.images.forEach((img, index) => {
            const pathItem = newsItem.paths?.find((p) => p.id === img.id);
            if (pathItem) {
              urlToPathMap.set(img.image_url, pathItem.path);
            }
          });
        }
        setOriginalImageUrlToPathMap(urlToPathMap);
      }
    }
  }, [newsData, numericNewsId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setImageFiles((prev) => {
        const updated = [...prev, ...fileArray];
        return updated.slice(0, 10); // 최대 10개까지만
      });
      const newImages: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
            if (newImages.length === fileArray.length) {
              setImages((prev) => {
                const updated = [...prev, ...newImages];
                return updated.slice(0, 10); // 최대 10개까지만
              });
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));

    // 새로 추가한 파일인지 기존 이미지인지 확인
    if (imageToRemove && !imageToRemove.startsWith("data:")) {
      // 기존 이미지 삭제 - URL로 찾아서 삭제
      setExistingImageUrls((prev) =>
        prev.filter((url) => url !== imageToRemove)
      );
      // 해당 URL에 매칭되는 path도 삭제
      const urlIndex = existingImageUrls.findIndex(
        (url) => url === imageToRemove
      );
      if (urlIndex !== -1) {
        setExistingImagePaths((prev) => prev.filter((_, i) => i !== urlIndex));
      }
    } else {
      // 새로 추가한 파일 삭제 - images 배열에서 data URL의 인덱스를 기준으로 계산
      const existingCount = images.filter(
        (img) => !img.startsWith("data:")
      ).length;
      const dataUrlIndex = index - existingCount;
      if (dataUrlIndex >= 0) {
        setImageFiles((prev) => prev.filter((_, i) => i !== dataUrlIndex));
      }
    }
  };

  // GCS에 이미지 업로드
  const uploadImageToGCS = async (file: File): Promise<string> => {
    // 1. Signed URL 생성
    const signedUrlData = await uploadApi.generateSignedUrl({
      file_name: file.name,
      content_type: file.type,
    });

    // 2. Signed URL로 파일 업로드
    await uploadApi.uploadToGCS(file, signedUrlData.signed_url);

    // 3. GCS path 반환
    return signedUrlData.gcs_path;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // 유효성 검사
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("본문을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 현재 images 배열에서 기존 이미지와 새로 추가한 이미지를 구분
      const currentExistingImagePaths: string[] = [];

      images.forEach((imageUrl) => {
        // 기존 이미지인지 확인 (data URL이 아닌 경우)
        if (!imageUrl.startsWith("data:")) {
          // originalImageUrlToPathMap에서 먼저 찾기
          let path = originalImageUrlToPathMap.get(imageUrl);

          // Map에서 찾지 못한 경우, existingImageUrls에서 인덱스를 찾아서 path 가져오기
          if (!path) {
            const urlIndex = existingImageUrls.findIndex(
              (url) => url === imageUrl
            );
            if (urlIndex !== -1 && existingImagePaths[urlIndex]) {
              path = existingImagePaths[urlIndex];
            }
          }

          if (path) {
            currentExistingImagePaths.push(path);
          }
        }
        // data URL인 경우는 새로 추가한 이미지이므로 나중에 업로드
      });

      // 2. 새로 추가한 이미지들을 GCS에 업로드
      const newImagePaths = await Promise.all(
        imageFiles.map((file) => uploadImageToGCS(file))
      );

      // 3. 기존 이미지의 path와 새로 업로드한 이미지의 path를 합침
      const allImagePaths = [...currentExistingImagePaths, ...newImagePaths];

      // 4. 소식 수정 API 호출
      await updateNewsMutation.mutateAsync({
        newsId: numericNewsId,
        request: {
          title: title.trim(),
          content: content.trim(),
          images: allImagePaths,
        },
      });

      alert("소식이 수정되었습니다.");
      router.back();
    } catch (error) {
      console.error("소식 수정 실패:", error);
      alert("소식 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 영역 */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-3 px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#262626]">소식수정</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex flex-col px-5 py-4 gap-6">
        {/* 제목 */}
        <div className="flex flex-col gap-[10px]">
          <label
            htmlFor={titleId}
            className="text-sm font-medium text-[#262626]"
          >
            제목
          </label>
          <div className="w-full border border-[#D9D9D9] p-3">
            <input
              type="text"
              id={titleId}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요"
              className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
            />
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-[10px]">
          <label
            htmlFor={contentId}
            className="text-sm font-medium text-[#262626]"
          >
            본문
          </label>
          <div className="w-full border border-[#D9D9D9] p-3 relative">
            <textarea
              id={contentId}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="전하고 싶은 내용을 작성해주세요"
              maxLength={500}
              rows={6}
              className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] resize-none"
            />
            <div className="flex justify-end mt-2">
              <span className="text-sm text-[#8C8C8C]">
                {content.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* 사진 미리보기 */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative w-20 h-20 rounded overflow-hidden bg-[#D9D9D9]"
              >
                <Image
                  src={image}
                  alt={`사진 ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                  aria-label="사진 삭제"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 사진 추가 버튼 */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleAddPhotoClick}
            className="w-full py-[14px] border border-[#133A1B] flex items-center justify-center gap-2 bg-white cursor-pointer"
            aria-label="사진 추가"
          >
            <CameraIcon />
            <span className="text-sm text-[#262626]">
              사진 추가 ({images.length}/10)
            </span>
          </button>
        </div>
      </div>

      {/* 하단 수정 버튼 */}
      <div className="mt-auto px-5 py-4 pb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="수정"
        >
          {isSubmitting ? "수정 중..." : "수정"}
        </button>
      </div>
    </div>
  );
};

export default EditNewsPage;
