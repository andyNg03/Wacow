// Home Screen — main screen showing hero card, stat cards, badges, and daily challenge

import { View, ScrollView, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import HeroCard from '../components/HeroCard'
import StatCard from '../components/StatCard'
import BadgeCard from '../components/BadgeCard'
import DailyChallenge from '../components/DailyChallenge'
import { colors, typography, spacing } from '../style/theme'

// Hardcoded data for now — will be replaced with Supabase queries later
let dayStreak = 9;
let workouts = 25;
let xpPoints = 750;
let achievements = 5;
let challenge = "Complete 50 push-ups today!";
let current = 20;
let total = 50;

export default function HomeScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Hero greeting card at the top */}
            <HeroCard />

            {/* 2x2 grid of stat cards */}
            <View style={styles.grid}>
                <View style={styles.row}>
                    {/* Day Streak — gold gradient card */}
                    <StatCard iconName="flame" iconColor={colors.textDark} value={dayStreak} desc="Day Streak" useGradient />
                    {/* Workouts — red card */}
                    <StatCard iconName="barbell" iconColor={colors.textLight} value={workouts} desc="Workouts" backgroundColor={colors.workoutCard} />
                </View>
                <View style={styles.row}>
                    {/* XP Points — white card */}
                    <StatCard iconName="star" iconColor={colors.primary} value={xpPoints} desc="XP Points" backgroundColor={colors.xpCard} />
                    {/* Achievements — black card */}
                    <StatCard iconName="flash" iconColor="#FDE047" value={achievements} desc="Achievements" backgroundColor={colors.achievementCard} />
                </View>
            </View>

            {/* Badges section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Badges</Text>
            </View>

            {/* Badge row */}
            <View style={styles.badgeRow}>
                <BadgeCard icon="battery-full-outline" name="Unlimited Stamina" />
                <BadgeCard icon="trending-up" name="Only Up From Here" />
                <BadgeCard icon="lock-closed" name="Locked In" />
            </View>

            {/* Daily challenge card at the bottom */}
            <DailyChallenge challenge={challenge} current={current} total={total} />
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginLeft: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    sectionTitle: {
        ...typography.sectionTitle,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
    }
})