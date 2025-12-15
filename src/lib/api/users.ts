import { apiClient } from "./client";

export interface UserProfile {
	username: string;
	phone: string;
	email: string;
	is_marketing_consented: boolean;
	is_sms_consented: boolean;
	is_email_consented: boolean;
}

export interface ChangePhoneRequest {
	phone: string;
}

export interface UpdateProfileRequest {
	email?: string;
	is_marketing_consented?: boolean;
	is_sms_consented?: boolean;
	is_email_consented?: boolean;
}

export interface Address {
	id: number;
	address_name: string;
	recipient_name: string;
	recipient_phone: string;
	zipcode: string;
	address: string;
	detail_address: string | null;
	is_default: boolean;
	delivery_request: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateAddressRequest {
	address_name: string;
	recipient_name: string;
	recipient_phone: string;
	zipcode: string;
	address: string;
	detail_address?: string | null;
	is_default: boolean;
	delivery_request?: string | null;
}

export interface UpdateAddressRequest {
	address_name: string;
	recipient_name: string;
	recipient_phone: string;
	zipcode: string;
	address: string;
	detail_address?: string | null;
	is_default: boolean;
	delivery_request?: string | null;
}

export const usersApi = {
	getProfile: async (): Promise<UserProfile> => {
		const data = await apiClient.get<UserProfile>("/api/users/profile");
		return data;
	},

	changePhone: async (phone: string): Promise<void> => {
		await apiClient.post<void>("/api/users/profile/phone", {
			phone,
		});
	},

	updateProfile: async (
		request: UpdateProfileRequest,
	): Promise<UserProfile> => {
		const data = await apiClient.patch<UserProfile>(
			"/api/users/profile",
			request,
		);
		return data;
	},

	getAddresses: async (): Promise<Address[]> => {
		const data = await apiClient.get<Address[]>("/api/users/addresses");
		return data;
	},

	createAddress: async (request: CreateAddressRequest): Promise<Address> => {
		const data = await apiClient.post<Address>("/api/users/addresses", request);
		return data;
	},

	updateAddress: async (
		id: number,
		request: UpdateAddressRequest,
	): Promise<Address> => {
		const data = await apiClient.patch<Address>(
			`/api/users/addresses/${id}`,
			request,
		);
		return data;
	},

	deleteAddress: async (id: number): Promise<void> => {
		await apiClient.delete<void>(`/api/users/addresses/${id}`);
	},
};
