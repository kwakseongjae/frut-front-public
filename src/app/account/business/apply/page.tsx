"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import CheckboxGreenIcon from "@/assets/icon/ic_checkbox_green_18.svg";
import CheckboxGreyIcon from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CircleCheckGreenIcon from "@/assets/icon/ic_circle_check_green_18.svg";
import CircleCheckRedIcon from "@/assets/icon/ic_circle_check_red_18.svg";
import CopyIcon from "@/assets/icon/ic_copy_black_20.svg";
import CreditCardIcon from "@/assets/icon/ic_credit_card_black_20.svg";
import DocumentIcon from "@/assets/icon/ic_document_black_20.svg";
import InfoCircleGreyIcon from "@/assets/icon/ic_info_circle_grey_20.svg";
import UploadIcon from "@/assets/icon/ic_upload_black_15.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useSellerApplication,
  useUpdateApplication,
} from "@/lib/api/hooks/use-best-farms";
import { sellersApi } from "@/lib/api/sellers";
import { uploadApi } from "@/lib/api/upload";

interface DocumentItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  file: File | null;
  isSubmitted: boolean;
}

const BusinessProfileApplyPage = () => {
  const router = useRouter();
  const phoneId = useId();
  const emailId = useId();
  const accountId = useId();
  const bankNameId = useId();
  const accountHolderId = useId();
  const farmNameId = useId();
  const farmIntroId = useId();

  // 기본정보
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmIntro, setFarmIntro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 검증 에러 메시지
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [accountNumberError, setAccountNumberError] = useState<string | null>(
    null
  );
  const [emailError, setEmailError] = useState<string | null>(null);

  // 필수 제출 서류
  const [requiredDocuments, setRequiredDocuments] = useState<DocumentItem[]>([
    {
      id: "business-registration",
      name: "사업자 등록증",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "representative-id",
      name: "대표자 신분증 사본",
      icon: <CopyIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "bankbook",
      name: "통장 사본",
      icon: <CreditCardIcon />,
      file: null,
      isSubmitted: false,
    },
  ]);

  // 선택 제출 서류
  const [optionalDocuments, setOptionalDocuments] = useState<DocumentItem[]>([
    {
      id: "online-sales-report",
      name: "통신판매업 신고증",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "gap-certificate",
      name: "GAP 인증서",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "organic-certificate",
      name: "유기농 / 친환경 인증서",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "haccp-certificate",
      name: "HACCP 인증서",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "farm-profile-photo",
      name: "농장 프로필 사진",
      icon: <CameraIcon />,
      file: null,
      isSubmitted: false,
    },
    {
      id: "pesticide-test",
      name: "잔류 농약 검사서",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
  ]);

  // 약관 동의
  const [agreeToAll, setAgreeToAll] = useState(false);
  const [agreements, setAgreements] = useState({
    sellerTerms: false,
    commissionPolicy: false,
    privacyPolicy: false,
  });

  // 탭 상태
  const [activeTab, setActiveTab] = useState<"write" | "status">("write");

  // 신청 현황 조회 (신청 현황 탭일 때만 조회)
  const { data: applicationData, isLoading: isLoadingApplication } =
    useSellerApplication();
  const updateApplicationMutation = useUpdateApplication();

  // 반려된 서류 재제출을 위한 상태
  const [rejectedFiles, setRejectedFiles] = useState<
    Record<number, File | null>
  >({});

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 파일 종류 한글 매핑
  const getFileKindDisplay = (kinds: string): string => {
    const kindMap: Record<string, string> = {
      사업자등록증: "사업자등록증",
      통신판매업신고증: "통신판매업 신고증",
      대표자신분증사본: "대표자 신분증 사본",
      통장사본: "통장 사본",
      농장프로필사진: "농장 프로필 사진",
      GAP인증서: "GAP 인증서",
      유기농인증서: "유기농 / 친환경 인증서",
      HACCP인증서: "HACCP 인증서",
      잔류농약검사서: "잔류 농약 검사서",
    };
    return kindMap[kinds] || kinds;
  };

  // 필수/선택 서류 분류
  const categorizeFiles = () => {
    if (!applicationData?.files) return { required: [], optional: [] };

    const requiredKinds = ["사업자등록증", "대표자신분증사본", "통장사본"];

    const required: typeof applicationData.files = [];
    const optional: typeof applicationData.files = [];

    applicationData.files.forEach((file) => {
      if (requiredKinds.includes(file.kinds)) {
        required.push(file);
      } else {
        optional.push(file);
      }
    });

    return { required, optional };
  };

  // 반려된 서류 파일 선택 핸들러
  const handleRejectedFileSelect = (
    fileId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setRejectedFiles((prev) => ({
        ...prev,
        [fileId]: file,
      }));
    }
  };

  // 파일 종류를 API 필드명으로 매핑
  const getFileKindToFieldName = (kinds: string): string | null => {
    const kindMap: Record<string, string> = {
      사업자등록증: "business_registration",
      통신판매업신고증: "telecom_sales_report",
      대표자신분증사본: "representative_id",
      통장사본: "bank_account_copy",
      농장프로필사진: "farm_profile_photo",
      GAP인증서: "gap_certificate",
      유기농인증서: "organic_certificate",
      HACCP인증서: "haccp_certificate",
      잔류농약검사서: "pesticide_test_report",
    };
    return kindMap[kinds] || null;
  };

  // 반려 서류 제출하기 핸들러
  const handleSubmitRejectedFiles = async () => {
    if (!applicationData || !isAllRejectedFilesUploaded()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 반려된 서류 파일들을 GCS에 업로드
      const updateData: Record<string, string> = {};

      for (const [fileIdStr, file] of Object.entries(rejectedFiles)) {
        if (file) {
          const fileId = parseInt(fileIdStr, 10);
          const applicationFile = applicationData.files.find(
            (f) => f.id === fileId
          );

          if (applicationFile) {
            const gcsPath = await uploadFileToGCS(file);
            const fieldName = getFileKindToFieldName(applicationFile.kinds);

            if (fieldName) {
              updateData[fieldName] = gcsPath;
            }
          }
        }
      }

      // 2. PATCH 요청
      await updateApplicationMutation.mutateAsync(updateData);

      alert("반려 서류가 제출되었습니다.");
      // 파일 선택 초기화
      setRejectedFiles({});
    } catch (error) {
      console.error("반려 서류 제출 실패:", error);
      alert("반려 서류 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 반려된 서류가 모두 업로드되었는지 확인
  const isAllRejectedFilesUploaded = () => {
    if (!applicationData?.files) return false;
    const rejectedFilesList = applicationData.files.filter(
      (file) => file.status === "REJECTED"
    );
    return rejectedFilesList.every((file) => rejectedFiles[file.id] !== null);
  };

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = (
    documentId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 필수 제출 서류 업데이트
    setRequiredDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, file, isSubmitted: true } : doc
      )
    );

    // 선택 제출 서류 업데이트
    setOptionalDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, file, isSubmitted: true } : doc
      )
    );
  };

  // 파일 형식 가져오기
  const getAcceptTypes = (documentId: string): string => {
    // 농장 프로필 사진은 이미지만
    if (documentId === "farm-profile-photo") {
      return "image/*";
    }
    // 필수 서류는 이미지/PDF
    const requiredIds = [
      "online-sales-report",
      "business-registration",
      "representative-id",
      "bankbook",
    ];
    if (requiredIds.includes(documentId)) {
      return ".jpg,.jpeg,.png,.pdf";
    }
    // 선택 서류는 제한 없음
    return "*";
  };

  const handleFileButtonClick = (documentId: string) => {
    fileInputRefs.current[documentId]?.click();
  };

  const handleToggleAllAgreements = () => {
    const newValue = !agreeToAll;
    setAgreeToAll(newValue);
    setAgreements({
      sellerTerms: newValue,
      commissionPolicy: newValue,
      privacyPolicy: newValue,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements) => {
    const newValue = !agreements[key];
    setAgreements((prev) => ({ ...prev, [key]: newValue }));

    // 모든 약관이 체크되었는지 확인
    const updated = { ...agreements, [key]: newValue };
    setAgreeToAll(
      updated.sellerTerms && updated.commissionPolicy && updated.privacyPolicy
    );
  };

  // GCS에 파일 업로드
  const uploadFileToGCS = async (file: File): Promise<string> => {
    const signedUrlData = await uploadApi.generateSignedUrl({
      file_name: file.name,
      content_type: file.type,
    });

    await uploadApi.uploadToGCS(file, signedUrlData.signed_url);
    return signedUrlData.gcs_path;
  };

  // 휴대폰 번호 검증
  const validatePhone = (value: string): string | null => {
    if (value.trim() === "") return null; // 빈 값은 필수 필드 검증에서 처리
    if (!/^[0-9]+$/.test(value)) {
      return "숫자만 입력 가능합니다.";
    }
    if (value.length > 11) {
      return "휴대폰 번호는 11자 이하여야 합니다.";
    }
    return null;
  };

  // 계좌번호 검증
  const validateAccountNumber = (value: string): string | null => {
    if (value.trim() === "") return null; // 빈 값은 필수 필드 검증에서 처리
    if (!/^[0-9]+$/.test(value)) {
      return "숫자만 입력 가능합니다.";
    }
    if (value.length > 11) {
      return "계좌번호는 11자 이하여야 합니다.";
    }
    return null;
  };

  // 이메일 검증
  const validateEmail = (value: string): string | null => {
    if (value.trim() === "") return null; // 빈 값은 필수 필드 검증에서 처리
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "올바른 이메일 형식을 입력해주세요.";
    }
    return null;
  };

  // 필수 필드 검증
  const isFormValid = useMemo(() => {
    // 기본 정보 필수 필드
    const hasBasicInfo =
      phone.trim() !== "" &&
      email.trim() !== "" &&
      accountNumber.trim() !== "" &&
      bankName.trim() !== "" &&
      accountHolder.trim() !== "" &&
      farmName.trim() !== "" &&
      farmIntro.trim() !== "";

    // 검증 에러가 없는지 확인
    const hasNoValidationErrors =
      phoneError === null && accountNumberError === null && emailError === null;

    // 필수 서류 모두 제출되었는지 확인
    const hasAllRequiredDocuments = requiredDocuments.every(
      (doc) => doc.isSubmitted && doc.file !== null
    );

    // 필수 약관 동의 확인
    const hasRequiredAgreements =
      agreements.sellerTerms && agreements.commissionPolicy;

    return (
      hasBasicInfo &&
      hasNoValidationErrors &&
      hasAllRequiredDocuments &&
      hasRequiredAgreements
    );
  }, [
    phone,
    email,
    accountNumber,
    bankName,
    accountHolder,
    farmName,
    farmIntro,
    phoneError,
    accountNumberError,
    emailError,
    requiredDocuments,
    agreements,
  ]);

  // 판매자 등록 신청 제출
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. 필수 서류 파일들을 GCS에 업로드
      const documentPaths: Record<string, string> = {};
      for (const doc of requiredDocuments) {
        if (doc.file) {
          const gcsPath = await uploadFileToGCS(doc.file);
          // API 필드명으로 매핑
          if (doc.id === "business-registration") {
            documentPaths.business_registration = gcsPath;
          } else if (doc.id === "online-sales-report") {
            documentPaths.telecom_sales_report = gcsPath;
          } else if (doc.id === "representative-id") {
            documentPaths.representative_id = gcsPath;
          } else if (doc.id === "bankbook") {
            documentPaths.bank_account_copy = gcsPath;
          } else if (doc.id === "farm-profile-photo") {
            documentPaths.farm_profile_photo = gcsPath;
          }
        }
      }

      // 2. 선택 서류 파일들을 GCS에 업로드 (있는 경우만)
      for (const doc of optionalDocuments) {
        if (doc.file) {
          const gcsPath = await uploadFileToGCS(doc.file);
          if (doc.id === "gap-certificate") {
            documentPaths.gap_certificate = gcsPath;
          } else if (doc.id === "organic-certificate") {
            documentPaths.organic_certificate = gcsPath;
          } else if (doc.id === "haccp-certificate") {
            documentPaths.haccp_certificate = gcsPath;
          } else if (doc.id === "pesticide-test") {
            documentPaths.pesticide_test_report = gcsPath;
          }
        }
      }

      // 3. FormData 생성
      const formData = new FormData();
      formData.append("phone", phone.trim());
      formData.append("email", email.trim());
      formData.append("business_name", farmName.trim());
      formData.append("farm_description", farmIntro.trim());
      formData.append(
        "privacy_policy_agreed",
        agreements.privacyPolicy.toString()
      );
      formData.append("bank_name", bankName.trim());
      formData.append("account_number", accountNumber.trim());
      formData.append("account_holder", accountHolder.trim());

      // 필수 서류
      formData.append(
        "business_registration",
        documentPaths.business_registration
      );
      formData.append(
        "telecom_sales_report",
        documentPaths.telecom_sales_report
      );
      formData.append("representative_id", documentPaths.representative_id);
      formData.append("bank_account_copy", documentPaths.bank_account_copy);
      formData.append("farm_profile_photo", documentPaths.farm_profile_photo);

      // 선택 서류 (있는 경우만)
      if (documentPaths.gap_certificate) {
        formData.append("gap_certificate", documentPaths.gap_certificate);
      }
      if (documentPaths.organic_certificate) {
        formData.append(
          "organic_certificate",
          documentPaths.organic_certificate
        );
      }
      if (documentPaths.haccp_certificate) {
        formData.append("haccp_certificate", documentPaths.haccp_certificate);
      }
      if (documentPaths.pesticide_test_report) {
        formData.append(
          "pesticide_test_report",
          documentPaths.pesticide_test_report
        );
      }

      // 4. API 호출
      await sellersApi.submitApplication(formData);

      alert("판매자 등록 신청이 완료되었습니다.");
      setActiveTab("status");
    } catch (error) {
      console.error("판매자 등록 신청 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "판매자 등록 신청에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
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
            <h1 className="text-lg font-semibold text-[#262626]">
              비즈프로필 신청
            </h1>
          </div>
          <div className="w-7" />
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex-1 py-3 text-sm relative ${
              activeTab === "write"
                ? "font-semibold text-[#133A1B]"
                : "text-[#8C8C8C]"
            }`}
          >
            신청서 작성
            {activeTab === "write" && (
              <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-[#133A1B]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex-1 py-3 text-sm relative ${
              activeTab === "status"
                ? "font-semibold text-[#133A1B]"
                : "text-[#8C8C8C]"
            }`}
          >
            신청 현황
            {activeTab === "status" && (
              <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-[#133A1B]" />
            )}
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 px-5 py-4 flex flex-col overflow-y-auto">
          {activeTab === "write" ? (
            <>
              {/* 기본정보 섹션 */}
              <div className="px-4 py-4 bg-white rounded shadow-[0_0_10px_2px_rgba(0,0,0,0.1)]">
                <h2 className="text-base font-semibold text-[#262626] mb-4">
                  기본정보
                </h2>
                <div className="flex flex-col gap-4">
                  {/* 휴대폰 번호 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={phoneId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      휴대폰 번호 <span className="text-[#F73535]">*</span>
                    </label>
                    <div
                      className={`w-full border p-3 ${
                        phoneError ? "border-red-500" : "border-[#D9D9D9]"
                      }`}
                    >
                      <input
                        type="tel"
                        id={phoneId}
                        placeholder="- 없이 번호만 입력해주세요"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPhone(value);
                          const error = validatePhone(value);
                          setPhoneError(error);
                        }}
                        onBlur={() => {
                          const error = validatePhone(phone);
                          setPhoneError(error);
                        }}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                    {phoneError && (
                      <p className="text-sm text-red-500">{phoneError}</p>
                    )}
                  </div>

                  {/* 이메일 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={emailId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      이메일 <span className="text-[#F73535]">*</span>
                    </label>
                    <div
                      className={`w-full border p-3 ${
                        emailError ? "border-red-500" : "border-[#D9D9D9]"
                      }`}
                    >
                      <input
                        type="email"
                        id={emailId}
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEmail(value);
                          const error = validateEmail(value);
                          setEmailError(error);
                        }}
                        onBlur={() => {
                          const error = validateEmail(email);
                          setEmailError(error);
                        }}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-500">{emailError}</p>
                    )}
                  </div>

                  {/* 은행명 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={bankNameId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      은행명 <span className="text-[#F73535]">*</span>
                    </label>
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <input
                        type="text"
                        id={bankNameId}
                        placeholder="은행명을 입력해주세요"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                  </div>

                  {/* 계좌번호 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={accountId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      계좌번호 <span className="text-[#F73535]">*</span>
                    </label>
                    <div
                      className={`w-full border p-3 ${
                        accountNumberError
                          ? "border-red-500"
                          : "border-[#D9D9D9]"
                      }`}
                    >
                      <input
                        type="text"
                        id={accountId}
                        placeholder="계좌번호를 입력해주세요"
                        value={accountNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAccountNumber(value);
                          const error = validateAccountNumber(value);
                          setAccountNumberError(error);
                        }}
                        onBlur={() => {
                          const error = validateAccountNumber(accountNumber);
                          setAccountNumberError(error);
                        }}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                    {accountNumberError && (
                      <p className="text-sm text-red-500">
                        {accountNumberError}
                      </p>
                    )}
                  </div>

                  {/* 예금주 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={accountHolderId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      예금주 <span className="text-[#F73535]">*</span>
                    </label>
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <input
                        type="text"
                        id={accountHolderId}
                        placeholder="예금주를 입력해주세요"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                  </div>

                  {/* 농장명 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={farmNameId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      농장명 <span className="text-[#F73535]">*</span>
                    </label>
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <input
                        type="text"
                        id={farmNameId}
                        placeholder="농장 이름을 입력해주세요"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                  </div>

                  {/* 농장 소개 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={farmIntroId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      농장 소개 <span className="text-[#F73535]">*</span>
                    </label>
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <textarea
                        id={farmIntroId}
                        placeholder="농장에 대한 간단한 소개를 작성해주세요"
                        value={farmIntro}
                        onChange={(e) => setFarmIntro(e.target.value)}
                        rows={4}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-[10px] bg-[#F7F7F7] -mx-5 my-4" />

              {/* 필수 제출 서류 섹션 */}
              <div className="px-4 py-4 bg-white rounded shadow-[0_0_10px_2px_rgba(0,0,0,0.1)]">
                <h2 className="text-base font-semibold text-[#262626] mb-4">
                  필수 제출 서류
                </h2>
                <div className="flex flex-col gap-[10px]">
                  {requiredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between gap-3 px-5 py-6 border border-[#D9D9D9]"
                    >
                      <div className="flex flex-col gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {doc.icon}
                          <span className="text-sm font-medium text-[#262626]">
                            {doc.name}
                          </span>
                        </div>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[doc.id] = el;
                          }}
                          type="file"
                          accept={getAcceptTypes(doc.id)}
                          onChange={(e) => handleFileSelect(doc.id, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleFileButtonClick(doc.id)}
                          className="flex items-center gap-4 text-sm text-[#262626] border border-[#D9D9D9] px-7 py-3 w-fit"
                        >
                          <UploadIcon />
                          <span>파일 선택</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!doc.isSubmitted && <InfoCircleGreyIcon />}
                        <div
                          className={`px-2 py-1 rounded ${
                            doc.isSubmitted
                              ? "bg-[#E6F5E9] text-[#133A1B]"
                              : "bg-[#F5F5F5] text-[#8C8C8C]"
                          }`}
                        >
                          <p className="text-xs font-medium">
                            {doc.isSubmitted ? "제출" : "미제출"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-[10px] bg-[#F7F7F7] -mx-5 my-4" />

              {/* 선택 제출 서류 섹션 */}
              <div className="px-4 py-4 bg-white rounded shadow-[0_0_10px_2px_rgba(0,0,0,0.1)]">
                <h2 className="text-base font-semibold text-[#262626] mb-4">
                  선택 제출 서류
                </h2>
                <div className="flex flex-col gap-[10px]">
                  {optionalDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between gap-3 px-5 py-6 border border-[#D9D9D9]"
                    >
                      <div className="flex flex-col gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {doc.icon}
                          <span className="text-sm font-medium text-[#262626]">
                            {doc.name}
                          </span>
                        </div>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[doc.id] = el;
                          }}
                          type="file"
                          accept={getAcceptTypes(doc.id)}
                          onChange={(e) => handleFileSelect(doc.id, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleFileButtonClick(doc.id)}
                          className="flex items-center gap-4 text-sm text-[#262626] border border-[#D9D9D9] px-7 py-3 w-fit"
                        >
                          <UploadIcon />
                          <span>파일 선택</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!doc.isSubmitted && <InfoCircleGreyIcon />}
                        <div
                          className={`px-2 py-1 rounded ${
                            doc.isSubmitted
                              ? "bg-[#E6F5E9] text-[#133A1B]"
                              : "bg-[#F5F5F5] text-[#8C8C8C]"
                          }`}
                        >
                          <p className="text-xs font-medium">
                            {doc.isSubmitted ? "제출" : "미제출"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-[10px] bg-[#F7F7F7] -mx-5 my-4" />

              {/* 약관 섹션 */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleToggleAllAgreements}
                  className="flex items-center gap-3 cursor-pointer"
                  aria-label="판매자 약관 전체동의"
                  tabIndex={0}
                >
                  {agreeToAll ? <CheckboxGreenIcon /> : <CheckboxGreyIcon />}
                  <span className="text-sm text-[#262626]">
                    판매자 약관 전체동의
                  </span>
                </button>
                <div className="w-full h-px bg-[#D9D9D9]" />
                <button
                  type="button"
                  onClick={() => handleAgreementChange("sellerTerms")}
                  className="flex items-center gap-3 cursor-pointer"
                  aria-label="판매자 이용약관 동의"
                >
                  {agreements.sellerTerms ? (
                    <CheckboxGreenIcon />
                  ) : (
                    <CheckboxGreyIcon />
                  )}
                  <span className="text-sm text-[#262626]">
                    판매자 이용약관 동의 (필수)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAgreementChange("commissionPolicy")}
                  className="flex items-center gap-3 cursor-pointer"
                  aria-label="수수료 정책 동의"
                >
                  {agreements.commissionPolicy ? (
                    <CheckboxGreenIcon />
                  ) : (
                    <CheckboxGreyIcon />
                  )}
                  <span className="text-sm text-[#262626]">
                    수수료 정책 동의 (필수)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAgreementChange("privacyPolicy")}
                  className="flex items-center gap-3 cursor-pointer"
                  aria-label="개인정보 처리방침 동의"
                >
                  {agreements.privacyPolicy ? (
                    <CheckboxGreenIcon />
                  ) : (
                    <CheckboxGreyIcon />
                  )}
                  <span className="text-sm text-[#262626]">
                    개인정보 처리방침 동의 (선택)
                  </span>
                </button>
              </div>

              {/* 안내 문구 및 제출 버튼 */}
              <div className="flex flex-col gap-4 pb-4 mt-4">
                <p className="text-xs text-[#8C8C8C] text-center">
                  신청 후 영업일 기준 3~5일 내 검토 결과를 알려드립니다.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 font-semibold text-sm ${
                    isFormValid && !isSubmitting
                      ? "bg-[#133A1B] text-white"
                      : "bg-[#D9D9D9] text-[#8C8C8C] cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "신청 중..." : "판매자 등록 신청"}
                </button>
              </div>
            </>
          ) : (
            /* 신청 현황 탭 */
            <div className="flex flex-col gap-[10px]">
              {isLoadingApplication ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-sm text-[#8C8C8C]">로딩 중...</p>
                </div>
              ) : applicationData !== null && applicationData !== undefined ? (
                <>
                  {/* 신청 정보 카드 */}
                  <div className="px-5 py-6 bg-white border border-[#D9D9D9] rounded shadow-[0_0_10px_2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-[#262626]">
                          판매자 등록 신청
                        </h3>
                        <p className="text-sm text-[#262626]">
                          신청일: {formatDate(applicationData.applied_at)}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded ${
                          applicationData.status === "PENDING"
                            ? "bg-[#F5F5F5] text-[#262626]"
                            : applicationData.status === "APPROVED"
                            ? "bg-[#E6F5E9] text-[#133A1B]"
                            : "bg-[#FFE6E6] text-[#F73535]"
                        }`}
                      >
                        <p className="text-xs font-medium">
                          {applicationData.status === "REJECTED"
                            ? "반려"
                            : applicationData.status_display}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 반려 알림 카드 (REJECTED 상태일 때만) */}
                  {applicationData.status === "REJECTED" &&
                    applicationData.files.some(
                      (file) => file.status === "REJECTED"
                    ) && (
                      <div className="px-5 py-4 bg-[#FFF5F5] border border-[#F73535] rounded">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#F73535] flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">
                              ×
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <p className="text-sm font-semibold text-[#F73535]">
                              일부 서류가 반려되었습니다
                            </p>
                            <p className="text-xs text-[#F73535]">
                              반려된 서류를 다시 제출해주세요.
                            </p>
                            <p className="text-xs text-[#F73535]">
                              반려 사유를 확인하고 수정 후 재제출하시면 됩니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 제출 서류 섹션 (REJECTED 상태일 때만) */}
                  {applicationData.status === "REJECTED" && (
                    <div className="-mx-5">
                      {(() => {
                        const { required, optional } = categorizeFiles();
                        return (
                          <>
                            {/* 구분선 */}
                            {required.length > 0 && (
                              <div className="h-[10px] bg-[#F7F7F7]" />
                            )}
                            {/* 필수 제출 서류 */}
                            {required.length > 0 && (
                              <div className="px-5 py-6 mt-[10px] mx-5 bg-white shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] flex flex-col gap-3">
                                <h4 className="text-sm font-semibold text-[#262626]">
                                  필수 제출 서류
                                </h4>
                                <div className="flex flex-col gap-2">
                                  {required.map((file) => {
                                    const hasUploadedFile =
                                      rejectedFiles[file.id] !== null &&
                                      rejectedFiles[file.id] !== undefined;

                                    return (
                                      <div
                                        key={file.id}
                                        className="px-4 py-3 bg-white border border-[#D9D9D9] rounded flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          {file.status === "APPROVED" ? (
                                            <CircleCheckGreenIcon />
                                          ) : file.status === "REJECTED" ? (
                                            <CircleCheckRedIcon />
                                          ) : null}
                                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[#262626]">
                                              {getFileKindDisplay(file.kinds)}
                                            </span>
                                            {file.rejected_reason && (
                                              <span className="text-xs text-[#F73535]">
                                                {file.rejected_reason}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {file.status === "APPROVED" && (
                                            <div className="px-2 py-1 rounded bg-[#E6F5E9]">
                                              <p className="text-xs font-medium text-[#133A1B]">
                                                승인
                                              </p>
                                            </div>
                                          )}
                                          {file.status === "REJECTED" && (
                                            <>
                                              {!hasUploadedFile ? (
                                                <label className="cursor-pointer">
                                                  <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                      handleRejectedFileSelect(
                                                        file.id,
                                                        e
                                                      )
                                                    }
                                                  />
                                                  <div className="px-3 py-1.5 border border-[#D9D9D9] rounded flex items-center gap-1 hover:bg-[#F5F5F5]">
                                                    <UploadIcon />
                                                    <span className="text-xs text-[#262626]">
                                                      업로드
                                                    </span>
                                                  </div>
                                                </label>
                                              ) : (
                                                <div className="px-2 py-1 rounded bg-[#E6F5E9]">
                                                  <p className="text-xs font-medium text-[#133A1B]">
                                                    업로드 완료
                                                  </p>
                                                </div>
                                              )}
                                              <div className="px-2 py-1 rounded bg-[#FFE6E6]">
                                                <p className="text-xs font-medium text-[#F73535]">
                                                  반려
                                                </p>
                                              </div>
                                            </>
                                          )}
                                          {file.status === "PENDING" && (
                                            <div className="px-2 py-1 rounded bg-[#F5F5F5]">
                                              <p className="text-xs font-medium text-[#262626]">
                                                검토 중
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 구분선 */}
                            {required.length > 0 && optional.length > 0 && (
                              <div className="h-[10px] bg-[#F7F7F7] my-[10px]" />
                            )}

                            {/* 선택 제출 서류 */}
                            {optional.length > 0 && (
                              <div className="px-5 py-6 bg-white shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] flex flex-col gap-3 mx-5 mb-5">
                                <h4 className="text-sm font-semibold text-[#262626]">
                                  선택 제출 서류
                                </h4>
                                <div className="flex flex-col gap-2">
                                  {optional.map((file) => {
                                    const hasUploadedFile =
                                      rejectedFiles[file.id] !== null &&
                                      rejectedFiles[file.id] !== undefined;

                                    return (
                                      <div
                                        key={file.id}
                                        className="px-4 py-3 bg-white border border-[#D9D9D9] rounded flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          {file.status === "APPROVED" ? (
                                            <CircleCheckGreenIcon />
                                          ) : file.status === "REJECTED" ? (
                                            <CircleCheckRedIcon />
                                          ) : null}
                                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <span className="text-sm font-medium text-[#262626]">
                                              {getFileKindDisplay(file.kinds)}
                                            </span>
                                            {file.rejected_reason && (
                                              <span className="text-xs text-[#F73535]">
                                                {file.rejected_reason}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {file.status === "APPROVED" && (
                                            <div className="px-2 py-1 rounded bg-[#E6F5E9]">
                                              <p className="text-xs font-medium text-[#133A1B]">
                                                승인
                                              </p>
                                            </div>
                                          )}
                                          {file.status === "REJECTED" && (
                                            <>
                                              {!hasUploadedFile ? (
                                                <label className="cursor-pointer">
                                                  <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                      handleRejectedFileSelect(
                                                        file.id,
                                                        e
                                                      )
                                                    }
                                                  />
                                                  <div className="px-3 py-1.5 border border-[#D9D9D9] rounded flex items-center gap-1 hover:bg-[#F5F5F5]">
                                                    <UploadIcon />
                                                    <span className="text-xs text-[#262626]">
                                                      업로드
                                                    </span>
                                                  </div>
                                                </label>
                                              ) : (
                                                <div className="px-2 py-1 rounded bg-[#E6F5E9]">
                                                  <p className="text-xs font-medium text-[#133A1B]">
                                                    업로드 완료
                                                  </p>
                                                </div>
                                              )}
                                              <div className="px-2 py-1 rounded bg-[#FFE6E6]">
                                                <p className="text-xs font-medium text-[#F73535]">
                                                  반려
                                                </p>
                                              </div>
                                            </>
                                          )}
                                          {file.status === "PENDING" && (
                                            <div className="px-2 py-1 rounded bg-[#F5F5F5]">
                                              <p className="text-xs font-medium text-[#262626]">
                                                검토 중
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 반려 서류 제출하기 버튼 */}
                            {applicationData.files.some(
                              (file) => file.status === "REJECTED"
                            ) && (
                              <div className="px-5">
                                <button
                                  type="button"
                                  onClick={handleSubmitRejectedFiles}
                                  disabled={
                                    !isAllRejectedFilesUploaded() ||
                                    isSubmitting
                                  }
                                  className={`w-full py-3 rounded font-semibold text-sm ${
                                    isAllRejectedFilesUploaded() &&
                                    !isSubmitting
                                      ? "bg-[#133A1B] text-white"
                                      : "bg-[#D9D9D9] text-[#8C8C8C] cursor-not-allowed"
                                  }`}
                                >
                                  {isSubmitting
                                    ? "제출 중..."
                                    : "반려 서류 제출하기"}
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <p className="text-sm text-[#8C8C8C]">
                    신청 내역이 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BusinessProfileApplyPage;
