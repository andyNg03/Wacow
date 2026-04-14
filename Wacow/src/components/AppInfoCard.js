// AppInfoCard — red gradient card showing WaCow app name and version

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

export default function AppInfoCard() {
    return (
        <View style={styles.shadowWrapper}>
            <LinearGradient
                colors={['#ef4444', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* White square icon box */}
                <View style={styles.iconWrapper}>
                    <Ionicons name="barbell" size={30} color={colors.primary} />
                </View>

                {/* App name and version */}
                <View>
                    <Text style={styles.appName}>WaCow 🐄</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    // White rounded square behind the icon
    iconWrapper: {
        width: 64,
        height: 64,
        backgroundColor: colors.background,
        borderRadius: borders.small.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        ...typography.body,
        color: colors.textLight,
        fontSize: 20,
        fontWeight: '900',
    },
    appVersion: {
        ...typography.small,
        color: colors.textLight,
        opacity: 0.9,
    },
})