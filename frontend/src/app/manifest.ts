import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Danza con Altura",
    short_name: "DanzaAltura",
    description: "Sistema de gestión de ropa folklórica boliviana",
    start_url: "/",
    display: "standalone",
    background_color: "#991B1B",
    theme_color: "#991B1B",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}