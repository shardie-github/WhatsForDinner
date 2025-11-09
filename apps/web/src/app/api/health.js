export const config = { runtime: "edge" };

export default () =>
  new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    headers: { "Content-Type": "application/json" },
  });
