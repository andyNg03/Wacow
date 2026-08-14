// Home Screen — main screen showing hero card and stat cards

import { View, ScrollView, StyleSheet } from 'react-native'
import HeroCard from '../components/HeroCard'
import StatCard from '../components/StatCard'
import { colors, spacing } from '../style/theme'

// Hardcoded data for now — will be replaced with Supabase queries later
let dayStreak = 9;
let workouts = 25;

export default function HomeScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Hero greeting card at the top */}
            <HeroCard />

            {/* Stat cards */}
            <View style={styles.grid}>
                <View style={styles.row}>
                    {/* Day Streak — gold gradient card */}
                    <StatCard iconName="flame" iconColor={colors.textDark} value={dayStreak} desc="Day Streak" useGradient />
                    {/* Workouts — red card */}
                    <StatCard iconName="barbell" iconColor={colors.textLight} value={workouts} desc="Workouts" backgroundColor={colors.workoutCard} />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
    },
    grid: {
        marginHorizontal: spacing.sm,
    },
    row: {
        flexDirection: 'row',
    },
})