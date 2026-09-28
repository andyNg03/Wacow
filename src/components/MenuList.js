// MenuList — list of tappable menu rows with icons

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

const menuItems = [
    // Settings row hidden — no destination/functionality behind it yet.
    // Keep the entry here so it's a one-line restore once there's something to wire it to.
    // { label: 'Settings',       icon: 'settings-outline',           gradientColors: ['#4b5563', '#374151'] },
    // Notifications hidden — no notification system exists yet (deferred
    // to v1.1, see backlog). Uncomment once there's something behind it.
    // { label: 'Notifications',  icon: 'notifications-outline',      gradientColors: ['#F5A623', '#F97316'] },
    { label: 'Help & Support', icon: 'help-circle-outline',        gradientColors: ['#374151', '#1f2937'] },
    { label: 'Share App',      icon: 'share-social-outline',       gradientColors: [colors.achievementCard, '#111827'] },
    { label: 'Rate Us',        icon: 'star-outline',               gradientColors: ['#F5A623', '#F97316'] },
    { label: 'About',          icon: 'information-circle-outline', gradientColors: [colors.primary, '#b91c1c'] },
    // Delete Account hidden — needs the Phase 2 account-deletion Edge
    // Function deployed first (service-role key, can't run client-side).
    // Uncomment once that function exists and is wired up.
    // { label: 'Delete Account', icon: 'trash-outline',              gradientColors: [colors.achievementCard, '#111827'] },
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

const PRESS_HANDLERS = {
    'Share App': 'onShareApp',
    'Rate Us': 'onRateApp',
}

// Remaining rows are still placeholders — wired up one at a time.
export default function MenuList(props) {
    return (
        <View style={styles.container}>
            {menuItems.map((item, i) => (
                <MenuItem
                    key={i}
                    {...item}
                    onPress={props[PRESS_HANDLERS[item.label]]}
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