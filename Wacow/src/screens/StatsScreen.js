// Stats Screen — shows weekly summary, activity chart, monthly goal, and latest achievement

import { View, Text, ScrollView, StyleSheet } from 'react-native'
import WeekSummary from '../components/WeekSummary'
import WeeklyChart from '../components/WeeklyChart'
import MonthlyGoal from '../components/MonthlyGoal'
import LatestAchievement from '../components/LatestAchievement'
import { colors, typography, spacing } from '../style/theme'

// Hardcoded data for now — will be replaced with Supabase queries later
let workouts = 26;
let activeTime = 12; // in hours
let calories = 2520;

// Each day has a value representing workout intensity/minutes
const weeklyData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 30 },
    { day: 'Wed', value: 40 },
    { day: 'Thu', value: 100 },
    { day: 'Fri', value: 50 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 20 },
]

let goal = 20;
let progress = 12;

export default function StatsScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Screen title */}
            <Text style={styles.title}>Your Stats</Text>

            {/* Weekly summary card — workouts, active time, calories */}
            <WeekSummary workouts={workouts} activeTime={activeTime} calories={calories} />

            {/* Bar chart showing activity per day */}
            <WeeklyChart weeklyData={weeklyData} />

            {/* Monthly goal with progress bar */}
            <MonthlyGoal goal={goal} progress={progress} />

            {/* Latest badge/achievement earned */}
            <LatestAchievement />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
        padding: spacing.md,
    },
    title: {
        // sectionTitle from theme: bold black large text
        ...typography.sectionTitle,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
})