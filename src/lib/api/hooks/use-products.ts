"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type CreateProductRequest,
  type ProductListParams,
  productsApi,
  productsQueryKeys,
  type SellerManagementParams,
  type SellerProductsParams,
  type UpdateProductRequest,
} from "../products";

export const useProducts = (params?: ProductListParams) => {
  return useQuery({
    queryKey: productsQueryKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
  });
};

export const useInfiniteProducts = (
  params?: Omit<ProductListParams, "page">
) => {
  // type 또는 category_id가 있으면 쿼리 실행
  const hasType = !!params?.type;
  const hasCategoryId = !!params?.category_id;
  const enabled = hasType || hasCategoryId;

  return useInfiniteQuery({
    queryKey: productsQueryKeys.list(params),
    queryFn: async ({ pageParam = 1 }) => {
      // type도 없고 category_id도 없으면 빈 결과 반환
      if (!params?.type && !params?.category_id) {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }

      try {
        return await productsApi.getProducts({ ...params, page: pageParam });
      } catch (error) {
        // 에러 발생 시 빈 결과 반환
        console.error("Failed to fetch products:", error);
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
    },
    getNextPageParam: (lastPage) => {
      // lastPage가 없거나 next가 없으면 undefined 반환
      if (!lastPage || !lastPage.next) {
        return undefined;
      }

      try {
        // next URL이 상대 URL일 수 있으므로 절대 URL로 변환
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = new URL(lastPage.next, baseUrl);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch {
        // URL 파싱 실패 시 undefined 반환
        return undefined;
      }
    },
    initialPageParam: 1,
    enabled, // type 또는 category_id가 있을 때 쿼리 실행
  });
};

export const useCategories = (isActive?: boolean) => {
  return useQuery({
    queryKey: productsQueryKeys.categories(isActive),
    queryFn: () => productsApi.getCategories(isActive),
  });
};

export const useSellerProducts = (
  params: SellerProductsParams & { enabled?: boolean }
) => {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: productsQueryKeys.sellerProducts(queryParams.farm_id),
    queryFn: () => productsApi.getSellerProducts(queryParams),
    enabled,
  });
};

export const useInfiniteSellerProducts = (
  params: Omit<SellerProductsParams, "page"> & { enabled?: boolean }
) => {
  const { enabled = true, ...queryParams } = params;
  return useInfiniteQuery({
    queryKey: [
      ...productsQueryKeys.sellerProducts(queryParams.farm_id),
      "infinite",
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return await productsApi.getSellerProducts({
        ...queryParams,
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
    enabled,
  });
};

export const useMySellerItems = () => {
  return useQuery({
    queryKey: productsQueryKeys.mySellerItems(),
    queryFn: () => productsApi.getMySellerItems(),
  });
};

export const useInfiniteMySellerItems = () => {
  return useInfiniteQuery({
    queryKey: [...productsQueryKeys.mySellerItems(), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return await productsApi.getMySellerItems(pageParam);
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

export const useSellerManagementProducts = (
  params?: SellerManagementParams
) => {
  return useQuery({
    queryKey: productsQueryKeys.sellerManagement(params),
    queryFn: () => productsApi.getSellerManagementProducts(params),
  });
};

export const useInfiniteSellerManagementProducts = (
  params?: Omit<SellerManagementParams, "page">
) => {
  return useInfiniteQuery({
    queryKey: [...productsQueryKeys.sellerManagement(params), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productsApi.getSellerManagementProducts({
        ...params,
        page: pageParam,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.products || !lastPage.products.next) {
        return undefined;
      }
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = new URL(lastPage.products.next, baseUrl);
        const pageParam = url.searchParams.get("page");
        return pageParam ? parseInt(pageParam, 10) : undefined;
      } catch {
        return undefined;
      }
    },
    initialPageParam: 1,
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      status,
    }: {
      productId: number;
      status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
    }) => productsApi.updateProductStatus(productId, status),
    onSuccess: () => {
      // 상품관리 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [productsQueryKeys.all[0], "seller-management"],
      });
      // 내 상품 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.mySellerItems(),
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      // 상품관리 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [productsQueryKeys.all[0], "seller-management"],
      });
      // 내 상품 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.mySellerItems(),
      });
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProductRequest) =>
      productsApi.createProduct(request),
    onSuccess: () => {
      // 상품관리 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [productsQueryKeys.all[0], "seller-management"],
      });
      // 내 상품 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.mySellerItems(),
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      request,
    }: {
      productId: number;
      request: UpdateProductRequest;
    }) => productsApi.updateProduct(productId, request),
    onSuccess: (_, variables) => {
      // 상품 상세 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.productId),
      });
      // 상품관리 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: [productsQueryKeys.all[0], "seller-management"],
      });
      // 내 상품 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.mySellerItems(),
      });
    },
  });
};

export const useRecommendedSearchTerms = () => {
  return useQuery({
    queryKey: productsQueryKeys.recommendedSearchTerms(),
    queryFn: () => productsApi.getRecommendedSearchTerms(),
  });
};
