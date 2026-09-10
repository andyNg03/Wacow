// Home Screen — the single dashboard for the app
// Merges what used to live on Home and Stats into one scrolling feed:
// hero → monthly goal → stat cards → week summary → weekly chart → recent workouts

import { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import HeroCard from '../components/HeroCard'
import StatCard from '../components/StatCard'
import MonthlyGoal from '../components/MonthlyGoal'
import WeekSummary from '../components/WeekSummary'
import WeeklyChart from '../components/WeeklyChart'
import WorkoutCard from '../components/WorkoutCard'
import { supabase } from '../lib/supabase'
import { colors, typography, spacing } from '../style/theme'

// Monthly workout goal — a v1 design constant (no goal-setting UI yet)
const MONTHLY_GOAL = 20

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Gradient pairs cycled across the recent-workout cards (same three
// looks the fake cards had)
const CARD_GRADIENTS = [
    ['#ef4444', colors.primary],
    [colors.streakCard, '#d98a12'],
    [colors.achievementCard, '#111827'],
]

// Collapse one-row-per-exercise into one entry per gym visit.
// Pre-session_id rows have null there: each stands alone via its id.
// Rows arrive date-desc, and Map keeps insertion order, so groups
// stay newest-first for free.
function groupSessions(rows) {
    const map = new Map()
    for (const row of rows) {
        const key = row.session_id ?? row.id
        if (!map.has(key)) {
            map.set(key, { key, date: row.date, duration: row.duration, names: [] })
        }
        map.get(key).names.push(row.workouts?.name ?? 'Exercise')
    }
    return [...map.values()]
}

// Week + month stats derived from the already-fetched groups — no extra
// network trips. new Date(g.date) converts the stored UTC timestamp to
// device-local time, so "which day" needs no tz plumbing here.
function deriveStats(groups) {
    const now = new Date()
    // Monday 00:00 local. getDay() is 0=Sun..6=Sat; (x+6)%7 shifts to 0=Mon.
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

    let weekCount = 0
    let weekMinutes = 0
    let monthCount = 0
    const chartMinutes = [0, 0, 0, 0, 0, 0, 0]

    for (const g of groups) {
        const d = new Date(g.date)
        if (d >= monday) {
            weekCount += 1
            weekMinutes += g.duration ?? 0
            chartMinutes[(d.getDay() + 6) % 7] += g.duration ?? 0
        }
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            monthCount += 1
        }
    }

    return {
        weekCount,
        weekHours: Math.round((weekMinutes / 60) * 10) / 10, // one decimal
        monthCount,
        weeklyData: DAY_LABELS.map((day, i) => ({ day, value: chartMinutes[i] })),
    }
}

export default function HomeScreen() {
    const [name, setName] = useState(null)
    const [streak, setStreak] = useState(null)
    // Three-state for the fetch that feeds count + recent list
    const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'
    const [groups, setGroups] = useState([])

    const loadDashboard = useCallback(() => {
        // Name and streak are decorative — fetch quietly, fall back on error.
        supabase.from('users').select('name').single().then(({ data, error }) => {
            if (!error && data?.name) setName(data.name)
        })
        supabase.rpc('current_streak', {
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).then(({ data, error }) => {
            if (!error) setStreak(data)
        })

        // Sessions drive the count and recent cards — full three-state.
        // No cancelled flag here: unlike ResultsOverlay, this screen never
        // unmounts, so a late response writing state is always safe.
        setStatus('loading')
        supabase
            .from('sessions')
            .select('id, session_id, date, duration, workouts(name)')
            .order('date', { ascending: false })
            .then(({ data, error }) => {
                if (error) { setStatus('error'); return }
                setGroups(groupSessions(data))
                setStatus('ready')
            })
    }, [])

    // Re-fetch every time the tab gains focus, not just on mount — the
    // screen stays mounted across tab switches, so a plain useEffect
    // would show boot-time data forever. useCallback keeps the callback
    // pointer stable so the focus effect doesn't re-fire per render.
    useFocusEffect(loadDashboard)

    const { weekCount, weekHours, monthCount, weeklyData } = deriveStats(groups)

    return (
        <ScrollView style={styles.container}>
            {/* Hero greeting card at the top */}
            <HeroCard name={name} />

            {/* These cards only define vertical margins, so they need a
                horizontally padded wrapper — HeroCard and StatCard bring
                their own margins and stay outside it */}
            <View style={styles.padded}>
                {/* Monthly goal with progress bar */}
                <MonthlyGoal goal={MONTHLY_GOAL} progress={monthCount} />
            </View>

            {/* Stat cards */}
            <View style={styles.grid}>
                <View style={styles.row}>
                    {/* Day Streak — gold gradient card */}
                    <StatCard iconName="flame" iconColor={colors.textDark} value={streak ?? '—'} desc="Day Streak" useGradient />
                    {/* Workouts — red card */}
                    <StatCard iconName="barbell" iconColor={colors.textLight} value={status === 'ready' ? groups.length : '…'} desc="Workouts" backgroundColor={colors.workoutCard} />
                </View>
            </View>

            <View style={styles.padded}>
                {/* Weekly summary card — workouts, active time, calories */}
                <WeekSummary workouts={weekCount} activeTime={weekHours} />

                {/* Bar chart showing activity per day */}
                <WeeklyChart weeklyData={weeklyData} />
            </View>

            {/* Recent workouts — WorkoutCard carries its own horizontal margin */}
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {status === 'loading' && (
                <ActivityIndicator color={colors.primary} style={styles.fetchState} />
            )}
            {status === 'error' && (
                <View style={styles.fetchState}>
                    <Text style={styles.fetchStateText}>Couldn't load your workouts.</Text>
                    <TouchableOpacity onPress={loadDashboard}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
            {status === 'ready' && groups.length === 0 && (
                <Text style={[styles.fetchStateText, styles.fetchState]}>
                    No workouts yet — start one on the Workout tab!
                </Text>
            )}
            {status === 'ready' && groups.slice(0, 3).map((g, i) => (
                <WorkoutCard
                    key={g.key}
                    name={g.names.length > 1 ? `${g.names[0]} +${g.names.length - 1}` : g.names[0]}
                    duration={g.duration}
                    exercises={g.names.length}
                    gradientColors={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
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
    fetchState: {
        marginHorizontal: spacing.md,
        marginVertical: spacing.md,
        alignItems: 'center',
    },
    fetchStateText: {
        ...typography.sectionTitle,
        color: colors.textMuted,
        textAlign: 'center',
    },
    retryText: {
        ...typography.sectionTitle,
        color: colors.primary,
        marginTop: spacing.xs,
    },
})
