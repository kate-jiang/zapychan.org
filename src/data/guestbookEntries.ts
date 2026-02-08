export interface GuestbookEntry {
  name: string;
  date: string;
  message: string;
  evilOnly?: boolean;
}

export const guestbookEntries: GuestbookEntry[] = [
  {
    name: "~*sakura_dreams*~",
    date: "2025-12-15",
    message:
      "omg your art is SO cute!! i love the color palettes you use~ keep up the amazing work!! ♥♥♥",
  },
  {
    name: "artlover2000",
    date: "2025-12-10",
    message:
      "Just discovered your portfolio through a friend. Your oil paintings are breathtaking! The way you capture light is incredible.",
  },
  {
    name: "☆pixelprince☆",
    date: "2025-11-28",
    message:
      "AHHH this site is so cute i'm crying!! the win95 aesthetic is *chefs kiss* 💖",
  },
  {
    name: "moonlight_cafe",
    date: "2025-11-20",
    message:
      "i commissioned zapychan last month and the result was amazing!! so professional and kind~ definitely recommend~ (ﾉ◕ヮ◕)ﾉ*:・゚✧",
  },
  {
    name: "retro_web_fan",
    date: "2025-11-05",
    message:
      "This website gives me the BEST kind of nostalgia. Geocities is alive and well! Great art too~",
  },
  {
    name: "cottagecore_emily",
    date: "2025-10-22",
    message:
      "your flower paintings make me want to sit in a meadow forever 🌸🌺 thank you for sharing your beautiful art with the world!!",
  },
  {
    name: "digital_wanderer",
    date: "2025-10-01",
    message:
      "The way you blend traditional and digital styles is really unique. Following your work from now on!",
  },
  // Evil mode entries (creepy/unsettling)
  {
    name: "v̷i̸s̴i̸t̷o̵r̸",
    date: "????-??-??",
    message: "i've been watching you paint. you never close the curtains.",
    evilOnly: true,
  },
  {
    name: "nobody",
    date: "2025-13-32",
    message: "do you ever feel like your paintings are looking back at you?",
    evilOnly: true,
  },
  {
    name: "the_wallpaper",
    date: "1995-01-01",
    message:
      "i was here before the website. i was here before the computer. i was here before you. i will be here after.",
    evilOnly: true,
  },
  {
    name: "happy_visitor!! :)",
    date: "2025-12-25",
    message:
      "everything is fine. nothing is wrong. you are safe. do not look behind you. everything is fine.",
    evilOnly: true,
  },
];
