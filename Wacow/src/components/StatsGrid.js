// StatsGrid — row of 3 stat boxes showing workouts, days active, and total XP
// Each box has a different background color matching the theme
// red → gold → black

import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

// Each box config — icon, background color, icon color
// Matches the reference: red, gold, black
const BOX_CONFIGS = [
    { icon: 'trending-up', bgColor: colors.primary,         iconColor: colors.textLight  },
    { icon: 'heart',       bgColor: colors.streakCard,      iconColor: colors.textLight  },
    { icon: 'flash',       bgColor: colors.achievementCard, iconColor: colors.streakCard },
]

// Individual stat box
function StatBox({ icon, bgColor, iconColor, value, label }) {
    return (
        <View style={styles.shadowWrapper}>
            <View style={[styles.box, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={24} color={iconColor} style={styles.icon} />
                <Text style={[styles.value, { color: iconColor }]}>{value}</Text>
                <Text style={[styles.label, { color: iconColor }]}>{label}</Text>
            </View>
        </View>
    )
}

// Props: workouts, daysActive, totalXP (all numbers)
export default function StatsGrid({ workouts, daysActive, totalXP }) {
    const values = [workouts, daysActive, totalXP]
    const labels = ['Workouts', 'Days Active', 'Total XP']

    return (
        <View style={styles.grid}>
            {BOX_CONFIGS.map((config, i) => (
                <StatBox
                    key={i}
                    {...config}
                    value={values[i]}
                    label={labels[i]}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginVertical: spacing.sm,
    },
    shadowWrapper: {
        flex: 1,
        backgroundColor: colors.border,
        borderRadius: borders.small.borderRadius,
        transform: [{ translateX: 3 }, { translateY: 3 }],
    },
    box: {
        flex: 1,
        borderRadius: borders.small.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.sm,
        alignItems: 'center',
        transform: [{ translateX: -3 }, { translateY: -3 }],
    },
    icon: {
        marginBottom: spacing.xs,
    },
    value: {
        fontSize: 20,
        fontWeight: '900',
    },
    label: {
        ...typography.small,
        opacity: 0.9,
    },
})