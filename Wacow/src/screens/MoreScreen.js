// More Screen — app info, menu options, and footer
// Handles notification permission request on load
// and test notification scheduling
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import AppInfoCard from '../components/AppInfoCard'
import MenuList from '../components/MenuList'
import MoreFooter from '../components/MoreFooter'
import { colors, typography, spacing } from '../style/theme'

// Tell Expo how to handle notifications when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
})

export default function MoreScreen() {
    // Ask for notification permission when screen loads
    useEffect(() => {
        Notifications.requestPermissionsAsync()
    }, [])

    // Schedule a notification 10 seconds from now
    // TODO: Replace with daily scheduled notification at a set time
    const handleTestNotification = async () => {
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Please enable notifications in Settings')
            return
        }
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Hey Champion! 🐄",
                    body: "Time to crush your workout today! 💪",
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 20
                }
            })
            Alert.alert('Notification set!', 'Go to home screen — fires in 20 seconds.')
        } catch (error) {
            Alert.alert('Error', error.message)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>More Options</Text>
            <Text style={styles.subtitle}>Make it yours!</Text>
            <AppInfoCard />
            <MenuList onNotificationPress={handleTestNotification} />
            <MoreFooter />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
        padding: spacing.md,
    },
    title: {
        ...typography.sectionTitle,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
})