import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type FAQType, operationsApi } from "../operations";

const operationsQueryKeys = {
  all: ["operations"] as const,
  notices: () => [...operationsQueryKeys.all, "notices"] as const,
  noticeDetail: (id: number) =>
    [...operationsQueryKeys.notices(), "detail", id] as const,
};

export const useInfiniteNotices = () => {
  return useInfiniteQuery({
    queryKey: [...operationsQueryKeys.notices(), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await operationsApi.getNotices(pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.next) {
        return undefined;
      }
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = new URL(lastPage.next, baseUrl);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch {
        return undefined;
      }
    },
    initialPageParam: 1,
  });
};

export const useNoticeDetail = (id: number, enabled: boolean) => {
  return useQuery({
    queryKey: operationsQueryKeys.noticeDetail(id),
    queryFn: () => operationsApi.getNoticeDetail(id),
    enabled: enabled && !!id,
  });
};

export const useInfiniteFAQs = (faqType?: FAQType) => {
  return useInfiniteQuery({
    queryKey: [
      ...operationsQueryKeys.all,
      "faqs",
      "infinite",
      faqType || "all",
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return await operationsApi.getFAQs({
        faq_type: faqType,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.next) {
        return undefined;
      }
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = new URL(lastPage.next, baseUrl);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch {
        return undefined;
      }
    },
    initialPageParam: 1,
  });
};

export const useFAQDetail = (id: number, enabled: boolean) => {
  return useQuery({
    queryKey: [...operationsQueryKeys.all, "faqs", "detail", id],
    queryFn: () => operationsApi.getFAQDetail(id),
    enabled: enabled && !!id,
  });
};
