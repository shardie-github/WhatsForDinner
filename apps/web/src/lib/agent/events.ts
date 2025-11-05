export function track(
  userId: string, 
  payload: { 
    type: string; 
    path?: string; 
    meta?: any; 
    session_id?: string; 
    app?: string 
  }
) {
  try {
    const body = JSON.stringify({ 
      user_id: userId, 
      session_id: payload.session_id || getSessionId(), 
      app: payload.app || "web", 
      type: payload.type, 
      path: payload.path || (typeof window !== 'undefined' ? window.location?.pathname : ''), 
      meta: payload.meta 
    });
    
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon("/api/ingest", body);
    } else {
      fetch("/api/ingest", { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body 
      }).catch(() => {}); // Silently fail
    }
  } catch {
    // Silently fail
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('agent_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('agent_session_id', sessionId);
  }
  return sessionId;
}
