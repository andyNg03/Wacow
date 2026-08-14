// ProfileHeader — red gradient card with avatar and name

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing } from '../style/theme'

export default function ProfileHeader() {
    return (
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={['#ef4444', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Top row — avatar + name */}
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
                    </View>
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
})