// BadgesSection — 2x2 grid of badge cards, each with an icon and name

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

// Badge definitions — icon name, label, gradient colors
const badges = [
    { icon: 'battery-full-outline',      name: 'Unlimited Stamina',     gradientColors: ['#f87171', colors.primary] },
    { icon: 'trending-up',       name: 'Only Up From Here', gradientColors: [colors.streakCard, '#F97316'] },
    { icon: 'lock-closed', name: 'Locked In',  gradientColors: ['#374151', '#1f2937'] },
    { icon: 'ribbon',       name: 'Week Warrior',   gradientColors: [colors.primary, '#b91c1c'] },
]

// Individual badge card
function BadgeCard({ icon, name, gradientColors }) {
    return (
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <Ionicons name={icon} size={36} color={colors.textLight} style={styles.icon} />
                <Text style={styles.name}>{name}</Text>
            </LinearGradient>
        </View>
    )
}

export default function BadgesSection() {
    return (
        <View style={styles.container}>
            {/* Section header with ribbon icon */}
            <View style={styles.headerRow}>
                <Ionicons name="ribbon" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Your Badges</Text>
            </View>

            {/* 2x2 badge grid — flexWrap handles the two columns */}
            <View style={styles.grid}>
                {badges.map((badge, i) => (
                    <BadgeCard key={i} {...badge} />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        ...typography.sectionTitle,
        fontSize: 20,
    },
    // flexWrap lets cards flow into 2 columns
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    // Each card takes up ~half the row width
    shadowWrapper: {
        width: '47%',
        backgroundColor: colors.border,
        borderRadius: borders.small.borderRadius,
        transform: [{ translateX: 3 }, { translateY: 3 }],
    },
    card: {
        borderRadius: borders.small.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.md,
        alignItems: 'center',
        transform: [{ translateX: -3 }, { translateY: -3 }],
    },
    icon: {
        marginBottom: spacing.sm,
    },
    name: {
        ...typography.small,
        color: colors.textLight,
        fontSize: 13,
        textAlign: 'center',
    },
})