import { type ApiResponse, apiClient } from "./client";
import { queryKeys } from "./query-keys";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  user_type: "CONSUMER" | "SELLER" | "ADMIN";
  point_balance: number;
  is_marketing_consented: boolean;
  user_note: string | null;
  date_joined: string;
  last_login: string | null;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: Tokens;
}

export interface RefreshRequest {
  refresh: string;
}

export interface RefreshResponse {
  access: string;
  refresh: string;
}

export interface SendSmsRequest {
  phone: string;
}

export interface SendSmsResponse {
  success: boolean;
  data: null;
  message: string;
}

export interface VerifySmsRequest {
  phone: string;
  code: string;
}

export interface VerifySmsResponse {
  success: boolean;
  data: null;
  message: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  marketing_agreed: boolean;
}

export interface RegisterResponse {
  success: boolean;
  data: User;
  message: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const data = await apiClient.post<LoginResponse>(
      "/api/users/auth/login",
      credentials
    );
    return data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const data = await apiClient.post<RefreshResponse>(
      "/api/users/auth/refresh",
      { refresh: refreshToken }
    );
    return data;
  },

  sendSmsVerification: async (
    request: SendSmsRequest
  ): Promise<SendSmsResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/auth/sms/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    const data: SendSmsResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "인증번호 발송에 실패했습니다.");
    }

    return data;
  },

  verifySmsCode: async (
    request: VerifySmsRequest
  ): Promise<VerifySmsResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/auth/sms/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    const data: VerifySmsResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "인증번호 확인에 실패했습니다.");
    }

    return data;
  },

  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    const data: RegisterResponse = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || "회원가입에 실패했습니다.");
      // 필드별 에러 정보를 에러 객체에 포함
      (
        error as Error & { fieldErrors?: Record<string, string[]> }
      ).fieldErrors = (
        data as unknown as { data?: Record<string, string[]> }
      ).data;
      throw error;
    }

    return data;
  },

  findUsername: async (phone: string): Promise<{ username: string }> => {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || ""
      }/api/users/auth/find-username`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      }
    );

    const data: ApiResponse<{ username: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "아이디 찾기에 실패했습니다.");
    }

    return data.data;
  },

  verifyPasswordReset: async (
    username: string,
    phone: string
  ): Promise<{ reset_token: string }> => {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || ""
      }/api/users/auth/find-password/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, phone }),
      }
    );

    const data: ApiResponse<{ reset_token: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "본인 확인에 실패했습니다.");
    }

    return data.data;
  },

  resetPassword: async (
    resetToken: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<void> => {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || ""
      }/api/users/auth/find-password/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        }),
      }
    );

    const data: ApiResponse<null> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "비밀번호 변경에 실패했습니다.");
    }
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<void> => {
    const data = await apiClient.post<void>("/api/users/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return data;
  },

  withdraw: async (
    password: string,
    reason: string,
    detail?: string
  ): Promise<void> => {
    const data = await apiClient.post<void>("/api/users/auth/withdraw", {
      password,
      reason,
      detail: detail || undefined,
    });
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    const data = await apiClient.post<void>("/api/users/auth/logout", {
      refresh: refreshToken,
    });
    return data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || ""
      }/api/users/auth/check-username`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }
    );

    const data: ApiResponse<{ available: boolean }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "아이디 중복 확인에 실패했습니다.");
    }

    return data.data;
  },
};

export const authQueryKeys = {
  all: queryKeys.users.auth.all,
  login: queryKeys.users.auth.login,
  refresh: queryKeys.users.auth.refresh,
};
