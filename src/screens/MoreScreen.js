// More Screen — app info, menu options, and footer
// Notification code removed for v1 (Apple flags no-context permission
// prompts) — the real reminder system is a v1.1 backlog item.
import { Text, ScrollView, StyleSheet } from 'react-native'
import AppInfoCard from '../components/AppInfoCard'
import MenuList from '../components/MenuList'
import MoreFooter from '../components/MoreFooter'
import { colors, typography, spacing } from '../style/theme'

export default function MoreScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>More Options</Text>
            <Text style={styles.subtitle}>Make it yours!</Text>
            <AppInfoCard />
            <MenuList />
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