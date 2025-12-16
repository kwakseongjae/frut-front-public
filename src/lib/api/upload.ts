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

export const uploadApi = {
	generateSignedUrl: async (
		request: GenerateSignedUrlRequest,
	): Promise<GenerateSignedUrlResponse["data"]> => {
		const data = await apiClient.post<GenerateSignedUrlResponse["data"]>(
			"/api/generate-upload-signed-url",
			request,
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
};










