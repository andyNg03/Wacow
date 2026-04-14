// Profile Screen — shows user header, stats, badges, personal info, and edit/logout buttons

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ProfileHeader from '../components/ProfileHeader'
import StatsGrid from '../components/StatsGrid'
import BadgesSection from '../components/BadgesSection'
import PersonalInfo from '../components/PersonalInfo'
import { supabase } from '../lib/supabase'
import { colors, borders, spacing, typography } from '../style/theme'

// Hardcoded for now — will come from Supabase once auth is connected
let level = 6;
let currentXP = 750;
let goalXP = 1000;
let workouts = 54;
let daysActive = 12;
let totalXP = 2650;
let personalInfo = [
    { key: 'Member Since', value: 'January 2026' },
    { key: 'Favorite Workout', value: 'Bench Press' },
    { key: 'Weekly Goal', value: '5 workouts' },
]

export default function ProfileScreen() {
    // Signs the user out via Supabase auth
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <ScrollView style={styles.container}>
            {/* User level, XP bar, avatar */}
            <ProfileHeader level={level} currentXP={currentXP} goalXP={goalXP} />

            {/* 3 stat boxes — workouts, days active, total XP */}
            <StatsGrid workouts={workouts} daysActive={daysActive} totalXP={totalXP} />

            {/* Badge grid */}
            <BadgesSection />

            {/* Personal info rows */}
            <PersonalInfo data={personalInfo} />

            {/* Edit profile button — red with gear icon */}
            <View style={styles.editShadow}>
                <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="settings-outline" size={20} color={colors.textLight} />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

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
    // Hard shadow wrapper for edit button
    editShadow: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginVertical: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    editButton: {
        backgroundColor: colors.primary,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    editButtonText: {
        ...typography.body,
        color: colors.textLight,
        fontSize: 18,
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