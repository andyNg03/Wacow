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
    // null userId alone can't distinguish "still fetching" from "fetch
    // failed" — that ambiguity was the silent-loss bug. Track it explicitly.
    const [userIdStatus, setUserIdStatus] = useState('loading') // 'loading' | 'ready' | 'error'
    const [sessionStartTime, setSessionStartTime] = useState(null)

    // One ref per exercise card
    const cardRefs = useRef([])

    // ─── Get current user ID on mount ─────────────────────────────────────────
    useEffect(() => {
        getUserId()
    }, [])

    // Returns the id (and caches it in state), or null on failure — callers
    // can use the return value directly instead of waiting on a re-render.
    const getUserId = async () => {
        setUserIdStatus('loading')
        // getSession() reads the login already stored on the device — no
        // network round-trip, unlike the old getUser(), so one less call
        // that a bad connection could kill.
        const { data: { session } } = await supabase.auth.getSession()
        const authId = session?.user?.id
        if (!authId) {
            setUserIdStatus('error')
            return null
        }
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', authId)
            .single()
        if (error) {
            setUserIdStatus('error')
            return null
        }
        setUserId(data.id)
        setUserIdStatus('ready')
        return data.id
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

    // The one and only place session state gets cleared. Reached exactly
    // two ways: the save succeeded, or the user chose to discard.
    const finishSession = () => {
        if (allCompleted) {
            setSessionState('done')
        } else {
            setSessionState('picking')
            setSelectedExercises([])
            setCompletedIds(new Set())
        }
    }

    const saveFailedAlert = (message) => {
        Alert.alert(
            'Save failed',
            message + '\n\nYour workout is still here — tap Save Results ' +
            'again when you have signal.',
            [
                { text: 'Keep results', style: 'cancel' },
                { text: 'Discard workout', style: 'destructive', onPress: finishSession },
            ]
        )
    }

    // Save session results to Supabase; dismiss ONLY if that worked
    const handleDismissResults = async () => {
        if (sessionResults.length === 0) {
            finishSession()  // nothing to save, nothing to lose
            return
        }

        // Last-chance retry if the mount fetch failed — the user may have
        // walked back into signal since then.
        let id = userId ?? await getUserId()
        if (!id) {
            saveFailedAlert("Can't reach the server.")
            return
        }

        const duration = sessionStartTime
            ? Math.round((new Date() - sessionStartTime) / 60000)
            : 0

        const rows = sessionResults.map((r) => ({
            user_id: id,
            workout_id: r.workout_id,
            sets: parseInt(r.sets) || 0,
            reps: parseInt(r.reps) || 0,
            weight: parseInt(r.weight) || 0,
            duration: duration,
            date: new Date().toISOString(),
        }))

        const { error } = await supabase.from('sessions').insert(rows)
        if (error) {
            saveFailedAlert(error.message)
            return  // overlay stays; results stay; retry is free
        }
        finishSession()
    }

    // ─── Render: Exercise Picker ──────────────────────────────────────────────
    if (sessionState === 'picking') {
        // Fail loudly at the door, not silently at the exit: without a
        // user id nothing can be saved, so don't let a session start.
        if (userIdStatus === 'error') {
            return (
                <View style={styles.doneContainer}>
                    <Ionicons name="cloud-offline-outline" size={80} color={colors.textMuted} />
                    <Text style={styles.doneTitle}>Can't reach the server</Text>
                    <Text style={styles.doneSubtitle}>
                        Workouts couldn't be saved right now. Check your
                        connection and try again.
                    </Text>
                    <TouchableOpacity style={styles.newSessionBtn} onPress={getUserId}>
                        <Text style={styles.newSessionText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )
        }
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