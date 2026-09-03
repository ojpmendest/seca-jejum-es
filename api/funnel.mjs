// Vercel serverless function — reads the quiz funnel from PostHog.
// Requires env var POSTHOG_API_KEY (a PostHog Personal API Key with "Query Read" scope).
// Optional: POSTHOG_PROJECT_ID (default 589285), DASH_SECRET (gate the endpoint).

export default async function handler(req, res) {
  const KEY = process.env.POSTHOG_API_KEY;
  const PROJECT = process.env.POSTHOG_PROJECT_ID || "589285";
  const HOST = "https://us.posthog.com";
  const SECRET = process.env.DASH_SECRET;

  if (SECRET && req.query.k !== SECRET) {
    return res.status(401).json({ error: "no autorizado" });
  }
  if (!KEY) {
    return res.status(500).json({ error: "Falta la variable POSTHOG_API_KEY en Vercel." });
  }

  const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 90);

  const hogql = `
    SELECT toInt(properties.page) AS page, count(DISTINCT person_id) AS people
    FROM events
    WHERE event = 'quiz_step_viewed'
      AND timestamp > now() - INTERVAL ${days} DAY
      AND properties.page IS NOT NULL
    GROUP BY page
    ORDER BY page
  `;

  const extra = `
    SELECT event, count(DISTINCT person_id) AS people
    FROM events
    WHERE event IN ('quiz_started','quiz_completed','checkout_click')
      AND timestamp > now() - INTERVAL ${days} DAY
    GROUP BY event
  `;

  try {
    const call = q =>
      fetch(`${HOST}/api/projects/${PROJECT}/query/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: { kind: "HogQLQuery", query: q } }),
      }).then(async r => {
        const j = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 400));
        return j.results || [];
      });

    const [pages, others] = await Promise.all([call(hogql), call(extra)]);

    const rows = pages.map(([page, people]) => ({ page: Number(page), people: Number(people) }));
    const totals = {};
    others.forEach(([ev, n]) => { totals[ev] = Number(n); });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.json({ days, rows, totals });
  } catch (e) {
    res.status(502).json({ error: "PostHog: " + e.message });
  }
}
