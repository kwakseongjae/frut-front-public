"use client";

import { useQuery } from "@tanstack/react-query";
import { type MonthlySettlementParams, settlementsApi } from "../settlements";

export const useMonthlySettlement = (params: MonthlySettlementParams) => {
  return useQuery({
    queryKey: ["settlements", "monthly", params.year, params.month],
    queryFn: () => settlementsApi.getMonthlySettlement(params),
    enabled:
      !!params.year &&
      !!params.month &&
      params.month >= 1 &&
      params.month <= 12,
  });
};

















