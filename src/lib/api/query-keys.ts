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
  sellers: {
    all: ["sellers"] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    reviewable: () => ["reviews", "reviewable"] as const,
    written: () => ["reviews", "written"] as const,
    seller: (farmId: number) => ["reviews", "seller", farmId] as const,
    mySeller: () => ["reviews", "my-seller"] as const,
  },
} as const;
