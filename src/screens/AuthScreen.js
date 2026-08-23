import { useState } from 'react'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { colors } from '../style/theme'

// ONE JOB: collect an email + password and hand them to Supabase.
//
// Note what this screen does NOT do: it never navigates and never tells
// App.js anything. On a successful login it does literally nothing.
// Supabase's auth state changes -> onAuthStateChange fires over in App.js
// -> setSession -> re-render -> renderScreen() returns <TabNavigator />.
// The screen swaps itself out as a side effect of logging in.
export default function AuthScreen() {
    // ─── State ────────────────────────────────────────────────
    // mode is the interesting one: ONE screen doing TWO jobs.
    // It controls the button labels, whether the Name field appears,
    // and which branch handleAuth takes below.
    const [mode, setMode] = useState('login') // 'login' or 'signup'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)   // disables the button mid-request

    // ─── Validation ───────────────────────────────────────────
    // Catch blanks and obvious typos BEFORE spending a network round trip.
    // The server stays the real arbiter — this is the doorman, not the judge.
    // Password minimum matches Supabase's default (6), so we reject locally
    // exactly what the server would reject anyway.
    const inputError = () => {
        if (mode === 'signup' && !name.trim()) return 'Enter your name.'
        if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address.'
        if (password.length < 6) return 'Password must be at least 6 characters.'
        return null
    }

    // ─── The submit handler: two different jobs, picked by `mode` ─────
    const handleAuth = async () => {
        const problem = inputError()
        if (problem) {
            Alert.alert('Almost there', problem)
            return
        }

        setLoading(true)
        try {
            if (mode === 'login') {
                // LOGIN is four lines. We only destructure `error` because we
                // don't need the data — App.js's subscription handles the rest.
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) Alert.alert('Error', error.message)

            } else {
                // SIGNUP is ONE client operation. The `users` profile row is
                // created server-side by a database trigger (handle_new_user) the
                // moment the account lands in auth.users. The name rides along
                // inside options.data — a free-form metadata pouch stored on the
                // account itself — and the trigger reads it back out.
                //
                // Why server-side: the phone may not even be logged in right
                // after signUp (if email confirmation is ever turned on), and RLS
                // has no INSERT policy on `users` — the client is not allowed to
                // create profile rows at all. The trigger runs inside the
                // database, so none of that can block it.
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { name: name.trim() } },   // trimmed — no " Andy "
                })
                if (error) {
                    Alert.alert('Error', error.message)
                } else if (!data.session) {
                    // No session = email confirmation is on (OFF today, but this
                    // guards the flow if the team ever flips it): account created,
                    // not logged in. Without this alert the button just... stops.
                    Alert.alert('Check your email',
                        'We sent you a confirmation link. Tap it, then come back and log in.')
                }
            }
        } finally {
            // finally = runs on success, error, OR throw — the button can
            // never stick at "Loading...".
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            {/* Logo placeholder */}
            <View style={styles.logo}>
                <Text style={styles.logoText}>💪</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Welcome To Wacow!</Text>
            <Text style={styles.subtitle}>Start Your Fitness Journey Here</Text>

            {/* Card */}
            <View style={styles.card}>
                {/* Toggle buttons.
                    style={[a, cond && b]} is a STYLE ARRAY: merged left to
                    right, later wins, and `false` entries are skipped.
                    So the "active" look only applies in the matching mode. */}
                <View style={styles.toggle}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
                        onPress={() => setMode('login')}>
                        <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
                        onPress={() => setMode('signup')}>
                        <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                {/* Name input - only shows for signup.
                    `A && B` returns B if A is true, otherwise A. So this
                    evaluates to either the JSX or `false` — and React renders
                    NOTHING for false. That's the whole conditional-render trick.

                    <>...</> is a Fragment: groups elements without adding an
                    extra <View> to the layout. */}
                {mode === 'signup' && (
                    <>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </>
                )}

                {/* Email input — a CONTROLLED input.
                    The text box does NOT hold the text. React does.

                      keystroke -> onChangeText fires -> setEmail
                                -> re-render -> value={email} pushes it back in

                    A full loop, once per character. Nothing is "watching" the
                    box; the box CALLS our function (same push pattern as .then
                    and onAuthStateChange).

                    Why bother: one source of truth. handleAuth reads `email`
                    and knows it's current without asking the text box. */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    
                />

                {/* Password input */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* Submit button — handleAuth validates before any network call */}
                <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.terms}>By continuing, you agree to our Terms & Privacy Policy</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.border,
        marginBottom: 16,
    },
    logoText: { fontSize: 36 },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textDark,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textMuted,
        marginBottom: 24,
    },
    card: {
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: colors.border,
        padding: 20,
        marginBottom: 16,
    },
    toggle: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
    },
    toggleActive: { backgroundColor: colors.primary },
    toggleText: { fontWeight: '700', color: colors.textDark },
    toggleTextActive: { color: colors.textLight },
    label: { fontWeight: '700', marginBottom: 6 },
    input: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    buttonText: { color: colors.textLight, fontWeight: '900', fontSize: 18 },
    terms: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
})