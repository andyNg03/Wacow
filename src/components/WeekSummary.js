// WeekSummary — red gradient card showing workouts, active time, and calories for the week

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

// Small reusable component for each stat (value + label stacked)
function StatItem({ value, label }) {
    return (
        <View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    )
}

// Props: workouts (number), activeTime (number in hours), calories (number)
export default function WeekSummary({ workouts, activeTime, calories }) {
    return (
        // Offset black view behind the card creates the hard shadow effect
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={['#ef4444', colors.primary]} // light red → dark red
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Card header with calendar icon and flame */}
                <View style={styles.headingRow}>
                    <Ionicons name="calendar-outline" size={22} color={colors.textLight} />
                    <Text style={styles.heading}>This Week</Text>
                </View>

                {/* Three stats side by side */}
                <View style={styles.statsRow}>
                    <StatItem value={workouts} label="Workouts" />
                    <StatItem value={`${activeTime}h`} label="Active Time" />
                    <StatItem value={calories} label="Calories" />
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    // Black offset behind the card = hard shadow
    shadowWrapper: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginVertical: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    // Card shifts up-left to sit on top of the shadow
    card: {
        borderRadius: borders.standard.borderRadius,
        padding: spacing.lg,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    heading: {
        color: colors.textLight,
        fontSize: 20,
        fontWeight: '900',
        flex: 1, // pushes flame icon to the right
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statValue: {
        ...typography.cardValue, // 28px bold from theme
        color: colors.textLight,
    },
    statLabel: {
        ...typography.small, // 12px bold from theme
        color: colors.textLight,
        opacity: 0.9,
    },
})