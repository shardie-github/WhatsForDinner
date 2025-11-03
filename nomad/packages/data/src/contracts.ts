export const API_VERSION = 'v1';

export function v1(path: string): string {
  return `/api/${API_VERSION}${path}`;
}

export const endpoints = {
  auth: {
    login: v1('/auth/login'),
    register: v1('/auth/register'),
    logout: v1('/auth/logout'),
    refresh: v1('/auth/refresh'),
    oauth: {
      google: v1('/auth/oauth/google'),
      apple: v1('/auth/oauth/apple'),
    },
  },
  user: {
    me: v1('/user/me'),
    update: v1('/user/me'),
    preferences: v1('/user/preferences'),
    subscription: v1('/user/subscription'),
  },
  mealplan: {
    list: v1('/mealplan'),
    get: (day: string) => v1(`/mealplan/${day}`),
    create: v1('/mealplan'),
    update: (id: string) => v1(`/mealplan/${id}`),
    delete: (id: string) => v1(`/mealplan/${id}`),
    generate: v1('/mealplan/generate'),
  },
  recipes: {
    list: v1('/recipes'),
    get: (id: string) => v1(`/recipes/${id}`),
    search: v1('/recipes/search'),
    favorites: v1('/recipes/favorites'),
    favorite: (id: string) => v1(`/recipes/${id}/favorite`),
  },
  grocery: {
    list: v1('/grocery'),
    get: (id: string) => v1(`/grocery/${id}`),
    create: v1('/grocery'),
    update: (id: string) => v1(`/grocery/${id}`),
    delete: (id: string) => v1(`/grocery/${id}`),
    sync: v1('/grocery/sync'),
  },
  family: {
    households: v1('/family/households'),
    household: (id: string) => v1(`/family/households/${id}`),
    invite: v1('/family/invite'),
    members: (id: string) => v1(`/family/households/${id}/members`),
    rooms: v1('/family/rooms'),
    room: (id: string) => v1(`/family/rooms/${id}`),
    messages: (roomId: string) => v1(`/family/rooms/${roomId}/messages`),
    message: (roomId: string, messageId: string) =>
      v1(`/family/rooms/${roomId}/messages/${messageId}`),
  },
  health: {
    metrics: v1('/health/metrics'),
    metric: (id: string) => v1(`/health/metrics/${id}`),
    sync: v1('/health/sync'),
  },
  ads: {
    house: v1('/ads/house'),
    frequency: v1('/ads/frequency'),
  },
  partners: {
    instacart: {
      connect: v1('/partners/instacart/connect'),
      cart: v1('/partners/instacart/cart'),
      deeplink: v1('/partners/instacart/deeplink'),
    },
    walmart: {
      connect: v1('/partners/walmart/connect'),
      cart: v1('/partners/walmart/cart'),
      deeplink: v1('/partners/walmart/deeplink'),
    },
  },
} as const;

export type APIResponse<T> = {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
};

export type APIError = {
  code: string;
  message: string;
  details?: unknown;
};

export type PaginatedResponse<T> = APIResponse<T[]> & {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
