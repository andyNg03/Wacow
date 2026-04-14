import HomeScreen from './src/screens/HomeScreen'
import { NavigationContainer } from '@react-navigation/native'
import TabNavigator from './src/navigation/TabNav'
import { useState, useEffect } from 'react'
import { supabase } from './src/lib/supabase'
import AuthScreen from './src/screens/AuthScreen'
import ProfileSetupScreen from './src/screens/ProfileSetupScreen'

export default function App() {
  const [session, setSession] = useState(null)
  const [profileComplete, setProfileComplete] = useState(null) // null = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  // Check if profile is complete whenever session changes
  useEffect(() => {
    if (session) {
      checkProfile()
    } else {
      setProfileComplete(null)
    }
  }, [session])

  const checkProfile = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('profile_complete')
      .eq('auth_id', session.user.id)
      .single()

    if (data) {
      setProfileComplete(data.profile_complete)
    } else {
      setProfileComplete(false)
    }
  }

  return (
    <NavigationContainer>
      {!session ? (
        <AuthScreen />
      ) : !profileComplete ? (
        <ProfileSetupScreen session={session} onComplete={checkProfile} />
    ) : (
      <TabNavigator />
      )}
    </NavigationContainer>
  )
}