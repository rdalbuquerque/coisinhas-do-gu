import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coisinhas do Gu",
    short_name: "Gu",
    description: "Gerenciamento do enxoval do Gustavo",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fa",
    theme_color: "#7BA4D4",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
