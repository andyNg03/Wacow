// Theme file — single source of truth for all colors, shadows, borders, typography, and spacing
// Import from this file in every component instead of hardcoding values
// Example: import { colors, spacing } from '../style/theme'

export const colors = {
  primary: '#D00000',           // main red — used for cards, buttons, accents
  primaryLight: '#fff5f5',      // light red tint
  background: '#ffffff',        // white
  backgroundTint: '#f9ecec',    // off-white background for screens
  textDark: '#000000',          // black text
  textLight: '#ffffff',         // white text (on dark/red backgrounds)
  textMuted: '#717182',         // grey text for subtitles and labels
  streakCard: '#F5A623',        // gold/orange — used for streak and achievement accents
  workoutCard: '#D00000',       // red — workout stat card
  xpCard: '#ffffff',            // white — XP stat card
  achievementCard: '#000000',   // black — achievement stat card
  badgeCircle: '#f4a0a0',       // light pink — badge circle background
  border: '#000000',            // black border used everywhere
  inputBackground: '#f3f3f5',   // light grey — input field backgrounds
  destructive: '#d4183d',       // red — destructive actions like logout
}

export const shadows = {
  // Hard flat shadow — gives the cartoon/comic book effect
  hard: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  // Larger hard shadow for hero cards
  hardLarge: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  // Soft shadow for badge circles
  soft: {
    shadowColor: '#888888',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
}

export const borders = {
  // Standard card border — used on most cards
  standard: {
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 24,
  },
  // Smaller border — used on smaller cards and buttons
  small: {
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 16,
  },
  // Circle border — used on avatar and icon circles
  circle: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  // Badge border — slightly pink tint
  badge: {
    borderWidth: 3,
    borderColor: '#c47a7a',
  },
}

export const typography = {
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  sectionTitle: {
    paddingTop: 20,
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  body: {
    fontSize: 16,
    fontWeight: '700',
  },
  small: {
    fontSize: 12,
    fontWeight: '700',
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 15,
  lg: 24,
  xl: 32,
}