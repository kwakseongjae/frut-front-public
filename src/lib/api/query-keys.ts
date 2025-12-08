export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => ["auth", "user"] as const,
  },
  users: {
    all: ["users"] as const,
    auth: {
      all: ["users", "auth"] as const,
      login: () => ["users", "auth", "login"] as const,
      refresh: () => ["users", "auth", "refresh"] as const,
    },
  },
  products: {
    all: ["products"] as const,
  },
} as const;
