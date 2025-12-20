import { apiClient } from "./client";
import type { PaginatedResponse } from "./products";

export type BannerAdType = "MAIN" | "MIDDLE" | "MYPAGE";

export interface BannerAd {
  id: number;
  ad_image: string;
  ad_url: string;
}

export interface GetBannerAdsParams {
  ad_type?: BannerAdType;
}

export interface Notice {
  id: number;
  title: string;
  view_count: number;
  created_at: string;
}

export interface NoticeDetail extends Notice {
  content: string;
}

export interface NoticesResponse extends PaginatedResponse<Notice> {}

export type FAQType = "ACCOUNT" | "ORDER" | "DELIVERY" | "CANCEL" | "ETC";

export interface FAQ {
  id: number;
  faq_type: FAQType;
  title: string;
  view_count: number;
  created_at: string;
}

export interface FAQDetail extends FAQ {
  content: string;
}

export interface FAQsResponse extends PaginatedResponse<FAQ> {}

export interface GetFAQsParams {
  faq_type?: FAQType;
  page?: number;
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
      {}
    );
  },
  getNotices: async (page?: number): Promise<NoticesResponse> => {
    // API 응답이 직접 데이터 형식일 수 있으므로 직접 처리
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append("page", page.toString());
    }
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/operations/notices${
      queryString ? `?${queryString}` : ""
    }`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("공지사항 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      // data가 배열인 경우 (페이지네이션 없음)
      if (Array.isArray(jsonData.data)) {
        return {
          count: jsonData.data.length,
          next: null,
          previous: null,
          results: jsonData.data,
        };
      }
      // data가 페이지네이션 형식인 경우
      if (
        jsonData.data.count !== undefined &&
        jsonData.data.results !== undefined
      ) {
        return jsonData.data as NoticesResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as NoticesResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },
  getNoticeDetail: async (id: number): Promise<NoticeDetail> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/operations/notices/${id}`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("공지사항 상세를 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as NoticeDetail;
    }

    // 직접 데이터 형식인 경우
    if (jsonData.id && jsonData.title) {
      return jsonData as NoticeDetail;
    }

    throw new Error("공지사항 상세 데이터 형식이 올바르지 않습니다.");
  },
  getFAQs: async (params?: GetFAQsParams): Promise<FAQsResponse> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const searchParams = new URLSearchParams();

    if (params?.faq_type) {
      searchParams.append("faq_type", params.faq_type);
    }
    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/operations/faqs${
      queryString ? `?${queryString}` : ""
    }`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("FAQ 목록을 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      // data가 배열인 경우 (페이지네이션 없음)
      if (Array.isArray(jsonData.data)) {
        return {
          count: jsonData.data.length,
          next: null,
          previous: null,
          results: jsonData.data,
        };
      }
      // data가 페이지네이션 형식인 경우
      if (
        jsonData.data.count !== undefined &&
        jsonData.data.results !== undefined
      ) {
        return jsonData.data as FAQsResponse;
      }
    }

    // 직접 페이지네이션 형식인 경우
    if (jsonData.count !== undefined && jsonData.results !== undefined) {
      return jsonData as FAQsResponse;
    }

    // 기본값 반환
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },
  getFAQDetail: async (id: number): Promise<FAQDetail> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const url = `${API_BASE_URL}/api/operations/faqs/${id}`;

    let accessToken: string | null = null;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("FAQ 상세를 불러오는데 실패했습니다.");
    }

    const jsonData = await response.json();

    // 응답이 { success, data } 형식인지 확인
    if (jsonData.success && jsonData.data) {
      return jsonData.data as FAQDetail;
    }

    // 직접 데이터 형식인 경우
    if (jsonData.id && jsonData.title) {
      return jsonData as FAQDetail;
    }

    throw new Error("FAQ 상세 데이터 형식이 올바르지 않습니다.");
  },
};
