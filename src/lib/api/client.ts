const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  data?: {
    title: string;
    message: string;
    expected_end_time: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAccessToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private async getRefreshToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  private async setTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  private async clearTokens(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseURL}/api/users/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens();
        return null;
      }

      const data: ApiResponse<{ access: string; refresh: string }> =
        await response.json();

      if (data.success && data.data) {
        await this.setTokens(data.data.access, data.data.refresh);
        return data.data.access;
      }

      return null;
    } catch {
      await this.clearTokens();
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = await this.getAccessToken();

    // 헤더 병합: options의 headers를 먼저 처리
    const headers = new Headers(options.headers);

    // body가 있는 경우에만 Content-Type 설정 (이미 설정되어 있지 않은 경우)
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // 네트워크 레벨 에러 처리
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.error("API 요청 네트워크 에러:", {
        url,
        endpoint: endpoint,
        baseURL: this.baseURL,
        errorMessage,
        errorName,
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
              }
            : String(error),
      });

      // 더 구체적인 에러 메시지 제공
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        throw new Error(
          `네트워크 연결에 실패했습니다. API 서버(${
            this.baseURL || "설정되지 않음"
          })에 연결할 수 없습니다.`
        );
      }

      throw new Error(`네트워크 연결에 실패했습니다: ${errorMessage}`);
    }

    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401) {
      if (accessToken) {
        const newAccessToken = await this.refreshAccessToken();
        if (newAccessToken) {
          const retryHeaders = new Headers(headers);
          retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);
          response = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
        } else {
          // 리프레시 실패 시 로그아웃 처리 및 로그인 페이지로 리다이렉트
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:logout"));
            const currentPath = window.location.pathname;
            window.location.href = `/signin?redirect=${encodeURIComponent(
              currentPath
            )}`;
          }
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
        }
      } else {
        // 토큰이 없는 경우(로그인하지 않은 경우)
        // 공개 API일 수 있으므로 리다이렉트하지 않고 에러만 던짐
        throw new Error("로그인이 필요합니다.");
      }
    }

    if (!response.ok) {
      // 503 에러 처리 (점검 모드)
      if (response.status === 503) {
        try {
          const errorData: ApiError = await response.json();
          if (errorData.data) {
            // 점검 정보를 sessionStorage에 저장
            if (typeof window !== "undefined") {
              sessionStorage.setItem(
                "maintenanceData",
                JSON.stringify(errorData.data)
              );
              // 점검 페이지로 리다이렉트 (현재 페이지가 점검 페이지가 아닌 경우만)
              if (window.location.pathname !== "/maintenance") {
                window.location.href = "/maintenance";
              }
            }
          }
        } catch (error) {
          console.error("점검 정보 파싱 실패:", error);
        }
        // 점검 페이지로 리다이렉트했으므로 에러를 던지지 않고 대기
        return new Promise(() => {}) as T;
      }

      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        message: "요청 처리 중 오류가 발생했습니다.",
      }));
      throw new Error(errorData.message || "요청 처리 중 오류가 발생했습니다.");
    }

    // 응답 본문이 있는지 확인 (DELETE 요청의 경우 빈 응답일 수 있음)
    const contentType = response.headers.get("content-type");
    const hasBody = contentType?.includes("application/json");

    if (!hasBody) {
      // 응답 본문이 없거나 JSON이 아닌 경우 빈 데이터 반환
      return null as T;
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      // 빈 응답 본문인 경우
      return null as T;
    }

    const data: ApiResponse<T> = JSON.parse(text);
    return data.data;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
