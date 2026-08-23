import { NavigationContainer } from '@react-navigation/native'
import TabNavigator from './src/navigation/TabNav'
import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { supabase } from './src/lib/supabase'
import AuthScreen from './src/screens/AuthScreen'
import ProfileSetupScreen from './src/screens/ProfileSetupScreen'
import { colors, typography, spacing, borders } from './src/style/theme'

export default function App() {
  // ─── State ────────────────────────────────────────────────
  // The app's gate runs on these. React remembers them between renders.
  //
  // `session` alone can't say "still checking" — null means BOTH "logged
  // out" and "haven't heard back yet". That ambiguity was the cold-start
  // flash bug, so each async answer gets an explicit status alongside it.
  // (Same loading/ready/error pattern as WorkoutsScreen's userIdStatus.)
  const [session, setSession] = useState(null)          // null = logged out
  const [authReady, setAuthReady] = useState(false)     // false until getSession answers
  const [profileComplete, setProfileComplete] = useState(false)
  const [profileStatus, setProfileStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  // ─── Effect #1: auth wiring (runs once, on app start) ─────
  useEffect(() => {
    // Ask once: is there a saved login from last time?
    // Async — the answer arrives a moment AFTER this line runs.
    // getSession reads local storage, no network round-trip.
    //
    // .then( fn )  = "when the answer arrives, run fn with it".
    //                JS does NOT pause here; it moves on and comes back later.
    //
    // ({ data: { session } }) unwraps the response box two levels deep.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthReady(true)   // now (and only now) the gate may route
    })

    // Standing order: call this every time auth changes from now on
    // (login, logout, hourly token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Returned function runs when App unmounts: cancel the standing order.
    // Without this the listener would outlive the component that owns it.
    return () => subscription.unsubscribe()
  }, [])   // [] = run once, never again

  // ─── Effect #2: react to login/logout ─────────────────────
  // Depends on the user's ID, not the session object: the hourly token
  // refresh delivers a NEW object for the SAME user, and an object dep
  // would see that as a change and re-run checkProfile every hour.
  // The id is a string — same user, same string, no false trigger.
  useEffect(() => {
    if (session) {
      checkProfile()             // someone logged in -> do they have a profile?
    } else {
      setProfileComplete(false)  // logged out -> forget what we knew
      setProfileStatus('loading')
    }
  }, [session?.user?.id])

  // ─── The database query ───────────────────────────────────
  // Looks up this user's row and reads one column: profile_complete.
  const checkProfile = async () => {
    setProfileStatus('loading')
    const { data, error } = await supabase
      .from('users')                    // table
      .select('profile_complete')       // just this one column
      .eq('auth_id', session.user.id)   // WHERE auth_id = me
      .single()                         // expect exactly one row

    if (error) {
      // Two very different "errors" hide in here:
      // PGRST116 = .single() found zero rows — a real answer ("no profile
      // yet"), so the wizard is correct. Anything else = couldn't get an
      // answer (network, server) — don't guess, show the error screen.
      // Guessing wrong here was the old bug: it routed onboarded users
      // into the wizard, where they could overwrite their real profile.
      if (error.code === 'PGRST116') {
        setProfileComplete(false)
        setProfileStatus('ready')
      } else {
        setProfileStatus('error')
      }
      return
    }
    setProfileComplete(!!data.profile_complete)
    setProfileStatus('ready')
  }

  // ─── The gate: which screen does this person see? ─────────
  // Checked top to bottom, first match wins. The two "still waiting"
  // checks come first so no real screen flashes before the facts are in.
  const renderScreen = () => {
    if (!authReady) {
      return <LoadingScreen />           // don't route before getSession answers
    }
    if (!session) {
      return <AuthScreen />              // not logged in
    }
    if (profileStatus === 'loading') {
      return <LoadingScreen />           // logged in, profile check in flight
    }
    if (profileStatus === 'error') {
      return <ProfileErrorScreen onRetry={checkProfile} />
    }
    if (!profileComplete) {
      return <ProfileSetupScreen session={session} onComplete={checkProfile} />
    }
    return <TabNavigator />              // logged in + set up -> the app
  }

  return (
    <NavigationContainer>
      {renderScreen()}
    </NavigationContainer>
  )
}

// Shown while an async answer is in flight. Deliberately plain: it exists
// to prevent the wrong screen from flashing, not to be looked at.
function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

// Shown when the profile check failed — we're logged in but couldn't get
// an answer, and routing on a guess is how profiles get overwritten.
function ProfileErrorScreen({ onRetry }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>Can't reach the server</Text>
      <Text style={styles.errorSubtitle}>
        Check your connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.backgroundTint,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borders.standard.borderRadius,
    borderWidth: borders.standard.borderWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '900',
  },
})
