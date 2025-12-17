"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import CheckboxGreenIcon from "@/assets/icon/ic_checkbox_green_18.svg";
import CheckboxGreyIcon from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import ChevronRightIcon from "@/assets/icon/ic_chevron_right_grey_17.svg";
import CloseIcon from "@/assets/icon/ic_close_white_bg_grey_17.svg";
import InfoCircleGreyIcon from "@/assets/icon/ic_info_circle_grey_20.svg";
import PlusIcon from "@/assets/icon/ic_plus_black_16.svg";
import PlusGreyIcon from "@/assets/icon/ic_plus_grey_18.svg";
import UploadIcon from "@/assets/icon/ic_upload_black_24.svg";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { useProductDetail } from "@/lib/api/hooks/use-product-detail";
import { useCategories, useUpdateProduct } from "@/lib/api/hooks/use-products";
import type { CreateProductOption } from "@/lib/api/products";
import { uploadApi } from "@/lib/api/upload";

interface ProductOption {
  id: string;
  name: string;
  regularPrice: number;
  discountPrice: number;
  isDiscountEnabled: boolean;
}

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const productNameId = useId();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);

  const [mainCategoryId, setMainCategoryId] = useState<number | null>(null);
  const [mainCategoryName, setMainCategoryName] = useState<string>("");
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [subCategoryName, setSubCategoryName] = useState<string>("");
  const [isMainCategoryOpen, setIsMainCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageGcsPath, setMainImageGcsPath] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImageGcsPaths, setAdditionalImageGcsPaths] = useState<
    string[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<ProductOption[]>([
    {
      id: "1",
      name: "",
      regularPrice: 0,
      discountPrice: 0,
      isDiscountEnabled: false,
    },
  ]);
  const [productInfo, setProductInfo] = useState({
    productName: "",
    manufacturer: "",
    manufactureDate: "",
    expirationDate: "",
    legalInfo: "",
    composition: "",
    storageMethod: "",
    customerServicePhone: "",
  });
  const [manufactureYear, setManufactureYear] = useState<string>("");
  const [manufactureMonth, setManufactureMonth] = useState<string>("");
  const [manufactureDay, setManufactureDay] = useState<string>("");
  const [editorContent, setEditorContent] = useState("");

  // 카테고리 데이터 조회
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories(true);

  // 상품 데이터 조회
  const numericProductId = parseInt(productId, 10);
  const { data: productDetail } = useProductDetail(numericProductId);

  // 상품 수정 mutation
  const updateProductMutation = useUpdateProduct();

  // 선택된 대메뉴의 소메뉴 목록
  const availableSubCategories = useMemo(() => {
    if (!mainCategoryId || !categoriesData) return [];
    const mainCategory = categoriesData.find((c) => c.id === mainCategoryId);
    return mainCategory?.subcategories || [];
  }, [mainCategoryId, categoriesData]);

  // 상품 데이터 로드 및 폼 초기화
  useEffect(() => {
    if (productDetail && categoriesData) {
      setProductName(productDetail.product_name);

      // 카테고리 설정 - category_id를 사용하여 매칭
      if (productDetail.category_id) {
        // 카테고리 목록에서 해당 category_id를 가진 소메뉴 찾기
        let foundMainCategory = null;
        let foundSubCategory = null;

        for (const mainCategory of categoriesData) {
          const subCategory = mainCategory.subcategories.find(
            (sc) => sc.id === productDetail.category_id
          );
          if (subCategory) {
            foundMainCategory = mainCategory;
            foundSubCategory = subCategory;
            break;
          }
        }

        if (foundMainCategory && foundSubCategory) {
          setMainCategoryId(foundMainCategory.id);
          setMainCategoryName(foundMainCategory.category_name);
          setSubCategoryId(foundSubCategory.id);
          setSubCategoryName(foundSubCategory.category_name);
        }
      } else {
        // category_id가 없는 경우 기존 방식으로 fallback (category_name 파싱)
        const categoryParts = productDetail.category_name.split(" > ");
        if (categoryParts.length >= 2) {
          const mainCatName = categoryParts[0];
          const subCatName = categoryParts[1];
          const mainCat = categoriesData.find(
            (c) => c.category_name === mainCatName
          );
          if (mainCat) {
            setMainCategoryId(mainCat.id);
            setMainCategoryName(mainCatName);
            const subCat = mainCat.subcategories.find(
              (sc) => sc.category_name === subCatName
            );
            if (subCat) {
              setSubCategoryId(subCat.id);
              setSubCategoryName(subCatName);
            }
          }
        }
      }

      // 이미지 설정
      if (productDetail.images && productDetail.images.length > 0) {
        const mainImg = productDetail.images.find((img) => img.is_main);
        if (mainImg) {
          setMainImage(mainImg.image_url);
          setMainImageGcsPath(mainImg.gcs_path);
        }
        const additionalImgs = productDetail.images
          .filter((img) => !img.is_main)
          .sort((a, b) => a.sort_order - b.sort_order);
        setAdditionalImages(additionalImgs.map((img) => img.image_url));
        setAdditionalImageGcsPaths(additionalImgs.map((img) => img.gcs_path));
        // 기존 이미지에 대한 파일 배열은 빈 배열로 초기화 (기존 이미지는 파일이 없음)
        setAdditionalImageFiles(new Array(additionalImgs.length).fill(null));
      }

      // 옵션 설정
      if (productDetail.options && productDetail.options.length > 0) {
        const formattedOptions = productDetail.options.map((opt, idx) => ({
          id: (idx + 1).toString(),
          name: opt.name,
          regularPrice: opt.price, // 정가
          discountPrice: opt.cost_price, // 할인가
          isDiscountEnabled: opt.discount_rate > 0,
        }));
        setOptions(formattedOptions);
      }

      // 상품 정보 설정
      setProductInfo({
        productName: productDetail.product_description || "",
        manufacturer: productDetail.producer_name || "",
        manufactureDate: productDetail.production_date || "",
        expirationDate: productDetail.expiry_type || "",
        legalInfo: productDetail.legal_notice || "",
        composition: productDetail.product_composition || "",
        storageMethod: productDetail.handling_method || "",
        customerServicePhone: productDetail.customer_service_phone || "",
      });

      // 제조연월일 분리
      if (productDetail.production_date) {
        const dateParts = productDetail.production_date.split("-");
        if (dateParts.length === 3) {
          setManufactureYear(dateParts[0]);
          setManufactureMonth(dateParts[1]);
          setManufactureDay(dateParts[2]);
        }
      }

      // 상품 설명 설정
      setEditorContent(productDetail.detail_content || "");
    }
  }, [productDetail, categoriesData]);

  const handleMainCategorySelect = (
    categoryId: number,
    categoryName: string
  ) => {
    setMainCategoryId(categoryId);
    setMainCategoryName(categoryName);
    setSubCategoryId(null);
    setSubCategoryName("");
    setIsMainCategoryOpen(false);
  };

  const handleSubCategorySelect = (
    subCategoryId: number,
    subCategoryName: string
  ) => {
    setSubCategoryId(subCategoryId);
    setSubCategoryName(subCategoryName);
    setIsSubCategoryOpen(false);
  };

  // 허용된 이미지 확장자 검증
  const isValidImageExtension = (fileName: string): boolean => {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".pdf",
      ".doc",
      ".docx",
    ];
    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));
    return allowedExtensions.includes(fileExtension);
  };

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 확장자 검증
      if (!isValidImageExtension(file.name)) {
        alert(
          "허용된 파일 형식만 업로드 가능합니다: .jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx"
        );
        if (mainImageInputRef.current) {
          mainImageInputRef.current.value = "";
        }
        return;
      }

      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setMainImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);

      // 확장자 검증
      const invalidFiles = fileArray.filter(
        (file) => !isValidImageExtension(file.name)
      );
      if (invalidFiles.length > 0) {
        alert(
          "허용된 파일 형식만 업로드 가능합니다: .jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx"
        );
        if (additionalImageInputRef.current) {
          additionalImageInputRef.current.value = "";
        }
        return;
      }

      setAdditionalImageFiles((prev) => {
        const updated = [...prev, ...fileArray];
        return updated.slice(0, 9);
      });
      const newImages: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
            if (newImages.length === fileArray.length) {
              setAdditionalImages((prev) => {
                const updated = [...prev, ...newImages];
                return updated.slice(0, 9);
              });
              // 새로 추가한 이미지는 gcs_path가 없으므로 빈 문자열 추가
              setAdditionalImageGcsPaths((prev) => {
                const updated = [
                  ...prev,
                  ...new Array(fileArray.length).fill(""),
                ];
                return updated.slice(0, 9);
              });
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveMainImage = () => {
    setMainImage(null);
    setMainImageFile(null);
    setMainImageGcsPath(null);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImageGcsPaths((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    id: string,
    field: keyof ProductOption,
    value: string | number | boolean
  ) => {
    setOptions((prev) =>
      prev.map((option) => {
        if (option.id === id) {
          const updated = { ...option, [field]: value };
          // 설정 안함일 경우 할인가 = 정가
          if (field === "isDiscountEnabled" && !value) {
            updated.discountPrice = updated.regularPrice;
          }
          // 정가 변경 시 설정 안함이면 할인가도 함께 변경
          if (field === "regularPrice" && !updated.isDiscountEnabled) {
            updated.discountPrice = value as number;
          }
          // 할인가가 정상가보다 크면 정상가로 제한
          if (field === "discountPrice" && updated.regularPrice > 0) {
            const discountValue = value as number;
            if (discountValue > updated.regularPrice) {
              updated.discountPrice = updated.regularPrice;
            }
          }
          return updated;
        }
        return option;
      })
    );
  };

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        regularPrice: 0,
        discountPrice: 0,
        isDiscountEnabled: false,
      },
    ]);
  };

  const calculateDiscountPercent = (
    regularPrice: number,
    discountPrice: number
  ): number => {
    if (regularPrice === 0) return 0;
    return Math.round(((regularPrice - discountPrice) / regularPrice) * 100);
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
    if (!subCategoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    if (!productName.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (!mainImage) {
      alert("메인 이미지를 선택해주세요.");
      return;
    }

    // 이미지 개수 확인 (메인 1개 + 추가 최대 9개 = 총 최대 10개)
    const totalImages = 1 + additionalImages.length;
    if (totalImages > 10) {
      alert("이미지는 최대 10개까지 등록할 수 있습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 기존 이미지 경로와 새로 업로드할 이미지 구분
      const imagePaths: string[] = [];

      // 메인 이미지 처리
      if (mainImageFile) {
        // 새로 선택한 파일이면 업로드
        const mainImagePath = await uploadImageToGCS(mainImageFile);
        imagePaths.push(mainImagePath);
      } else if (mainImage && mainImageGcsPath) {
        // 기존 이미지의 경우 gcs_path 사용
        imagePaths.push(mainImageGcsPath);
      }

      // 추가 이미지 처리
      // additionalImages 배열의 순서대로 처리 (삭제된 이미지는 이미 배열에서 제외됨)
      // 각 인덱스에 대해 파일이 있으면 새 파일, 없고 gcs_path가 있으면 기존 이미지
      // 배열 길이가 일치하지 않을 수 있으므로 additionalImages 기준으로 순회
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImageFiles[i] || null;
        const gcsPath = additionalImageGcsPaths[i] || null;

        // 새로 추가한 파일이 있는 경우
        if (file) {
          // 새로 선택한 파일이면 업로드
          const imagePath = await uploadImageToGCS(file);
          imagePaths.push(imagePath);
        }
        // 기존 이미지인 경우 (gcs_path가 있고 빈 문자열이 아닌 경우)
        else if (gcsPath && gcsPath.trim() !== "") {
          // 기존 이미지의 gcs_path 사용
          imagePaths.push(gcsPath);
        }
        // 둘 다 없는 경우는 건너뛰기 (이론적으로 발생하지 않아야 함)
      }

      // 3. 옵션 데이터 변환
      const productOptions: CreateProductOption[] | undefined =
        options.length > 0 &&
        options.some(
          (opt) =>
            opt.name.trim() && (opt.regularPrice > 0 || opt.discountPrice > 0)
        )
          ? options
              .filter(
                (opt) =>
                  opt.name.trim() &&
                  (opt.regularPrice > 0 || opt.discountPrice > 0)
              )
              .map((opt): CreateProductOption => {
                // 할인가가 정가보다 높은지 검증
                if (
                  opt.isDiscountEnabled &&
                  opt.discountPrice > opt.regularPrice
                ) {
                  throw new Error(
                    `옵션 "${
                      opt.name || "이름 없음"
                    }": 판매가(할인가)는 원가보다 높을 수 없습니다.`
                  );
                }

                // price는 정가, cost_price는 할인가
                const price = opt.regularPrice; // 정가
                const costPrice = opt.isDiscountEnabled
                  ? opt.discountPrice
                  : opt.regularPrice; // 할인가 (할인 미설정 시 정가와 동일)
                const discountRate = opt.isDiscountEnabled
                  ? calculateDiscountPercent(
                      opt.regularPrice,
                      opt.discountPrice
                    )
                  : 0;

                return {
                  name: opt.name,
                  price,
                  cost_price: costPrice,
                  discount_rate: discountRate,
                };
              })
          : undefined;

      // 4. 생산연도 추출 (정수)
      const productionYear = manufactureYear
        ? (() => {
            const year = parseInt(manufactureYear, 10);
            return Number.isNaN(year) || year < 1 ? undefined : year;
          })()
        : undefined;

      // 5. 상품 수정 API 호출
      await updateProductMutation.mutateAsync({
        productId: numericProductId,
        request: {
          category_id: subCategoryId,
          product_name: productName,
          product_description: productInfo.productName || undefined,
          detail_content: editorContent || undefined,
          producer_name: productInfo.manufacturer || undefined,
          producer_location: undefined,
          production_date: productInfo.manufactureDate || undefined,
          production_year: productionYear,
          expiry_type: productInfo.expirationDate || undefined,
          legal_notice: productInfo.legalInfo || undefined,
          product_composition: productInfo.composition || undefined,
          handling_method: productInfo.storageMethod || undefined,
          customer_service_phone: productInfo.customerServicePhone || undefined,
          status: "ACTIVE",
          images: imagePaths,
          options: productOptions,
        },
      });

      alert("상품이 수정되었습니다.");
      router.push("/account/business/products");
    } catch (error) {
      console.error("상품 수정 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "상품 수정에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
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
          <h1 className="text-lg font-semibold text-[#262626]">상품 수정</h1>
        </div>
        <div className="w-7" />
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex flex-col px-5 py-4 gap-6 pb-4">
        {/* 카테고리 설정 */}
        <div className="flex flex-col gap-[10px]">
          <div className="text-base font-medium text-[#262626]">
            카테고리 설정
          </div>
          <div className="flex flex-col gap-2">
            {/* 대메뉴 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMainCategoryOpen(!isMainCategoryOpen);
                  setIsSubCategoryOpen(false);
                }}
                disabled={isCategoriesLoading}
                className={`w-full border border-[#D9D9D9] p-3 flex items-center justify-between text-sm text-left ${
                  isCategoriesLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="대메뉴 선택"
              >
                <span
                  className={
                    mainCategoryName ? "text-[#262626]" : "text-[#949494]"
                  }
                >
                  {isCategoriesLoading
                    ? "로딩 중..."
                    : mainCategoryName || "대메뉴"}
                </span>
                <ChevronRightIcon
                  className={`transform transition-transform rotate-90 ${
                    isMainCategoryOpen ? "rotate-[270deg]" : ""
                  }`}
                />
              </button>
              {isMainCategoryOpen && !isCategoriesLoading && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMainCategoryOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsMainCategoryOpen(false);
                      }
                    }}
                    aria-label="카테고리 메뉴 닫기"
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D9D9D9] z-20 max-h-48 overflow-y-auto">
                    {categoriesData && categoriesData.length > 0 ? (
                      categoriesData.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            handleMainCategorySelect(
                              category.id,
                              category.category_name
                            )
                          }
                          className="w-full px-3 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5]"
                        >
                          {category.category_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-[#8C8C8C]">
                        카테고리가 없습니다.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 소메뉴 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (mainCategoryId) {
                    setIsSubCategoryOpen(!isSubCategoryOpen);
                    setIsMainCategoryOpen(false);
                  }
                }}
                disabled={!mainCategoryId}
                className={`w-full border border-[#D9D9D9] p-3 flex items-center justify-between text-sm text-left ${
                  !mainCategoryId ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="소메뉴 선택"
              >
                <span
                  className={
                    subCategoryName ? "text-[#262626]" : "text-[#949494]"
                  }
                >
                  {subCategoryName || "소메뉴"}
                </span>
                <ChevronRightIcon
                  className={`transform transition-transform rotate-90 ${
                    isSubCategoryOpen ? "rotate-[270deg]" : ""
                  }`}
                />
              </button>
              {isSubCategoryOpen && mainCategoryId && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    onClick={() => setIsSubCategoryOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsSubCategoryOpen(false);
                      }
                    }}
                    aria-label="카테고리 선택 닫기"
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D9D9D9] z-20 max-h-48 overflow-y-auto">
                    {availableSubCategories.length > 0 ? (
                      availableSubCategories.map((subCategory) => (
                        <button
                          key={subCategory.id}
                          type="button"
                          onClick={() =>
                            handleSubCategorySelect(
                              subCategory.id,
                              subCategory.category_name
                            )
                          }
                          className="w-full px-3 py-2 text-left text-sm text-[#262626] hover:bg-[#F5F5F5]"
                        >
                          {subCategory.category_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-[#8C8C8C]">
                        소메뉴가 없습니다.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 상품명 */}
        <div className="flex flex-col gap-[10px]">
          <label
            htmlFor={productNameId}
            className="text-base font-medium text-[#262626]"
          >
            상품명
          </label>
          <div className="w-full border border-[#D9D9D9] p-3">
            <input
              type="text"
              id={productNameId}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="상품명을 입력하세요"
              className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
            />
          </div>
        </div>

        {/* 메인 이미지 */}
        <div className="flex flex-col gap-[10px]">
          <div className="text-base font-medium text-[#262626]">
            메인 이미지
          </div>
          <div className="w-full border border-[#D9D9D9] p-4 min-h-[200px] flex flex-col items-center justify-center gap-2 relative">
            {mainImage ? (
              <>
                <div className="relative w-full aspect-square rounded overflow-hidden">
                  <Image
                    src={mainImage}
                    alt="메인 상품 이미지"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                  aria-label="이미지 삭제"
                >
                  <CloseIcon />
                </button>
              </>
            ) : (
              <>
                <CameraIcon />
                <span className="text-sm text-[#262626]">메인 상품 이미지</span>
                <span className="text-xs text-[#8C8C8C]">
                  권장 해상도: 000x000
                </span>
              </>
            )}
            <input
              ref={mainImageInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
              onChange={handleMainImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => mainImageInputRef.current?.click()}
              className="flex items-center gap-1 text-sm text-[#262626] border border-[#D9D9D9] px-3 py-1.5"
              aria-label="이미지 선택"
            >
              <UploadIcon />
              <span>이미지 선택</span>
            </button>
          </div>
        </div>

        {/* 추가 이미지 */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium text-[#262626]">
              추가 이미지
            </div>
            <span className="text-xs text-[#8C8C8C]">
              최대 9장까지 추가 가능
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {additionalImages.map((image, index) => (
              <div
                key={image}
                className="relative w-[140px] h-[140px] rounded overflow-hidden bg-[#D9D9D9]"
              >
                <Image
                  src={image}
                  alt={`추가 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                  aria-label="이미지 삭제"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
            {additionalImages.length < 9 && (
              <button
                type="button"
                onClick={() => additionalImageInputRef.current?.click()}
                className="w-[140px] h-[140px] border border-[#D9D9D9] flex flex-col items-center justify-center gap-1"
                aria-label="이미지 추가"
              >
                <PlusGreyIcon />
                <span className="text-[12px] font-medium text-[#818181]">
                  {additionalImages.length}/9
                </span>
              </button>
            )}
            <input
              ref={additionalImageInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
              multiple
              onChange={handleAdditionalImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* 옵션 설정 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-base font-medium text-[#262626]">
              옵션 설정 <span className="text-red-500">*</span>
            </div>
            <div className="flex items-center gap-1">
              <InfoCircleGreyIcon />
              <span className="text-xs text-[#8C8C8C]">
                옵션 1의 가격이 상품 기본 가격으로 설정됩니다.
              </span>
            </div>
          </div>
          {options.map((option, index) => (
            <div key={option.id} className="flex flex-col gap-3">
              {index > 0 && <div className="border-t border-[#E5E5E5] pt-4" />}
              <div className="flex flex-col gap-[10px]">
                {/* 옵션명 */}
                <div className="flex flex-col gap-[10px]">
                  <div className="text-sm text-[#262626]">옵션명</div>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) =>
                      handleOptionChange(option.id, "name", e.target.value)
                    }
                    placeholder="옵션명을 입력하세요"
                    className="w-full border border-[#D9D9D9] p-3 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                  />
                </div>

                {/* 정가 */}
                <div className="flex flex-col gap-[10px]">
                  <div className="text-sm text-[#262626]">정가</div>
                  <div className="border border-[#D9D9D9] p-3 flex items-center justify-end gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={option.regularPrice || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        handleOptionChange(
                          option.id,
                          "regularPrice",
                          value === "" ? 0 : Number(value)
                        );
                      }}
                      placeholder="0"
                      className="text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full"
                    />
                    <span className="text-sm text-[#8C8C8C]">원</span>
                  </div>
                </div>

                {/* 할인가 */}
                <div className="flex flex-col gap-[10px]">
                  <div className="text-sm text-[#262626]">할인가</div>
                  <div className="relative">
                    <div
                      className={`border border-[#D9D9D9] p-3 flex items-center justify-end gap-1 ${
                        !option.isDiscountEnabled ? "bg-[#F5F5F5]" : ""
                      }`}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={option.discountPrice || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          const numValue = value === "" ? 0 : Number(value);
                          // 정상가보다 큰 값이면 정상가로 제한
                          const finalValue =
                            option.regularPrice > 0 &&
                            numValue > option.regularPrice
                              ? option.regularPrice
                              : numValue;
                          handleOptionChange(
                            option.id,
                            "discountPrice",
                            finalValue
                          );
                        }}
                        disabled={!option.isDiscountEnabled}
                        placeholder="0"
                        className={`text-right text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] w-full ${
                          !option.isDiscountEnabled ? "cursor-not-allowed" : ""
                        }`}
                      />
                      <span className="text-sm text-[#8C8C8C]">원</span>
                    </div>
                    {option.isDiscountEnabled &&
                      option.regularPrice > 0 &&
                      option.discountPrice < option.regularPrice && (
                        <div className="absolute right-0 bottom-[-20px] text-sm text-red-500 font-medium">
                          {calculateDiscountPercent(
                            option.regularPrice,
                            option.discountPrice
                          )}
                          %
                        </div>
                      )}
                  </div>
                </div>

                {/* 설정/설정 안함 체크박스 */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() =>
                        handleOptionChange(option.id, "isDiscountEnabled", true)
                      }
                      className="flex items-center justify-center"
                      aria-label="설정"
                    >
                      {option.isDiscountEnabled ? (
                        <CheckboxGreenIcon />
                      ) : (
                        <CheckboxGreyIcon />
                      )}
                    </button>
                    <span className="text-sm text-[#262626]">설정</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() =>
                        handleOptionChange(
                          option.id,
                          "isDiscountEnabled",
                          false
                        )
                      }
                      className="flex items-center justify-center"
                      aria-label="설정 안함"
                    >
                      {!option.isDiscountEnabled ? (
                        <CheckboxGreenIcon />
                      ) : (
                        <CheckboxGreyIcon />
                      )}
                    </button>
                    <span className="text-sm text-[#262626]">설정 안함</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="w-full border border-[#D9D9D9] p-3 flex items-center justify-center gap-1 text-sm text-[#262626]"
            aria-label="옵션 추가"
          >
            <PlusIcon />
            <span>옵션 추가</span>
          </button>
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-[10px]">
          <div className="text-base font-medium text-[#262626]">상품 정보</div>
          <div className="border border-[#D9D9D9] flex flex-col">
            {[
              { key: "productName", label: "제품명" },
              { key: "manufacturer", label: "생산자 및 소재지" },
              {
                key: "manufactureDate",
                label: "제조연월일(포장일 또는 생산연도)",
              },
              { key: "expirationDate", label: "유통기한 또는 품질유지기한" },
              { key: "legalInfo", label: "관련법상 표시사항" },
              { key: "composition", label: "상품구성" },
              { key: "storageMethod", label: "보관방법 또는 취급방법" },
              {
                key: "customerServicePhone",
                label: "소비자상담 관련 전화번호",
              },
            ].map(({ key, label }, index) => (
              <div
                key={key}
                className={`flex items-center gap-4 p-3 ${
                  index !==
                  [
                    "productName",
                    "manufacturer",
                    "manufactureDate",
                    "expirationDate",
                    "legalInfo",
                    "composition",
                    "storageMethod",
                    "customerServicePhone",
                  ].length -
                    1
                    ? "border-b border-[#E5E5E5]"
                    : ""
                }`}
              >
                <span className="text-sm text-[#262626] min-w-[140px] flex-shrink-0 text-left">
                  {label}
                </span>
                {key === "manufactureDate" ? (
                  <div className="flex-1 flex items-center gap-2 justify-end">
                    <input
                      type="text"
                      value={manufactureYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 4) {
                          setManufactureYear(value);
                          // YYYY-MM-DD 형식으로 조합
                          const month = manufactureMonth.padStart(2, "0");
                          const day = manufactureDay.padStart(2, "0");
                          const dateStr =
                            value && month && day
                              ? `${value}-${month}-${day}`
                              : "";
                          setProductInfo((prev) => ({
                            ...prev,
                            manufactureDate: dateStr,
                          }));
                        }
                      }}
                      placeholder="YYYY"
                      maxLength={4}
                      className="w-16 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-center border border-[#D9D9D9] p-1"
                    />
                    <span className="text-sm text-[#262626]">-</span>
                    <input
                      type="text"
                      value={manufactureMonth}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 2) {
                          const numValue = parseInt(value, 10);
                          if (
                            value === "" ||
                            (numValue >= 1 && numValue <= 12)
                          ) {
                            setManufactureMonth(value);
                            // YYYY-MM-DD 형식으로 조합
                            const year = manufactureYear.padStart(4, "0");
                            const day = manufactureDay.padStart(2, "0");
                            const month = value.padStart(2, "0");
                            const dateStr =
                              year && month && day
                                ? `${year}-${month}-${day}`
                                : "";
                            setProductInfo((prev) => ({
                              ...prev,
                              manufactureDate: dateStr,
                            }));
                          }
                        }
                      }}
                      placeholder="MM"
                      maxLength={2}
                      className="w-12 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-center border border-[#D9D9D9] p-1"
                    />
                    <span className="text-sm text-[#262626]">-</span>
                    <input
                      type="text"
                      value={manufactureDay}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 2) {
                          const numValue = parseInt(value, 10);
                          if (
                            value === "" ||
                            (numValue >= 1 && numValue <= 31)
                          ) {
                            setManufactureDay(value);
                            // YYYY-MM-DD 형식으로 조합
                            const year = manufactureYear.padStart(4, "0");
                            const month = manufactureMonth.padStart(2, "0");
                            const day = value.padStart(2, "0");
                            const dateStr =
                              year && month && day
                                ? `${year}-${month}-${day}`
                                : "";
                            setProductInfo((prev) => ({
                              ...prev,
                              manufactureDate: dateStr,
                            }));
                          }
                        }
                      }}
                      placeholder="DD"
                      maxLength={2}
                      className="w-12 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-center border border-[#D9D9D9] p-1"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={productInfo[key as keyof typeof productInfo]}
                    onChange={(e) =>
                      setProductInfo((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder="내용을 입력하세요"
                    className="flex-1 text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] text-right"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 상품 설명 */}
        <div className="flex flex-col gap-[10px]">
          <div className="text-base font-medium text-[#262626]">상품 설명</div>
          <TiptapEditor
            content={editorContent}
            onChange={setEditorContent}
            placeholder="상품에 대한 상세한 설명을 작성해주세요."
          />
        </div>
      </div>

      {/* 하단 수정 버튼 */}
      <div className="sticky bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-[#E5E5E5] z-10">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#133A1B] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="상품 수정"
        >
          {isSubmitting ? "수정 중..." : "상품 수정"}
        </button>
      </div>
    </div>
  );
};

export default EditProductPage;
