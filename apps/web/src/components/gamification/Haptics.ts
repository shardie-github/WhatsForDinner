export const hapticTap = () => { if (typeof window !== "undefined" && "vibrate" in navigator) { try { navigator.vibrate?.(20); } catch {} } };
