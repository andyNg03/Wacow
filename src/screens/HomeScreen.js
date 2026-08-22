// Home Screen — the single dashboard for the app
// Merges what used to live on Home and Stats into one scrolling feed:
// hero → monthly goal → stat cards → week summary → weekly chart → recent workouts

import { View, Text, ScrollView, StyleSheet } from 'react-native'
import HeroCard from '../components/HeroCard'
import StatCard from '../components/StatCard'
import MonthlyGoal from '../components/MonthlyGoal'
import WeekSummary from '../components/WeekSummary'
import WeeklyChart from '../components/WeeklyChart'
import WorkoutCard from '../components/WorkoutCard'
import { colors, typography, spacing } from '../style/theme'

// Hardcoded data for now — will be replaced with Supabase queries later
let dayStreak = 9;
let workouts = 25;

// Monthly goal progress
let goal = 20;
let progress = 12;

// This week's totals
let weekWorkouts = 26;
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

// Most recent sessions — newest first
const recentWorkouts = [
    { id: 1, name: 'Push Day',  duration: 52, calories: 410, gradientColors: ['#ef4444', colors.primary] },
    { id: 2, name: 'Leg Day',   duration: 64, calories: 520, gradientColors: [colors.streakCard, '#d98a12'] },
    { id: 3, name: 'Pull Day',  duration: 45, calories: 380, gradientColors: [colors.achievementCard, '#111827'] },
]

export default function HomeScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Hero greeting card at the top */}
            <HeroCard />

            {/* These cards only define vertical margins, so they need a
                horizontally padded wrapper — HeroCard and StatCard bring
                their own margins and stay outside it */}
            <View style={styles.padded}>
                {/* Monthly goal with progress bar */}
                <MonthlyGoal goal={goal} progress={progress} />
            </View>

            {/* Stat cards */}
            <View style={styles.grid}>
                <View style={styles.row}>
                    {/* Day Streak — gold gradient card */}
                    <StatCard iconName="flame" iconColor={colors.textDark} value={dayStreak} desc="Day Streak" useGradient />
                    {/* Workouts — red card */}
                    <StatCard iconName="barbell" iconColor={colors.textLight} value={workouts} desc="Workouts" backgroundColor={colors.workoutCard} />
                </View>
            </View>

            <View style={styles.padded}>
                {/* Weekly summary card — workouts, active time, calories */}
                <WeekSummary workouts={weekWorkouts} activeTime={activeTime} calories={calories} />

                {/* Bar chart showing activity per day */}
                <WeeklyChart weeklyData={weeklyData} />
            </View>

            {/* Recent workouts — WorkoutCard carries its own horizontal margin */}
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {recentWorkouts.map((workout) => (
                <WorkoutCard
                    key={workout.id}
                    name={workout.name}
                    duration={workout.duration}
                    calories={workout.calories}
                    gradientColors={workout.gradientColors}
                />
            ))}

            {/* Breathing room above the tab bar */}
            <View style={styles.bottomSpacer} />
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
    // Horizontal padding for cards that only set vertical margins
    padded: {
        marginHorizontal: spacing.md,
    },
    sectionTitle: {
        ...typography.sectionTitle,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    bottomSpacer: {
        height: spacing.xl,
    },
})
