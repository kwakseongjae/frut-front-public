"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "../coupons";

export const useApplicableCoupons = (totalAmount: number, enabled = true) => {
	return useQuery({
		queryKey: ["coupons", "applicable", totalAmount],
		queryFn: () => couponsApi.getApplicableCoupons(totalAmount),
		enabled: enabled && totalAmount > 0,
	});
};

export const useUserCoupons = () => {
	return useQuery({
		queryKey: ["coupons", "user-coupons"],
		queryFn: () => couponsApi.getUserCoupons(),
	});
};

export const useAvailableCoupons = () => {
	return useQuery({
		queryKey: ["coupons", "available"],
		queryFn: () => couponsApi.getAvailableCoupons(),
	});
};

export const useDownloadCoupon = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (couponId: number) => couponsApi.downloadCoupon(couponId),
		onSuccess: () => {
			// 다운로드 가능한 쿠폰 목록 무효화
			queryClient.invalidateQueries({
				queryKey: ["coupons", "available"],
			});
			// 보유 쿠폰 목록도 무효화
			queryClient.invalidateQueries({
				queryKey: ["coupons", "user-coupons"],
			});
		},
	});
};
