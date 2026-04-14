// DailyChallenge — red card showing today's challenge with a progress bar
// Props:
//   challenge — string describing the challenge
//   current — how many completed
//   total — total needed to complete

import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadows, borders, spacing, typography } from '../style/theme'

export default function DailyChallenge({ challenge, current, total }) {
    return (
        <View style={styles.card}>
            {/* Title row with icon circle */}
            <View style={styles.titleRow}>
                <View style={styles.iconCircle}>
                    <Ionicons name="star" size={30} color={colors.textLight} />
                </View>
                <Text style={styles.title}>Daily Challenge</Text>
            </View>

            {/* Challenge description */}
            <Text style={styles.description}>{challenge}</Text>

            {/* Progress bar — width is calculated from current/total */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
            </View>

            {/* Progress text */}
            <Text style={styles.progressText}>{current}/{total} complete</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.primary,
        ...borders.standard,
        ...shadows.hard,
        padding: spacing.lg,
        margin: spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    // Gold circle behind the star icon
    iconCircle: {
        backgroundColor: colors.streakCard,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.body,
        color: colors.textLight,
        fontSize: 20,
        fontWeight: '900',
    },
    description: {
        ...typography.body,
        color: colors.textLight,
        marginBottom: spacing.md,
    },
    // Grey transparent track
    progressBar: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        height: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: spacing.sm,
    },
    // Gold fill — width set dynamically via inline style
    progressFill: {
        backgroundColor: colors.streakCard,
        height: '100%',
        borderRadius: 10,
    },
    progressText: {
        ...typography.small,
        color: colors.textLight,
    }
})