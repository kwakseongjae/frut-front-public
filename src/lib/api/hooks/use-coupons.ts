"use client";

import { useQuery } from "@tanstack/react-query";
import { couponsApi } from "../coupons";

export const useApplicableCoupons = (totalAmount: number, enabled = true) => {
	return useQuery({
		queryKey: ["coupons", "applicable", totalAmount],
		queryFn: () => couponsApi.getApplicableCoupons(totalAmount),
		enabled: enabled && totalAmount > 0,
	});
};
