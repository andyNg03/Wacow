// BadgeCard — circular badge with an icon and label
// Used in the home screen Top Badges row
// Props:
//   icon — Ionicons icon name
//   name — badge label shown below the circle
//   bgColor — background color of the circle (defaults to primary red)

import { View, Text, StyleSheet } from 'react-native'
import { colors, shadows, borders, spacing } from '../style/theme'
import { Ionicons } from '@expo/vector-icons'

export default function BadgeCard({ icon, name, bgColor = colors.primary }) {
  return (
    <View style={styles.container}>
        {/* Shadow wrapper — hard shadow like the stat cards */}
        <View style={styles.shadowWrapper}>
            {/* Colored circle with icon */}
            <View style={[styles.circle, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={44} color="white" />
            </View>
        </View>
        {/* Badge name below the circle */}
        <Text style={styles.name}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        alignItems: 'center',
        marginHorizontal: spacing.sm,
    },
    // Hard shadow wrapper — same pattern as stat cards
    shadowWrapper: {
        ...shadows.hard,
        borderRadius: 45,
    },
    circle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        // Using borders.circle instead of borders.badge — black border not pink
        ...borders.circle,
    },
    name: {
        marginTop: spacing.sm,
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'center',
        color: colors.textDark,
    }
})