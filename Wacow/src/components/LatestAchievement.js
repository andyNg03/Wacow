// LatestAchievement — orange gradient card showing the most recent badge earned

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

export default function LatestAchievement() {
    return (
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={['#F5A623', '#F97316']} // gold → orange
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* White circle with ribbon icon */}
                <View style={styles.iconWrapper}>
                    <Ionicons name="ribbon" size={32} color={colors.streakCard} />
                </View>

                {/* Achievement text info */}
                <View style={styles.textBlock}>
                    <Text style={styles.heading}>Latest Achievement</Text>
                    <Text style={styles.name}>Week Warrior</Text>
                    <Text style={styles.description}>5 workouts in one week!</Text>
                </View>
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
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        flexDirection: 'row', // icon on left, text on right
        alignItems: 'center',
        gap: spacing.md,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    // White circle that holds the ribbon icon
    iconWrapper: {
        backgroundColor: colors.background,
        borderRadius: 999,
        borderWidth: 3,
        borderColor: colors.border,
        width: 68,
        height: 68,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBlock: {
        flex: 1,
    },
    heading: {
        ...typography.body,
        color: colors.textLight,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textLight,
    },
    description: {
        ...typography.small,
        color: colors.textLight,
        opacity: 0.9,
    },
})