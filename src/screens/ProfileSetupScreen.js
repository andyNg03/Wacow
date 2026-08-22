import { useState } from 'react'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { colors } from '../style/theme'

// ONE JOB: ask 5 questions across 3 steps, save them once, tell App.js it's done.
//
// PROPS — the stuff in { } below is the ARGUMENT App.js passes when it calls
// this function. In App.js:
//
//     <ProfileSetupScreen session={session} onComplete={checkProfile} />
//
// ...is a function call. JSX just hides it. It compiles to roughly:
//
//     ProfileSetupScreen({ session: session, onComplete: checkProfile })
//
// One argument: an object holding everything passed in. The { session, onComplete }
// in the parameter list unpacks it — same destructuring as { data, error }.
//
//   session    = data. Used for exactly one thing: session.user.id in the save.
//   onComplete = a FUNCTION. It IS checkProfile from App.js, under another name.
//                A child can't change a parent's state directly, so the parent
//                hands down a function the child is allowed to call.
//                Data goes down. Events come back up, through functions.
export default function ProfileSetupScreen({ session, onComplete }) {
    // which screen (3 screens) we're one
    //
    // `step` runs this ENTIRE screen. One number controls four things:
    //   - the header text            "Step {step} of 3"
    //   - the progress bar width     `${(step / 3) * 100}%`  -> 33% / 66% / 100%
    //   - which block renders        {step === 1 && (...)}
    //   - which buttons appear       Back if step > 1, Next if step < 3, else Complete
    // That's the whole navigation system. No routing — just a number.
    const [step, setStep] = useState(1)

    // data about the user
    //
    // These live HERE, on the component — not in the text boxes. That's why
    // going Back doesn't lose your answers: the off-screen steps were never
    // rendered, but `age` etc. are still sitting in state, and value={age}
    // refills the box when the step comes back.
    const [sex, setSex] = useState('')
    const [age, setAge] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [goal, setGoal] = useState('')
    // loading, nothing could be clicked until loading is false
    const [loading, setLoading] = useState(false)

    // ─── Validation ───────────────────────────────────────────
    // One rulebook for the whole wizard. Returns the problem as a string,
    // or null if the step is clean. parseInt('') is NaN, and NaN fails
    // every < > comparison — so blank fields fail these checks naturally.
    const stepError = (s) => {
        if (s === 1) {
            if (!sex) return 'Select your sex to continue.'
            const a = parseInt(age)
            if (isNaN(a) || a < 13 || a > 120) return 'Enter an age between 13 and 120.'
        }
        if (s === 2) {
            const h = parseInt(height)
            if (isNaN(h) || h < 50 || h > 300) return 'Enter a height between 50 and 300 cm.'
            const w = parseInt(weight)
            if (isNaN(w) || w < 20 || w > 500) return 'Enter a weight between 20 and 500 kg.'
        }
        if (s === 3) {
            if (!goal) return 'Pick a goal to finish.'
        }
        return null
    }

    // Next only advances past a clean step. An alert that SAYS what's
    // missing beats a silently disabled button.
    const handleNext = () => {
        const problem = stepError(step)
        if (problem) {
            Alert.alert('Almost there', problem)
            return
        }
        setStep(step + 1)
    }

    // ─── THE SAVE ─────────────────────────────────────────────
    // The only function in this file that talks to the database.
    // Everything below the return is layout.
    // Wired to the Complete button on step 3 (onPress={handleComplete}).
    const handleComplete = async () => {
        // Re-check EVERY step, not just this one — the user can go Back,
        // blank a field, and land here again. On a violation, jump them
        // to the offending step with the alert.
        for (const s of [1, 2, 3]) {
            const problem = stepError(s)
            if (problem) {
                Alert.alert('Almost there', problem)
                setStep(s)
                return
            }
        }

        setLoading(true)
        try {
            // One write does everything, including flipping profile_complete
            // to true. The row is guaranteed to exist — the signup trigger
            // creates it — so .update() always has something to hit.
            // The goal STRING becomes a NUMBER on the way in:
            //   Lose Weight -> 5 days/week, Build Muscle -> 4, Stay Fit -> 3
            const { error } = await supabase
                .from('users')
                .update({
                    sex,
                    age: parseInt(age),
                    height: parseInt(height),
                    weight: parseInt(weight),
                    weekly_goal: goal === 'Lose Weight' ? 5 : goal === 'Build Muscle' ? 4 : 3,
                    profile_complete: true,
                })
                .eq('auth_id', session.user.id)

            if (error) Alert.alert('Error', error.message)
            else if (onComplete) onComplete()   // hands control back up to App.js
        } finally {
            // finally = runs on success, error, OR throw — the button can
            // never stick at "Saving...".
            setLoading(false)
        }
    }

    // ─── The escape hatch ─────────────────────────────────────
    // This screen used to be a room with no door: no logout, no skip. Any
    // failure marooned the user permanently. Log out changes the session
    // fact; App.js's gate sees it vanish and routes to AuthScreen — this
    // screen never navigates, same as always.
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) Alert.alert('Error', error.message)
    }

    // What onComplete() sets off, end to end:
    //
    //   onComplete()
    //      -> checkProfile() runs in App.js
    //      -> SELECT profile_complete -> true
    //      -> setProfileComplete(true)
    //      -> App re-renders
    //      -> renderScreen() falls through to <TabNavigator />
    //
    // NOTE this screen never navigates anywhere. Same as AuthScreen: it changes a
    // fact, and the gate in App.js re-evaluates. That's the good part of the design.

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Text style={styles.headerIconText}>👤</Text>
                </View>
                <View>
                    <Text style={styles.headerTitle}>Profile Setup</Text>
                    <Text style={styles.headerSub}>Step {step} of 3</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>

            {/* Progress bar — width is computed straight from `step`.
                `${...}` is a template string: step 2 -> "66.66...%" */}
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>

            {/* Step 1: Basic Info
                {step === 1 && (...)} renders the block only when step is 1.
                The other two steps aren't hidden — React never CREATES them.
                (Their answers survive anyway; they live in state above.) */}
            {step === 1 && (
                <View style={styles.stepContainer}>
                    <View style={styles.banner}>
                        <Text style={styles.bannerTitle}>Basic Info</Text>
                        <Text style={styles.bannerSub}>Tell us about yourself</Text>
                    </View>

                    <Text style={styles.label}>Sex</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.optionBtn, sex === 'Male' && styles.optionActive]}
                            onPress={() => setSex('Male')}>
                            <Text style={[styles.optionText, sex === 'Male' && styles.optionTextActive]}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionBtn, sex === 'Female' && styles.optionActive]}
                            onPress={() => setSex('Female')}>
                            <Text style={[styles.optionText, sex === 'Female' && styles.optionTextActive]}>Female</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your age"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />
                </View>
            )}

            {/* Step 2: Body Metrics */}
            {step === 2 && (
                <View style={styles.stepContainer}>
                    <View style={[styles.banner, styles.bannerDark]}>
                        <Text style={styles.bannerTitle}>Body Metrics</Text>
                        <Text style={styles.bannerSub}>Help us track your progress</Text>
                    </View>

                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your height"
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your weight"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                    />
                </View>
            )}

            {/* Step 3: Goal */}
            {step === 3 && (
                <View style={styles.stepContainer}>
                    <View style={styles.banner}>
                        <Text style={styles.bannerTitle}>Your Goal</Text>
                        <Text style={styles.bannerSub}>What do you want to achieve?</Text>
                    </View>

                    {/* .map turns an array of DATA into an array of BUTTONS.
                        React renders arrays of JSX directly, so 3 strings -> 3 buttons.

                        `key` is React's name tag for each item. It does NOT reorder
                        anything — it only answers "which old item is which new item?"
                        when the list changes, so React updates the right row instead
                        of guessing by position.

                        Here it's a formality: 3 fixed strings that never change.
                        It matters in ExercisePickerScreen, where 200 items get
                        filtered as you type. Use a stable id there — never the
                        array index, since the index IS the position. */}
                    {['Lose Weight', 'Build Muscle', 'Stay Fit'].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.goalBtn, goal === g && styles.goalActive]}
                            onPress={() => setGoal(g)}>
                            <Text style={[styles.goalText, goal === g && styles.goalTextActive]}>
                                {g === 'Lose Weight' ? '📈' : g === 'Build Muscle' ? '🎯' : '🏃'} {g}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Navigation buttons — all three conditions read `step`.
                Back only from step 2 onward; Next until step 3; then Complete.
                Back skips validation on purpose: retreating is always allowed. */}
            <View style={styles.navRow}>
                {step > 1 && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                )}
                {step < 3 ? (
                    <TouchableOpacity
                        style={[styles.nextBtn, step === 1 && { flex: 1 }]}
                        onPress={handleNext}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.nextBtn} onPress={handleComplete} disabled={loading}>
                        <Text style={styles.nextText}>{loading ? 'Saving...' : 'Complete'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e53935',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    headerIconText: { fontSize: 22 },
    headerTitle: { fontSize: 24, fontWeight: '900' },
    headerSub: { fontSize: 14, color: '#666' },
    progressBg: {
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        marginBottom: 24,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#e53935',
        borderRadius: 4,
    },
    stepContainer: { flex: 1 },
    banner: {
        backgroundColor: '#e53935',
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#000',
        padding: 20,
        marginBottom: 24,
    },
    bannerDark: { backgroundColor: '#1a1a2e' },
    bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    bannerSub: { color: '#fff', fontSize: 14, opacity: 0.8 },
    label: { fontWeight: '700', marginBottom: 6 },
    input: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    optionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
    },
    optionActive: { backgroundColor: '#e53935' },
    optionText: { fontWeight: '700', fontSize: 16 },
    optionTextActive: { color: '#fff' },
    goalBtn: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
        marginBottom: 12,
    },
    goalActive: { backgroundColor: '#e53935' },
    goalText: { fontWeight: '700', fontSize: 16 },
    goalTextActive: { color: '#fff' },
    navRow: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 20,
    },
    backBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
    },
    backText: { fontWeight: '700', fontSize: 16 },
    nextBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#ccc',
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
    },
    nextText: { fontWeight: '700', fontSize: 16, color: '#555' },
    logoutBtn: {
        marginLeft: 'auto',     // pushes itself to the header's right edge
        padding: 8,             // bigger tap target than the text alone
    },
    logoutText: {
        fontWeight: '700',
        color: colors.primary,
    },
})