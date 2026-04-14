// ExerciseCard — single exercise card with editable weight/reps/sets
// and double tap to complete/uncomplete
//
// DOUBLE TAP LOGIC:
// We track the last tap time using useRef
// If two taps happen within 300ms, it's a double tap
// Double tap toggles the completed state on/off
// This works on both mobile (touch) and laptop (mouse click)
//
// forwardRef + useImperativeHandle lets WorkoutsScreen call
// cardRef.current.getValues() to collect weight/reps/sets when session ends
//
// TODO (Backend): When completed, send completion to Supabase

import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

const ExerciseCard = forwardRef(function ExerciseCard(
    { exercise, cardColor, isCompleted, onComplete, onUncomplete, sessionActive },
    ref
) {
    // ─── Local state ──────────────────────────────────────────────────────────
    const [weight, setWeight] = useState(String(exercise.weight))
    const [reps,   setReps]   = useState(String(exercise.reps))
    const [sets,   setSets]   = useState(String(exercise.sets))

    // Double tap detection — track last tap time
    const lastTap = useRef(null)

    // ─── useImperativeHandle ──────────────────────────────────────────────────
    // Exposes getValues() to WorkoutsScreen via ref
    // WorkoutsScreen calls this when End Session is pressed
    useImperativeHandle(ref, () => ({
        getValues: () => ({
            name:   exercise.name,
            weight: weight,
            reps:   reps,
            sets:   sets,
        })
    }))

    // ─── Double tap handler ───────────────────────────────────────────────────
    // Two taps within 300ms = double tap
    // Toggles completed state on/off
    const handleDoubleTap = () => {
        if (!sessionActive) return // ignore taps before session starts
        const now = Date.now()
        if (lastTap.current && now - lastTap.current < 300) {
            // Double tap detected — toggle
            if (isCompleted) {
                onUncomplete() // uncheck if already done
            } else {
                onComplete()   // check off if not done
            }
            lastTap.current = null // reset so next tap starts fresh
        } else {
            lastTap.current = now
        }
    }

    // ─── Completed state ──────────────────────────────────────────────────────
    // When completed, show greyed out card with checkmark
    // User can double tap again to uncheck
    if (isCompleted) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDoubleTap}
                style={styles.completedWrapper}
            >
                <View style={styles.completedCard}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    <Text style={styles.completedText}>{exercise.name} — Done!</Text>
                    <Text style={styles.undoHint}>double tap to undo</Text>
                </View>
            </TouchableOpacity>
        )
    }

    // ─── Active card ──────────────────────────────────────────────────────────
    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={handleDoubleTap}
            style={styles.shadowWrapper}
        >
            <View style={[styles.card, { backgroundColor: cardColor.bg }]}>
                {/* Exercise name + double tap hint */}
                <View style={styles.nameRow}>
                    <Text style={[styles.exerciseName, { color: cardColor.text }]}>
                        {exercise.name}
                    </Text>
                    {/* Only show hint when session is active */}
                    {sessionActive && (
                        <Text style={[styles.tapHint, { color: cardColor.text }]}>
                            double tap to complete
                        </Text>
                    )}
                </View>

                {/* Three editable stat boxes */}
                <View style={styles.statsRow}>
                    <EditableStatBox
                        label="WEIGHT"
                        value={weight}
                        onChangeText={setWeight}
                        cardColor={cardColor}
                        keyboardType="default"
                    />
                    <EditableStatBox
                        label="REPS"
                        value={reps}
                        onChangeText={setReps}
                        cardColor={cardColor}
                        keyboardType="number-pad"
                    />
                    <EditableStatBox
                        label="SETS"
                        value={sets}
                        onChangeText={setSets}
                        cardColor={cardColor}
                        keyboardType="number-pad"
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
})

// ─── Editable stat box ────────────────────────────────────────────────────────
// TextInput lets user tap and edit the value
// selectTextOnFocus highlights all text when tapped — easy to replace
function EditableStatBox({ label, value, onChangeText, cardColor, keyboardType }) {
    return (
        <View style={[styles.statBox, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
            <Text style={[styles.statLabel, { color: cardColor.text, opacity: 0.7 }]}>
                {label}
            </Text>
            <TextInput
                style={[styles.statValue, { color: cardColor.text }]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                selectTextOnFocus
            />
        </View>
    )
}

export default ExerciseCard

const styles = StyleSheet.create({
    shadowWrapper: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    card: {
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    nameRow: {
        marginBottom: spacing.md,
    },
    exerciseName: {
        fontSize: 20,
        fontWeight: '900',
    },
    // Small hint shown below exercise name when session is active
    tapHint: {
        fontSize: 11,
        fontWeight: '700',
        opacity: 0.6,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statBox: {
        flex: 1,
        borderRadius: borders.small.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.2)',
        padding: spacing.sm,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        minHeight: 28,
    },
    // Completed state
    completedWrapper: {
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
    },
    completedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.inputBackground,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.md,
        opacity: 0.6,
    },
    completedText: {
        ...typography.body,
        color: colors.textMuted,
        flex: 1,
    },
    undoHint: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
    },
})