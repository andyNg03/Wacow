// MenuList — list of tappable menu rows with icons
// onNotificationPress — function passed from MoreScreen to handle notification tap

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

const menuItems = [
    { label: 'Settings',       icon: 'settings-outline',           gradientColors: ['#4b5563', '#374151'] },
    { label: 'Notifications',  icon: 'notifications-outline',      gradientColors: ['#F5A623', '#F97316'] },
    { label: 'Help & Support', icon: 'help-circle-outline',        gradientColors: ['#374151', '#1f2937'] },
    { label: 'Share App',      icon: 'share-social-outline',       gradientColors: [colors.achievementCard, '#111827'] },
    { label: 'Rate Us',        icon: 'star-outline',               gradientColors: ['#F5A623', '#F97316'] },
    { label: 'About',          icon: 'information-circle-outline', gradientColors: [colors.primary, '#b91c1c'] },
]

// TouchableOpacity is the outermost wrapper so nothing blocks the tap
function MenuItem({ label, icon, gradientColors, onPress }) {
    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            <View style={styles.shadowWrapper}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.item}
                >
                    <Text style={styles.label}>{label}</Text>
                    <Ionicons name={icon} size={22} color={colors.textLight} />
                </LinearGradient>
            </View>
        </TouchableOpacity>
    )
}

// onNotificationPress comes from MoreScreen
// it gets passed to the Notifications row only
export default function MenuList({ onNotificationPress }) {
    return (
        <View style={styles.container}>
            {menuItems.map((item, i) => (
                <MenuItem
                    key={i}
                    {...item}
                    // Only wire onPress for the Notifications row
                    // all other rows are placeholders for now
                    onPress={item.label === 'Notifications' ? onNotificationPress : null}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.sm,
        marginVertical: spacing.sm,
    },
    // Shadow is now inside TouchableOpacity so taps aren't blocked
    shadowWrapper: {
        backgroundColor: colors.border,
        borderRadius: borders.small.borderRadius,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    item: {
        borderRadius: borders.small.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    label: {
        ...typography.body,
        color: colors.textLight,
        fontSize: 17,
    },
})