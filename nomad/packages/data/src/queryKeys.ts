export const queryKeys = {
  user: {
    all: ['user'] as const,
    me: () => ['user', 'me'] as const,
    preferences: () => ['user', 'preferences'] as const,
    subscription: () => ['user', 'subscription'] as const,
  },
  mealplan: {
    all: ['mealplan'] as const,
    day: (day: string) => ['mealplan', day] as const,
    list: (params?: { start?: string; end?: string }) =>
      ['mealplan', 'list', params] as const,
  },
  recipes: {
    all: ['recipes'] as const,
    list: (filters?: { tags?: string[]; search?: string }) =>
      ['recipes', 'list', filters] as const,
    detail: (id: string) => ['recipes', id] as const,
    favorites: () => ['recipes', 'favorites'] as const,
    search: (query: string) => ['recipes', 'search', query] as const,
  },
  grocery: {
    all: ['grocery'] as const,
    list: () => ['grocery', 'list'] as const,
    detail: (id: string) => ['grocery', id] as const,
  },
  family: {
    all: ['family'] as const,
    households: () => ['family', 'households'] as const,
    household: (id: string) => ['family', 'households', id] as const,
    rooms: () => ['family', 'rooms'] as const,
    room: (id: string) => ['family', 'rooms', id] as const,
    messages: (roomId: string) => ['family', 'rooms', roomId, 'messages'] as const,
  },
  health: {
    all: ['health'] as const,
    metrics: (kind?: string, start?: string, end?: string) =>
      ['health', 'metrics', kind, start, end] as const,
    metric: (id: string) => ['health', 'metrics', id] as const,
  },
} as const;
