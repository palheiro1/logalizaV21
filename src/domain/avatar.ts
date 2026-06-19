export const DEFAULT_AVATAR_EMOJI = "👤";
export const DEFAULT_AVATAR_COLOR = "blue";

export const AVATAR_EMOJIS = [
  "👤",
  "🧭",
  "⛰️",
  "🌊",
  "🌿",
  "⭐",
  "🔥",
  "⚓",
  "🏰",
  "🛡️",
  "🗺️",
  "📍",
];

export const AVATAR_COLORS = [
  "blue",
  "green",
  "red",
  "yellow",
  "pink",
  "teal",
  "slate",
] as const;

export type AvatarColor = typeof AVATAR_COLORS[number];

const AVATAR_COLOR_CLASSES: Record<AvatarColor, string> = {
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-400 text-gray-900",
  pink: "bg-pink-600 text-white",
  teal: "bg-teal-600 text-white",
  slate: "bg-slate-700 text-white",
};

export function normalizeAvatarEmoji(avatarEmoji?: string | null) {
  return avatarEmoji || DEFAULT_AVATAR_EMOJI;
}

export function normalizeAvatarColor(avatarColor?: string | null): AvatarColor {
  return AVATAR_COLORS.includes(avatarColor as AvatarColor)
    ? (avatarColor as AvatarColor)
    : DEFAULT_AVATAR_COLOR;
}

export function getAvatarColorClass(avatarColor?: string | null) {
  return AVATAR_COLOR_CLASSES[normalizeAvatarColor(avatarColor)];
}
