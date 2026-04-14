// MonthlyGoal — dark card showing the monthly workout goal and a progress bar

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

// Props: goal (number), progress (number — how many workouts done so far)
export default function MonthlyGoal({ goal, progress }) {
    // Calculate percentage for the progress bar width
    const progressPercent = (progress / goal) * 100

    return (
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={[colors.achievementCard, '#111827']} // black → dark grey
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Card header with trophy icon */}
                <View style={styles.headingRow}>
                    <Ionicons name="trophy-outline" size={22} color={colors.streakCard} />
                    <Text style={styles.heading}>Monthly Goal</Text>
                </View>

                {/* Goal description */}
                <Text style={styles.description}>Complete {goal} workouts this month!</Text>

                {/* Progress bar — width is dynamic based on progress/goal */}
                <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>

                {/* Progress text */}
                <Text style={styles.progressText}>{progress}/{goal} workouts - Keep crushing!</Text>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    shadowWrapper: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginVertical: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
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
        marginBottom: spacing.sm,
    },
    heading: {
        color: colors.textLight,
        fontSize: 20,
        fontWeight: '900',
    },
    description: {
        ...typography.body,
        color: colors.textLight,
        marginBottom: spacing.md,
    },
    // Grey transparent track behind the fill
    progressBackground: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 999,
        height: 16,
        borderWidth: 2,
        borderColor: colors.textLight,
        overflow: 'hidden', // clips the fill inside the rounded track
        marginBottom: spacing.sm,
    },
    // Gold fill — width set dynamically via inline style
    progressFill: {
        backgroundColor: colors.streakCard,
        height: '100%',
        borderRadius: 999,
    },
    progressText: {
        ...typography.small,
        color: colors.textLight,
    },
})