// StatCard — reusable stat card for the home screen grid
// Supports solid color background OR gradient (for Day Streak card)
// Props:
//   iconName — Ionicons icon name
//   iconColor — color of the icon and text
//   value — the number to display
//   desc — label below the number
//   backgroundColor — solid color (used when useGradient is false)
//   useGradient — if true, shows gold gradient instead of solid color

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadows, borders, spacing, typography } from '../style/theme'

export default function StatCard({ iconName, iconColor, value, desc, backgroundColor, useGradient }) {
  const content = (
    <>
      <Ionicons name={iconName} size={32} color={iconColor} style={styles.icon} />
      <Text style={[styles.value, { color: iconColor }]}>{value}</Text>
      <Text style={[styles.label, { color: iconColor }]}>{desc}</Text>
    </>
  )

  // Gradient card — used for Day Streak
  // Shadow lives on shadowWrapper, NOT on the card itself
  // overflow: hidden was removed from card — it was clipping the shadow
  // Instead a separate inner View clips the gradient to rounded corners
  if (useGradient) {
    return (
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#FDE047', '#F5A623']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          >
            {content}
          </LinearGradient>
        </View>
      </View>
    )
  }

  // Solid color card
  return (
    <View style={styles.shadowWrapper}>
      <View style={[styles.card, { backgroundColor }]}>
        {content}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Shadow lives here — separate from card so overflow:hidden doesn't clip it
  shadowWrapper: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: borders.standard.borderRadius,
    ...shadows.hard,
  },
  card: {
    flex: 1,
    // Fixed minimum height so all cards are the same size
    minHeight: 140,
    borderWidth: borders.standard.borderWidth,
    borderColor: borders.standard.borderColor,
    borderRadius: borders.standard.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    // overflow hidden here clips gradient inside rounded corners
    // shadow is on the wrapper above so it won't be clipped
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    width: '100%',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.cardValue,
    textAlign: 'center',
  },
  label: {
    ...typography.cardLabel,
    textAlign: 'center',
    opacity: 0.85,
  }
})