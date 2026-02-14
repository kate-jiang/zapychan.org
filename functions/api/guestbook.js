function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "").trim();
}

async function hashIp(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 100"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch entries" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const body = await request.json();
    let { name, message } = body;

    // Validate and sanitize
    if (!name || !message) {
      return new Response(
        JSON.stringify({ error: "Name and message are required" }),
        { status: 400, headers }
      );
    }

    name = stripHtml(String(name)).slice(0, 30);
    message = stripHtml(String(message)).slice(0, 500);

    if (name.length === 0 || message.length === 0) {
      return new Response(
        JSON.stringify({ error: "Name and message cannot be empty" }),
        { status: 400, headers }
      );
    }

    // Rate limit by IP hash
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await hashIp(ip);

    // Check cooldown (10 seconds between posts)
    const cooldownCheck = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM guestbook WHERE ip_hash = ? AND created_at > datetime('now', '-10 seconds')"
    )
      .bind(ipHash)
      .first();

    if (cooldownCheck && cooldownCheck.cnt > 0) {
      return new Response(
        JSON.stringify({ error: "Too fast! Wait a moment before signing again." }),
        { status: 429, headers }
      );
    }

    // Check daily limit (5 per day)
    const dailyCheck = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM guestbook WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')"
    )
      .bind(ipHash)
      .first();

    if (dailyCheck && dailyCheck.cnt >= 5) {
      return new Response(
        JSON.stringify({ error: "You've signed enough for today~ come back tomorrow!" }),
        { status: 429, headers }
      );
    }

    // Content moderation via OpenAI
    if (env.OPENAI_API_KEY) {
      const modRes = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ input: `${name} ${message}` }),
      });

      const modData = await modRes.json();

      if (!modRes.ok) {
        return new Response(
          JSON.stringify({ error: "Could not verify message. Please try again." }),
          { status: 503, headers }
        );
      }

      if (modData.results?.[0]?.flagged) {
        return new Response(
          JSON.stringify({ error: "Your message could not be posted." }),
          { status: 400, headers }
        );
      }
    }

    // Insert entry
    await env.DB.prepare(
      "INSERT INTO guestbook (name, message, ip_hash) VALUES (?, ?, ?)"
    )
      .bind(name, message, ipHash)
      .run();

    // Return the new entry
    const newEntry = await env.DB.prepare(
      "SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC LIMIT 1"
    ).first();

    return new Response(JSON.stringify(newEntry), {
      status: 201,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to save entry" }), {
      status: 500,
      headers,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
