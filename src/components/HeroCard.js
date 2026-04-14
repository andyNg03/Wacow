// HeroCard — red greeting card at the top of the home screen

import { View, Text, StyleSheet } from 'react-native'
import { colors, shadows, borders, spacing, typography } from '../style/theme'
import { Ionicons } from '@expo/vector-icons'

export default function HeroCard() {
    return (
        <View style={styles.card}>
            {/* Title row with sparkle icon */}
            <View style={styles.titleRow}>
                <Text style={styles.title}>Hey Champion!</Text>
            </View>
            <Text style={styles.subtitle}>Let's get MOOOOving!</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.primary,
        ...borders.standard,
        ...shadows.hardLarge,
        padding: spacing.lg,
        margin: spacing.md,
        marginTop: 70, // space for status bar
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.heroTitle,
    },
    subtitle: {
        ...typography.heroSubtitle,
        opacity: 0.95,
    }
})