// Workouts Screen — manages the full workout session workflow
// States: picking → active → results → done
//
// HOW IT WORKS:
// 1. User picks exercises from ExercisePickerScreen
// 2. User presses START SESSION button → session goes active
// 3. User double taps a card to complete it → progress updates
// 4. User double taps again to undo → progress decrements
// 5. User presses End Session OR completes all exercises → results overlay
// 6. Results are saved to Supabase sessions table
// 7. User dismisses results → done screen or back to picking

import { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ExerciseCard from '../components/ExerciseCard'
import SessionTimer from '../components/SessionTimer'
import ResultsOverlay from '../components/ResultsOverlay'
import ExercisePickerScreen from './ExercisePickerScreen'
import { supabase } from '../lib/supabase'
import { colors, borders, spacing, typography } from '../style/theme'

// Card colors cycle: red → gold → white
const CARD_COLORS = [
    { bg: colors.primary, text: colors.textLight },
    { bg: colors.streakCard, text: colors.textDark },
    { bg: colors.background, text: colors.textDark },
]

export default function WorkoutsScreen() {
    // ─── State ────────────────────────────────────────────────────────────────
    const [sessionState, setSessionState] = useState('picking')
    const [selectedExercises, setSelectedExercises] = useState([])
    const [completedIds, setCompletedIds] = useState(new Set())
    const [sessionResults, setSessionResults] = useState([])
    const [userId, setUserId] = useState(null)
    const [sessionStartTime, setSessionStartTime] = useState(null)

    // One ref per exercise card
    const cardRefs = useRef([])

    // ─── Get current user ID on mount ─────────────────────────────────────────
    useEffect(() => {
        getUserId()
    }, [])

    const getUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', user.id)
                .single()
            if (data) setUserId(data.id)
        }
    }

    // ─── Derived values ───────────────────────────────────────────────────────
    const totalExercises = selectedExercises.length
    const completedCount = completedIds.size
    const allCompleted = completedCount === totalExercises
    const progressPercent = totalExercises > 0
        ? (completedCount / totalExercises) * 100
        : 0

    // ─── Handlers ─────────────────────────────────────────────────────────────

    // Called when user picks exercises and taps Start Session
    const handleStartSession = (exercises) => {
        setSelectedExercises(exercises)
        cardRefs.current = exercises.map(() => ({ current: null }))
        setCompletedIds(new Set())
        setSessionStartTime(new Date())
        setSessionState('active')
    }

    const handleComplete = (id) => {
        setCompletedIds(prev => {
            const updated = new Set(prev)
            updated.add(id)
            if (updated.size === totalExercises) {
                collectResultsAndShow()
            }
            return updated
        })
    }

    const handleUncomplete = (id) => {
        setCompletedIds(prev => {
            const updated = new Set(prev)
            updated.delete(id)
            return updated
        })
    }

    const collectResultsAndShow = () => {
        const results = cardRefs.current.map((ref, index) => {
            if (ref.current) {
                const values = ref.current.getValues()
                return { ...values, workout_id: selectedExercises[index].id }
            }
            return null
        }).filter(Boolean)
        setSessionResults(results)
        setSessionState('results')
    }

    const handleEndSession = () => collectResultsAndShow()

    // Save session results to Supabase and dismiss
    const handleDismissResults = async () => {
        if (userId && sessionResults.length > 0) {
            const duration = sessionStartTime
                ? Math.round((new Date() - sessionStartTime) / 60000)
                : 0

            const rows = sessionResults.map((r) => ({
                user_id: userId,
                workout_id: r.workout_id,
                sets: parseInt(r.sets) || 0,
                reps: parseInt(r.reps) || 0,
                weight: parseInt(r.weight) || 0,
                duration: duration,
                date: new Date().toISOString(),
            }))

            const { error } = await supabase.from('sessions').insert(rows)
            if (error) Alert.alert('Error saving', error.message)
        }

        if (allCompleted) {
            setSessionState('done')
        } else {
            setSessionState('picking')
            setSelectedExercises([])
            setCompletedIds(new Set())
        }
    }

    // ─── Render: Exercise Picker ──────────────────────────────────────────────
    if (sessionState === 'picking') {
        return <ExercisePickerScreen onStartSession={handleStartSession} />
    }

    // ─── Render: Done screen ──────────────────────────────────────────────────
    if (sessionState === 'done') {
        return (
            <View style={styles.doneContainer}>
                <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
                <Text style={styles.doneTitle}>All done for today!</Text>
                <Text style={styles.doneSubtitle}>
                    You crushed every exercise. Come back tomorrow! 🐄
                </Text>
                <TouchableOpacity
                    style={styles.newSessionBtn}
                    onPress={() => {
                        setSessionState('picking')
                        setSelectedExercises([])
                        setCompletedIds(new Set())
                    }}
                >
                    <Text style={styles.newSessionText}>Start New Session</Text>
                </TouchableOpacity>
            </View>
        )
    }

    // ─── Render: Active workout screen ────────────────────────────────────────
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLabel}>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                        <Text style={styles.headerLabelText}>TODAY'S SESSION</Text>
                    </View>
                    <Text style={styles.sessionName}>
                        {selectedExercises.length} Exercises
                    </Text>
                </View>

                {/* Session Timer */}
                <SessionTimer />

                {/* Exercise list */}
                {selectedExercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        ref={(el) => { cardRefs.current[index] = { current: el } }}
                        exercise={{
                            id: exercise.id,
                            name: exercise.name,
                            weight: '0',
                            reps: 0,
                            sets: 0,
                        }}
                        cardColor={CARD_COLORS[index % CARD_COLORS.length]}
                        isCompleted={completedIds.has(exercise.id)}
                        sessionActive={true}
                        onComplete={() => handleComplete(exercise.id)}
                        onUncomplete={() => handleUncomplete(exercise.id)}
                    />
                ))}

                {/* Progress bar */}
                <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressCount}>{completedCount} / {totalExercises}</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>

                {/* End Session button */}
                <View style={styles.endButtonShadow}>
                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={handleEndSession}
                    >
                        <Text style={styles.endButtonText}>End Session</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Results overlay */}
            {sessionState === 'results' && (
                <ResultsOverlay
                    sessionResults={sessionResults}
                    completedIds={completedIds}
                    onDismiss={handleDismissResults}
                    allCompleted={allCompleted}
                    elapsedTime={sessionStartTime
                        ? Math.floor((new Date() - sessionStartTime) / 1000)
                        : 0
                    }
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
    },
    header: {
        paddingHorizontal: spacing.md,
        paddingTop: 60,
        paddingBottom: spacing.sm,
    },
    headerLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    headerLabelText: {
        fontSize: 13,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: 1,
    },
    sessionName: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.textDark,
        marginBottom: spacing.xs,
    },
    progressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    progressLabel: {
        ...typography.small,
        color: colors.textMuted,
        fontSize: 14,
    },
    progressCount: {
        ...typography.small,
        color: colors.textMuted,
        fontSize: 14,
    },
    progressTrack: {
        marginHorizontal: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 999,
        height: 8,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    progressFill: {
        backgroundColor: colors.primary,
        height: '100%',
        borderRadius: 999,
    },
    endButtonShadow: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginHorizontal: spacing.md,
        marginBottom: spacing.xl,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    endButton: {
        backgroundColor: colors.primary,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        alignItems: 'center',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    endButtonText: {
        ...typography.body,
        color: colors.textLight,
        fontSize: 18,
    },
    doneContainer: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    doneTitle: {
        ...typography.sectionTitle,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    doneSubtitle: {
        ...typography.body,
        color: colors.textMuted,
        textAlign: 'center',
    },
    newSessionBtn: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    newSessionText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '900',
    },
})