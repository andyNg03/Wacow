import HomeScreen from './src/screens/HomeScreen'
import { NavigationContainer } from '@react-navigation/native'
import TabNavigator from './src/navigation/TabNav'
import { useState, useEffect } from 'react'
import { supabase } from './src/lib/supabase'
import AuthScreen from './src/screens/AuthScreen'
import ProfileSetupScreen from './src/screens/ProfileSetupScreen'

export default function App() {
  // ─── State ────────────────────────────────────────────────
  // Two facts drive the whole app. React remembers these between renders.
  const [session, setSession] = useState(null)          // null = logged out
  const [profileComplete, setProfileComplete] = useState(null)

  // ─── Effect #1: auth wiring (runs once, on app start) ─────
  useEffect(() => {
    // Ask once: is there a saved login from last time?
    // Async — the answer arrives a moment AFTER this line runs.
    // getSession reads the async storage with a session stored in it so we don't need to reach for database
    //
    // .then( fn )  = "when the answer arrives, run fn with it".
    //                JS does NOT pause here; it moves on and comes back later.
    //
    // What arrives is a BOX, not the session itself:
    //     { data: { session: {...} }, 
    //        error: null }
    //
    // ({ data: { session } })  unwraps that box two levels deep to grab
    // just the session. Long form of the same thing:
    //     .then((box) => { const session = box.data.session; ... })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)   // store it -> React re-renders with the answer
    })

    // Standing order: call this every time auth changes from now on
    // (login, logout, hourly token refresh).
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)   // same handoff, but this fires many times
    })
  }, [])   // [] = run once, never again

  // ─── Effect #2: react to login/logout ─────────────────────
  // Runs whenever `session` changes. Not a loop — a trigger.
  useEffect(() => {
    if (session) {
      checkProfile()           // someone logged in -> do they have a profile?
    } else {
      setProfileComplete(null) // logged out -> forget what we knew
    }
  }, [session])

  // ─── The database query ───────────────────────────────────
  // Looks up this user's row and reads one column: profile_complete.
  const checkProfile = async () => {
    //  On success data is { profile_complete: true };
    //  on failure data is null and error holds the reason.
    const { data, error } = await supabase 
      .from('users')                    // table
      .select('profile_complete')       // just this one column
      .eq('auth_id', session.user.id)   // WHERE auth_id = me
      .single()                         // expect exactly one row

    if (error) {
      // couldn't reach the server — don't guess
    } else if (data) {
      setProfileComplete(data.profile_complete)
    } else {
      setProfileComplete(false)   // genuinely no profile row
    }
  }

  // ─── The gate: which screen does this person see? ─────────
  // Three outcomes, checked top to bottom. First match wins.
  const renderScreen = () => {
    if (!session) {
      return <AuthScreen />                // not logged in
    }
    if (!profileComplete) {
      return <ProfileSetupScreen session={session} onComplete={checkProfile} />
    }
    return <TabNavigator />                // logged in + set up -> the app
  }

  return (
    <NavigationContainer>
      {renderScreen()}
    </NavigationContainer>
  )
}
