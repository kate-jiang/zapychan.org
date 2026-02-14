import { serve } from "bun";
import index from "./index.html";
import path from "node:path";

let hitCount = Math.floor(Math.random() * 9000) + 1000; // Start with a fun fake count

// In-memory guestbook for local dev
let guestbookEntries: { id: number; name: string; message: string; created_at: string }[] = [];
let guestbookNextId = 1;

const publicDir = path.resolve(import.meta.dir, "../public");

const server = serve({
  routes: {
    "/": index,

    "/api/hits": {
      GET() {
        hitCount++;
        return Response.json({ count: hitCount });
      },
    },

    "/api/guestbook": {
      GET() {
        return Response.json(guestbookEntries);
      },
      async POST(req: Request) {
        try {
          const body = await req.json() as { name?: string; message?: string };
          let { name, message } = body;

          if (!name || !message) {
            return Response.json({ error: "Name and message are required" }, { status: 400 });
          }

          name = String(name).replace(/<[^>]*>/g, "").trim().slice(0, 30);
          message = String(message).replace(/<[^>]*>/g, "").trim().slice(0, 500);

          if (!name || !message) {
            return Response.json({ error: "Name and message cannot be empty" }, { status: 400 });
          }

          const entry = {
            id: guestbookNextId++,
            name,
            message,
            created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
          };
          guestbookEntries.unshift(entry);

          return Response.json(entry, { status: 201 });
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
      },
    },

    "/api/weather": {
      async GET() {
        try {
          const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,weather_code&temperature_unit=fahrenheit",
          );
          const data = await res.json();
          return Response.json(data);
        } catch {
          return Response.json(
            { error: "weather unavailable" },
            { status: 500 },
          );
        }
      },
    },

    "/audio/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },

    "/images/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },

    "/gallery/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },
  },

  // Fallback: serve index.html for client-side routing
  fetch() {
    return new Response(Bun.file(path.join(import.meta.dir, "index.html")));
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`💖 zapychan.org running at ${server.url}`);
