// PersonalInfo — white card with rows of key/value personal info

import { View, Text, StyleSheet } from 'react-native'
import { colors, borders, spacing, typography } from '../style/theme'

// Individual info row — label on left, value on right
// isLast removes the bottom border on the last row
function InfoRow({ label, value, isLast }) {
    return (
        <View style={[
            styles.row,
            isLast && { borderBottomWidth: 0 }
        ]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    )
}

// Props: data — array of { key: string, value: string }
export default function PersonalInfo({ data }) {
    return (
        <View style={styles.shadowWrapper}>
            <View style={styles.card}>
                <Text style={styles.title}>Personal Info</Text>
                {data.map((item, index) => (
                    <InfoRow
                        key={index}
                        label={item.key}
                        value={item.value}
                        // Last row check so we don't render a bottom border
                        isLast={index === data.length - 1}
                    />
                ))}
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
    card: {
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    title: {
        ...typography.body,
        fontSize: 18,
        color: colors.textDark,
        marginBottom: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: colors.inputBackground,
    },
    label: {
        ...typography.small,
        color: colors.textMuted,
        fontSize: 14,
    },
    value: {
        ...typography.small,
        color: colors.textDark,
        fontSize: 14,
        fontWeight: '900',
    },
})