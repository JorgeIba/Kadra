import { defineConfig } from "@vite-pwa/assets-generator/config"

const modernIphoneSplashProfiles = [
  // iPhone 17 Pro Max and iPhone 16 Pro Max
  { width: 1320, height: 2868, scaleFactor: 3 },
  // iPhone 17, iPhone 17 Pro, and iPhone 16 Pro
  { width: 1206, height: 2622, scaleFactor: 3 },
  // iPhone Air
  { width: 1260, height: 2736, scaleFactor: 3 },
  // iPhone 14/15 Pro Max, iPhone 15 Plus, and iPhone 16 Plus
  { width: 1290, height: 2796, scaleFactor: 3 },
  // iPhone 15, iPhone 15 Pro, and iPhone 16
  { width: 1179, height: 2556, scaleFactor: 3 },
  // iPhone 14 Plus
  { width: 1284, height: 2778, scaleFactor: 3 },
  // iPhone 14
  { width: 1170, height: 2532, scaleFactor: 3 },
]

export default defineConfig({
  manifestIconsEntry: false,
  preset: {
    transparent: { sizes: [] },
    maskable: { sizes: [] },
    apple: { sizes: [] },
    appleSplashScreens: {
      sizes: modernIphoneSplashProfiles,
      padding: 0,
      resizeOptions: {
        background: "#060D0C",
        fit: "contain",
      },
      linkMediaOptions: {
        addMediaScreen: true,
        basePath: "/",
        log: true,
      },
      name: (landscape, size) =>
        `apple-splash-${landscape ? "landscape" : "portrait"}-${size.width}x${size.height}.png`,
    },
  },
  images: ["public/kadra-launch.png"],
})
