"use client";

import { useMutation } from "@tanstack/react-query";
import { type OrderPreviewRequest, ordersApi } from "../orders";

export const useOrderPreview = () => {
	return useMutation({
		mutationFn: (request: OrderPreviewRequest) => ordersApi.preview(request),
	});
};

