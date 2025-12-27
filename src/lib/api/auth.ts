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

// SNS 로그인 관련 타입 및 API
export type SnsType = "KAKAO" | "NAVER";

export interface SnsPrepareRequest {
  sns_type: SnsType;
  code: string;
  redirect_uri?: string; // Kakao 필수
  state?: string; // Naver 필수
}

export interface SnsPrepareResponse {
  username: string;
  name: string;
  email: string | null;
  sns_type: SnsType;
  sns_id: string;
  is_existing_user: boolean;
  prepare_token: string;
}

export interface SnsLoginRequest {
  sns_type: SnsType;
  code: string;
  redirect_uri?: string; // Kakao 필수
  state?: string; // Naver 필수
  prepare_token: string;
}

export interface SnsRegisterRequest {
  prepare_token: string;
  name: string;
  phone: string;
  email?: string;
  marketing_agreed: boolean;
}

export const snsAuthApi = {
  prepare: async (request: SnsPrepareRequest): Promise<SnsPrepareResponse> => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      console.log("SNS prepare API 호출:", {
        url: `${apiBaseUrl}/api/users/auth/sns/prepare`,
        request,
      });

      const data = await apiClient.post<SnsPrepareResponse>(
        "/api/users/auth/sns/prepare",
        request
      );
      return data;
    } catch (error) {
      console.error("SNS prepare API 호출 실패:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
              }
            : String(error),
        request,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "설정되지 않음",
      });
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "SNS 정보 확인에 실패했습니다. 네트워크 연결을 확인해주세요."
      );
    }
  },

  login: async (request: SnsLoginRequest): Promise<LoginResponse> => {
    try {
      const data = await apiClient.post<LoginResponse>(
        "/api/users/auth/sns/login",
        request
      );
      return data;
    } catch (error) {
      console.error("SNS login API 호출 실패:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "SNS 로그인에 실패했습니다. 네트워크 연결을 확인해주세요."
      );
    }
  },

  register: async (request: SnsRegisterRequest): Promise<RegisterResponse> => {
    try {
      // apiClient를 사용하되, 201 응답도 성공으로 처리하기 위해 직접 처리
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(
        `${apiBaseUrl}/api/users/auth/sns/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      const data: RegisterResponse = await response.json();

      // 201 (Created) 또는 200 (OK) 응답은 성공으로 처리
      if (
        (response.status === 201 || response.status === 200) &&
        data.success
      ) {
        return data;
      }

      // 에러 응답 처리
      const error = new Error(data.message || "SNS 회원가입에 실패했습니다.");
      // 필드별 에러 정보를 에러 객체에 포함
      (
        error as Error & { fieldErrors?: Record<string, string[]> }
      ).fieldErrors = (
        data as unknown as { data?: Record<string, string[]> }
      ).data;
      throw error;
    } catch (error) {
      console.error("SNS register API 호출 실패:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "SNS 회원가입에 실패했습니다. 네트워크 연결을 확인해주세요."
      );
    }
  },
};

export const authQueryKeys = {
  all: queryKeys.users.auth.all,
  login: queryKeys.users.auth.login,
  refresh: queryKeys.users.auth.refresh,
};
