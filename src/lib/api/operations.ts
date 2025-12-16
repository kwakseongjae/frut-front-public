import { apiClient } from "./client";

export type BannerAdType = "MAIN" | "MIDDLE" | "MYPAGE";

export interface BannerAd {
	id: number;
	ad_image: string;
	ad_url: string;
}

export interface GetBannerAdsParams {
	ad_type?: BannerAdType;
}

export const operationsApi = {
	getBannerAds: async (params?: GetBannerAdsParams): Promise<BannerAd[]> => {
		const searchParams = new URLSearchParams();
		if (params?.ad_type) {
			searchParams.append("ad_type", params.ad_type);
		}
		const queryString = searchParams.toString();
		const endpoint = `/api/operations/banner-ads/active${
			queryString ? `?${queryString}` : ""
		}`;
		const data = await apiClient.get<BannerAd[]>(endpoint);
		return data;
	},
	incrementBannerView: async (id: number): Promise<void> => {
		await apiClient.post(`/api/operations/banner-ads/${id}/increment-view`, {});
	},
	incrementBannerClick: async (id: number): Promise<void> => {
		await apiClient.post(
			`/api/operations/banner-ads/${id}/increment-click`,
			{},
		);
	},
};









