"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import CameraIcon from "@/assets/icon/ic_camera_black_18.svg";
import CheckboxGreenIcon from "@/assets/icon/ic_checkbox_green_18.svg";
import CheckboxGreyIcon from "@/assets/icon/ic_checkbox_grey_18.svg";
import ChevronLeftIcon from "@/assets/icon/ic_chevron_left_black_28.svg";
import CopyIcon from "@/assets/icon/ic_copy_black_20.svg";
import CreditCardIcon from "@/assets/icon/ic_credit_card_black_20.svg";
import DocumentIcon from "@/assets/icon/ic_document_black_20.svg";
import InfoCircleGreyIcon from "@/assets/icon/ic_info_circle_grey_20.svg";
import UploadIcon from "@/assets/icon/ic_upload_black_15.svg";
import ProtectedRoute from "@/components/ProtectedRoute";
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

  // 필수 제출 서류
  const [requiredDocuments, setRequiredDocuments] = useState<DocumentItem[]>([
    {
      id: "online-sales-report",
      name: "통신판매업 신고증",
      icon: <DocumentIcon />,
      file: null,
      isSubmitted: false,
    },
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
    {
      id: "farm-profile-photo",
      name: "농장 프로필 사진",
      icon: <CameraIcon />,
      file: null,
      isSubmitted: false,
    },
  ]);

  // 선택 제출 서류
  const [optionalDocuments, setOptionalDocuments] = useState<DocumentItem[]>([
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

    // 필수 서류 모두 제출되었는지 확인
    const hasAllRequiredDocuments = requiredDocuments.every(
      (doc) => doc.isSubmitted && doc.file !== null
    );

    // 필수 약관 동의 확인
    const hasRequiredAgreements =
      agreements.sellerTerms && agreements.commissionPolicy;

    return hasBasicInfo && hasAllRequiredDocuments && hasRequiredAgreements;
  }, [
    phone,
    email,
    accountNumber,
    bankName,
    accountHolder,
    farmName,
    farmIntro,
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
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <input
                        type="tel"
                        id={phoneId}
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div className="flex flex-col gap-[10px]">
                    <label
                      htmlFor={emailId}
                      className="text-sm font-medium text-[#262626]"
                    >
                      이메일 <span className="text-[#F73535]">*</span>
                    </label>
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <input
                        type="email"
                        id={emailId}
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
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
                    <div className="w-full border border-[#D9D9D9] p-3">
                      <input
                        type="text"
                        id={accountId}
                        placeholder="계좌번호를 입력해주세요"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full text-sm placeholder:text-[#949494] focus:outline-none caret-[#133A1B]"
                      />
                    </div>
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
              {/* 접수 상태 카드 예시 */}
              <div className="px-5 py-6 bg-white border border-[#D9D9D9] rounded shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] relative">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold text-[#262626]">
                      판매자 등록 신청
                    </h3>
                    <p className="text-sm text-[#262626]">신청일: 2025.00.00</p>
                  </div>
                  <div className="px-3 py-1 bg-[#F5F5F5] rounded">
                    <p className="text-xs font-medium text-[#262626]">접수</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BusinessProfileApplyPage;
