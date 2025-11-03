import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('nomad_session');
  
  if (!session) {
    return null;
  }

  try {
    // Verify session token
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}
