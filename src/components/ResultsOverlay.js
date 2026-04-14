// ResultsOverlay — full screen overlay shown after session ends
// Shows total sets, reps, exercise breakdown, time, and current streak

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

const { width, height } = Dimensions.get('screen')

export default function ResultsOverlay({ sessionResults, completedIds, onDismiss, allCompleted, elapsedTime }) {

    // Total reps = sum of (reps * sets) across all exercises
    const totalReps = sessionResults.reduce(
        (sum, r) => sum + (Number(r.reps) * Number(r.sets)), 0
    )

    // Total sets = sum of sets across all exercises
    const totalSets = sessionResults.reduce(
        (sum, r) => sum + Number(r.sets), 0
    )

    // Format elapsed seconds into MM:SS
    const mins = Math.floor((elapsedTime || 0) / 60).toString().padStart(2, '0')
    const secs = ((elapsedTime || 0) % 60).toString().padStart(2, '0')
    const sessionTime = `${mins}:${secs}`

    // TODO (Backend): Replace with real streak from Supabase
    const currentStreak = 8

    return (
        <View style={styles.overlay}>
            <LinearGradient
                colors={['#ef4444', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradient}
            >
                {/* Decorative dots */}
                <View style={[styles.dot, styles.dotTopLeft]} />
                <View style={[styles.dot, styles.dotTopRight]} />
                <View style={[styles.dot, styles.dotBottomLeft]} />
                <View style={[styles.dot, styles.dotBottomRight]} />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Trophy circle */}
                    <View style={styles.trophyCircle}>
                        <Ionicons name="trophy" size={60} color={colors.textLight} />
                    </View>

                    {/* Main title */}
                    <Text style={styles.title}>AMAZING{'\n'}WORK!</Text>
                    <Text style={styles.subtitle}>You're a FITNESS BEAST!</Text>

                    {/* Total sets + reps */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Sets</Text>
                            <Text style={styles.statValue}>{totalSets}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Reps</Text>
                            <Text style={styles.statValue}>{totalReps}</Text>
                        </View>
                    </View>

                    {/* Per-exercise breakdown */}
                    <View style={styles.breakdownCard}>
                        <Text style={styles.breakdownTitle}>Exercise Breakdown</Text>
                        {sessionResults.map((result, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.breakdownRow,
                                    i === sessionResults.length - 1 && { borderBottomWidth: 0 }
                                ]}
                            >
                                <Text style={styles.breakdownName}>{result.name}</Text>
                                <Text style={styles.breakdownDetail}>
                                    {result.weight} · {result.reps} reps · {result.sets} sets
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Session time */}
                    <View style={styles.timeCard}>
                        <Ionicons name="timer-outline" size={22} color={colors.streakCard} />
                        <View>
                            <Text style={styles.timeLabel}>Session Time</Text>
                            <Text style={styles.timeValue}>{sessionTime}</Text>
                        </View>
                    </View>

                    {/* Current streak */}
                    <View style={styles.streakCard}>
                        <Ionicons name="flame" size={22} color={colors.textDark} />
                        <View>
                            <Text style={styles.streakLabel}>Current Streak</Text>
                            <Text style={styles.streakValue}>{currentStreak} Days</Text>
                        </View>
                    </View>

                    {/* Dismiss button */}
                    <View style={styles.dismissShadow}>
                        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                            <Text style={styles.dismissText}>
                                {allCompleted ? 'AWESOME! 🎉' : 'Continue Session'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 999,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: 80,
        paddingBottom: 60,
    },
    dot: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    dotTopLeft: { width: 40, height: 40, top: 60, left: 20, backgroundColor: colors.streakCard },
    dotTopRight: { width: 28, height: 28, top: 90, right: 50, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotBottomLeft: { width: 50, height: 50, bottom: 80, left: 30, backgroundColor: colors.streakCard },
    dotBottomRight: { width: 35, height: 35, bottom: 60, right: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
    trophyCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: colors.streakCard,
        borderWidth: 4,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 52,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.streakCard,
        marginBottom: spacing.lg,
    },
    statsCard: {
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        flexDirection: 'row',
        width: '100%',
        marginBottom: spacing.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 2,
        backgroundColor: colors.inputBackground,
        marginVertical: spacing.xs,
    },
    statLabel: {
        ...typography.small,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.primary,
    },
    breakdownCard: {
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        width: '100%',
        marginBottom: spacing.sm,
    },
    breakdownTitle: {
        ...typography.body,
        fontSize: 16,
        color: colors.textDark,
        marginBottom: spacing.sm,
    },
    breakdownRow: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: colors.inputBackground,
    },
    breakdownName: {
        ...typography.small,
        fontSize: 14,
        color: colors.textDark,
        fontWeight: '900',
    },
    breakdownDetail: {
        ...typography.small,
        color: colors.textMuted,
        marginTop: 2,
    },
    timeCard: {
        backgroundColor: colors.achievementCard,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        width: '100%',
        marginBottom: spacing.sm,
    },
    timeLabel: {
        ...typography.small,
        color: colors.textMuted,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textLight,
    },
    streakCard: {
        backgroundColor: colors.streakCard,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        width: '100%',
        marginBottom: spacing.lg,
    },
    streakLabel: {
        ...typography.small,
        color: colors.textDark,
        opacity: 0.8,
    },
    streakValue: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textDark,
    },
    dismissShadow: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        width: '100%',
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    dismissButton: {
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        alignItems: 'center',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    dismissText: {
        fontSize: 20,
        fontWeight: '900',
        color: colors.textDark,
    },
})