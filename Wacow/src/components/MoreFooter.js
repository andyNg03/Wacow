// MoreFooter — white card at the bottom with copyright info

import { View, Text, StyleSheet } from 'react-native'
import { colors, borders, spacing, typography } from '../style/theme'

export default function MoreFooter() {
    return (
        <View style={styles.shadowWrapper}>
            <View style={styles.footer}>
                {/* Heart emoji is fine here — small decorative detail in static text */}
                <Text style={styles.footerText}>Made with ❤️ for fitness enthusiasts</Text>
                <Text style={styles.footerSubText}>© 2026 WaCow. All rights reserved.</Text>
            </View>
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
    footer: {
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        alignItems: 'center',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    footerText: {
        ...typography.small,
        color: colors.textMuted,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    footerSubText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        textAlign: 'center',
    },
})