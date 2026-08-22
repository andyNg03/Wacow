// Profile Screen — shows user header, stats, personal info, and edit/logout buttons

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ProfileHeader from '../components/ProfileHeader'
import StatsGrid from '../components/StatsGrid'
import PersonalInfo from '../components/PersonalInfo'
import { supabase } from '../lib/supabase'
import { colors, borders, spacing, typography } from '../style/theme'

// Hardcoded for now — will come from Supabase once auth is connected
let workouts = 54;
let daysActive = 12;
let personalInfo = [
    { key: 'Member Since', value: 'January 2026' },
    { key: 'Favorite Workout', value: 'Bench Press' },
    { key: 'Weekly Goal', value: '5 workouts' },
]

export default function ProfileScreen() {
    // Signs the user out via Supabase auth
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) Alert.alert('Error', error.message)
    }

    return (
        <ScrollView style={styles.container}>
            {/* User avatar and name */}
            <ProfileHeader />

            {/* Stat boxes — workouts, days active */}
            <StatsGrid workouts={workouts} daysActive={daysActive} />

            {/* Personal info rows */}
            <PersonalInfo data={personalInfo} />

            {/* Logout button — white with red border */}
            <View style={styles.logoutShadow}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
        padding: spacing.md,
    },
    // Hard shadow wrapper for logout button
    logoutShadow: {
        backgroundColor: colors.destructive,
        borderRadius: borders.standard.borderRadius,
        marginVertical: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    logoutButton: {
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.destructive,
        paddingVertical: spacing.md,
        alignItems: 'center',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    logoutText: {
        ...typography.body,
        color: colors.destructive,
        fontSize: 18,
    },
})