import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ዲጂታል ሜኑ",
    short_name: "ዲጂታል ሜኑ",
    description:
      "A digital restaurant menu app. Scan the QR code to access the menu.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    protocol_handlers: [{ protocol: "web+menu", url: "/s%" }],
    display_override: ["standalone", "window-controls-overlay"],
    
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
