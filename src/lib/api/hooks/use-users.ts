"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateAddressRequest,
  type UpdateAddressRequest,
  type UpdateProfileRequest,
  usersApi,
} from "../users";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["users", "profile"],
    queryFn: () => usersApi.getProfile(),
  });
};

export const useChangePhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phone: string) => usersApi.changePhone(phone),
    onSuccess: () => {
      // 프로필 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ["users", "profile"],
      });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) =>
      usersApi.updateProfile(request),
    onSuccess: () => {
      // 프로필 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ["users", "profile"],
      });
    },
  });
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ["users", "addresses"],
    queryFn: () => usersApi.getAddresses(),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAddressRequest) =>
      usersApi.createAddress(request),
    onSuccess: () => {
      // 배송지 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["users", "addresses"],
      });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateAddressRequest;
    }) => usersApi.updateAddress(id, request),
    onSuccess: () => {
      // 배송지 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["users", "addresses"],
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteAddress(id),
    onSuccess: () => {
      // 배송지 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["users", "addresses"],
      });
    },
  });
};
