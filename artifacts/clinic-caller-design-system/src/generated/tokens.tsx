/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f7fafb",
      "foreground": "#133039",
      "border": "#dce7ea",
      "card": "#ffffff",
      "cardForeground": "#133039",
      "popover": "#ffffff",
      "popoverForeground": "#133039",
      "primary": "#11536a",
      "primaryForeground": "#ffffff",
      "secondary": "#e5ecee",
      "secondaryForeground": "#11536a",
      "muted": "#edf3f4",
      "mutedForeground": "#52666c",
      "accent": "#e5ecee",
      "accentForeground": "#11536a",
      "destructive": "#c6242d",
      "destructiveForeground": "#ffffff",
      "input": "#d0dee1",
      "ring": "#11536a",
      "chart1": "#11536a",
      "chart2": "#47a59a",
      "chart3": "#99aeb6",
      "chart4": "#5d95b8",
      "chart5": "#56758c",
      "sidebar": "#0b3443",
      "sidebarForeground": "#f7fafb",
      "sidebarBorder": "#092b37",
      "sidebarPrimary": "#145a76",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#145a76",
      "sidebarAccentForeground": "#ffffff",
      "sidebarRing": "#2c8caf"
    },
    "dark": {
      "background": "#102a33",
      "foreground": "#f5fafb",
      "border": "#23414a",
      "card": "#173740",
      "cardForeground": "#f5fafb",
      "popover": "#173740",
      "popoverForeground": "#f5fafb",
      "primary": "#43a5c2",
      "primaryForeground": "#08252e",
      "secondary": "#28505a",
      "secondaryForeground": "#f5fafb",
      "muted": "#21434c",
      "mutedForeground": "#a8bdc3",
      "accent": "#28505a",
      "accentForeground": "#f5fafb",
      "destructive": "#a6292e",
      "destructiveForeground": "#ffffff",
      "input": "#2a4a53",
      "ring": "#43a5c2",
      "chart1": "#43a5c2",
      "chart2": "#5bc5b4",
      "chart3": "#9cb9c1",
      "chart4": "#76acd0",
      "chart5": "#88a6b7",
      "sidebar": "#0a1c22",
      "sidebarForeground": "#f5fafb",
      "sidebarBorder": "#18333b",
      "sidebarPrimary": "#257e9b",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#18333b",
      "sidebarAccentForeground": "#f5f5f5",
      "sidebarRing": "#43a5c2"
    }
  },
  "fontFamily": {
    "sans": [
      "Plus Jakarta Sans",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "Spline Sans Mono",
      "monospace"
    ]
  },
  "radius": "0.75rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
