// SessionTimer — red card showing elapsed session time
// Counts up every second from when the session starts
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

export default function SessionTimer() {
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // Format seconds into MM:SS
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    const displayTime = `${mins}:${secs}`

    return (
        <View style={styles.shadowWrapper}>
            <View style={styles.card}>
                {/* Timer icon + label on the left */}
                <View style={styles.leftRow}>
                    <Ionicons name="timer-outline" size={22} color={colors.textLight} />
                    <Text style={styles.label}>Session Timer</Text>
                </View>
                {/* Time display on the right */}
                <Text style={styles.time}>{displayTime}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    shadowWrapper: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    card: {
        backgroundColor: colors.primary,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        ...typography.body,
        color: colors.textLight,
        fontSize: 18,
    },
    // tabular-nums keeps digit width consistent so timer doesn't jump around
    time: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textLight,
        fontVariant: ['tabular-nums'],
    },
})