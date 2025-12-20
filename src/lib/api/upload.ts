import { apiClient } from "./client";

export interface GenerateSignedUrlRequest {
  file_name: string;
  content_type: string;
}

export interface GenerateSignedUrlResponse {
  success: boolean;
  data: {
    signed_url: string;
    gcs_path: string;
  };
  message: string;
}

export interface GenerateContentUploadSignedUrlRequest {
  file_name: string;
  content_type: string;
}

export interface GenerateContentReadSignedUrlRequest {
  gcs_path: string;
}

export interface GenerateContentReadSignedUrlResponse {
  success: boolean;
  data: {
    gcs_path: string;
    signed_url: string;
  };
  message: string;
}

export const uploadApi = {
  generateSignedUrl: async (
    request: GenerateSignedUrlRequest
  ): Promise<GenerateSignedUrlResponse["data"]> => {
    const data = await apiClient.post<GenerateSignedUrlResponse["data"]>(
      "/api/generate-upload-signed-url",
      request
    );
    return data;
  },

  uploadToGCS: async (file: File, signedUrl: string): Promise<void> => {
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("GCS 업로드에 실패했습니다.");
    }
  },

  // 상품 설명용 content/ 경로 업로드 Signed URL 생성
  generateContentUploadSignedUrl: async (
    request: GenerateContentUploadSignedUrlRequest
  ): Promise<GenerateSignedUrlResponse["data"]> => {
    const data = await apiClient.post<GenerateSignedUrlResponse["data"]>(
      "/api/generate-content-upload-signed-url",
      request
    );
    return data;
  },

  // 상품 설명용 content/ 경로 읽기 Signed URL 생성
  generateContentReadSignedUrl: async (
    request: GenerateContentReadSignedUrlRequest
  ): Promise<GenerateContentReadSignedUrlResponse["data"]> => {
    const data = await apiClient.post<
      GenerateContentReadSignedUrlResponse["data"]
    >("/api/generate-content-read-signed-url", request);
    return data;
  },
};


