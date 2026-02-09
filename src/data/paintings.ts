export interface Artwork {
  id: string;
  title: string;
  year: number;
  medium: string;
  dimensions?: string;
  thumbnail: string;
  fullImage: string;
  description?: string;
  date?: string; // ISO date string (YYYY-MM-DD) from file metadata
}

// Sample paintings - replace thumbnails/images with actual artwork
export const paintings: Artwork[] = [
  {
    id: "p1",
    title: "Sunset Garden",
    year: 2025,
    medium: "Oil on canvas",
    dimensions: '24" x 36"',
    thumbnail: "/gallery/paintings/thumbs/sunset-garden.jpg",
    fullImage: "/gallery/paintings/full/sunset-garden.jpg",
    description: "A warm sunset over a blooming flower garden~",
  },
  {
    id: "p2",
    title: "Dreaming in Pink",
    year: 2025,
    medium: "Oil on canvas",
    dimensions: '18" x 24"',
    thumbnail: "/gallery/paintings/thumbs/dreaming-pink.jpg",
    fullImage: "/gallery/paintings/full/dreaming-pink.jpg",
    description: "Abstract dreamscape in shades of pink and magenta",
  },
  {
    id: "p3",
    title: "Cherry Blossom Rain",
    year: 2024,
    medium: "Acrylic on canvas",
    dimensions: '30" x 40"',
    thumbnail: "/gallery/paintings/thumbs/cherry-blossom-rain.jpg",
    fullImage: "/gallery/paintings/full/cherry-blossom-rain.jpg",
    description: "Petals falling like rain in spring~",
  },
  {
    id: "p4",
    title: "Moonlit Cat",
    year: 2024,
    medium: "Oil on canvas",
    dimensions: '16" x 20"',
    thumbnail: "/gallery/paintings/thumbs/moonlit-cat.jpg",
    fullImage: "/gallery/paintings/full/moonlit-cat.jpg",
    description: "A black cat sitting under the full moon",
  },
  {
    id: "p5",
    title: "Strawberry Fields",
    year: 2024,
    medium: "Oil on canvas",
    dimensions: '20" x 30"',
    thumbnail: "/gallery/paintings/thumbs/strawberry-fields.jpg",
    fullImage: "/gallery/paintings/full/strawberry-fields.jpg",
    description: "Rolling hills of strawberry patches at golden hour",
  },
  {
    id: "p6",
    title: "Underwater Rose",
    year: 2023,
    medium: "Acrylic on canvas",
    dimensions: '24" x 24"',
    thumbnail: "/gallery/paintings/thumbs/underwater-rose.jpg",
    fullImage: "/gallery/paintings/full/underwater-rose.jpg",
    description: "A rose blooming underwater surrounded by bubbles",
  },
];
