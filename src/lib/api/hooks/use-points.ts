"use client";

import { useQuery } from "@tanstack/react-query";
import { pointsApi } from "../points";

export const usePointsBalance = () => {
	return useQuery({
		queryKey: ["points", "balance"],
		queryFn: () => pointsApi.getBalance(),
	});
};

export const usePointsHistory = () => {
	return useQuery({
		queryKey: ["points", "history"],
		queryFn: () => pointsApi.getHistory(),
	});
};
