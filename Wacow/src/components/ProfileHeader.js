// ProfileHeader — red gradient card with avatar, name, level, and XP progress bar

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

// Props: level (number), currentXP (number), goalXP (number)
export default function ProfileHeader({ level, currentXP, goalXP }) {
    // Calculate XP bar fill percentage
    const xpPercent = (currentXP / goalXP) * 100

    return (
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={['#ef4444', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Top row — avatar + name + level */}
                <View style={styles.topRow}>
                    {/* Avatar circle with person icon */}
                    <View style={styles.avatarWrapper}>
                        <Ionicons name="person" size={36} color={colors.streakCard} />
                    </View>

                    <View>
                        {/* Star icon next to name */}
                        <View style={styles.nameRow}>
                            <Ionicons name="star" size={18} color={colors.streakCard} />
                            <Text style={styles.name}>Gym Hero</Text>
                        </View>
                        <Text style={styles.level}>Level {level} Champion</Text>
                    </View>
                </View>

                {/* XP progress bar — width is dynamic */}
                <View style={styles.xpBarBackground}>
                    <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
                </View>

                {/* XP text */}
                <Text style={styles.xpText}>
                    {currentXP}/{goalXP} XP to Level {level + 1} - Almost there!
                </Text>
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
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    // Red circle for avatar
    avatarWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.textLight,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    name: {
        color: colors.textLight,
        fontSize: 22,
        fontWeight: '900',
    },
    level: {
        ...typography.body,
        color: colors.textLight,
        opacity: 0.9,
    },
    // Grey transparent track
    xpBarBackground: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 999,
        height: 12,
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    // Gold fill — dynamic width via inline style
    xpBarFill: {
        backgroundColor: colors.streakCard,
        height: '100%',
        borderRadius: 999,
    },
    xpText: {
        ...typography.small,
        color: colors.textLight,
    },
})