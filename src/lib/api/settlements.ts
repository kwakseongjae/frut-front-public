import { apiClient } from "./client";

export interface MonthlySettlementParams {
  month: number; // 1-12
  year: number; // 예: 2025
  period_type?: "FIRST_HALF" | "SECOND_HALF"; // 정산 차수
}

export interface MonthlySettlement {
  year: number;
  month: number;
  settlement_date: string; // YYYY-MM-DD
  total_sales: number;
  commission_amount: number;
  vat_amount: number;
  total_deduction: number;
  expected_settlement: number;
  order_count: number;
  status: "PENDING" | "COMPLETED";
}

export const settlementsApi = {
  getMonthlySettlement: async (
    params: MonthlySettlementParams
  ): Promise<MonthlySettlement> => {
    const searchParams = new URLSearchParams();
    searchParams.append("month", params.month.toString());
    searchParams.append("year", params.year.toString());
    if (params.period_type) {
      searchParams.append("period_type", params.period_type);
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/settlements/seller/monthly${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await apiClient.get<MonthlySettlement>(endpoint);
    return data;
  },
};

