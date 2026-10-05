// Profile Screen — user header, stats, personal info, edit/logout buttons,
// plus the app info and menu that used to live on the More tab

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share, Linking } from 'react-native'
import ProfileHeader from '../components/ProfileHeader'
import StatsGrid from '../components/StatsGrid'
import PersonalInfo from '../components/PersonalInfo'
import AppInfoCard from '../components/AppInfoCard'
import MenuList from '../components/MenuList'
import MoreFooter from '../components/MoreFooter'
import { supabase } from '../lib/supabase'
import { colors, borders, spacing, typography } from '../style/theme'

// Set this once WaCow ships — App Store Connect > App Information > Apple ID
// (the numeric ID in the app's App Store URL). Rate Us is fully wired below;
// this is the only thing missing until launch.
const APP_STORE_ID = null

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

    // Opens the native iOS share sheet. No store link yet — add one once
    // WaCow is live on the App Store.
    const handleShareApp = () => {
        Share.share({ message: "Check out WaCow — the workout tracker I've been using!" })
    }

    // Deep-links straight to the "write a review" flow in the App Store app.
    // Pre-launch there's no App Store listing yet, so this is honest about
    // that instead of silently failing or doing nothing.
    const handleRateApp = () => {
        if (!APP_STORE_ID) {
            Alert.alert("Not on the App Store yet", "WaCow isn't live yet — check back after launch!")
            return
        }
        Linking.openURL(`itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`)
    }

    return (
        <ScrollView style={styles.container}>
            {/* User avatar and name */}
            <ProfileHeader />

            {/* Stat boxes — workouts, days active */}
            <StatsGrid workouts={workouts} daysActive={daysActive} />

            {/* Personal info rows */}
            <PersonalInfo data={personalInfo} />

            {/* Menu — moved here from the old More tab */}
            <MenuList onShareApp={handleShareApp} onRateApp={handleRateApp} />

            {/* Logout button — white with red border */}
            <View style={styles.logoutShadow}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <AppInfoCard />

            <MoreFooter />
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