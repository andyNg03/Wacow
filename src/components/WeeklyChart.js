// WeeklyChart — white card with a bar chart showing daily activity for the week

import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, borders, spacing, typography } from '../style/theme'

// maxValue is used to scale bar heights relative to the tallest bar
// it lives outside the component so Bar can access it
let maxValue = 0;
const CHART_HEIGHT = 160 // max height in pixels a bar can reach

// Individual bar for one day
// If value is 0, just renders the day label with no bar
function Bar({ day, value }) {
    if (value === 0) return (
        <View style={styles.barColumn}>
            <Text style={styles.dayLabel}>{day}</Text>
        </View>
    )

    // Scale bar height proportionally to the tallest bar
    const barHeight = (value / maxValue) * CHART_HEIGHT

    return (
        <View style={styles.barColumn}>
            {/* Container that defines the max height space */}
            <View style={[styles.barBackground, { height: CHART_HEIGHT }]}>
                {/* Black offset = hard shadow on the bar */}
                <View style={styles.barShadow}>
                    <LinearGradient
                        colors={['#f87171', colors.primary]} // light red → dark red
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[styles.bar, { height: barHeight }]}
                    />
                </View>
            </View>
            <Text style={styles.dayLabel}>{day}</Text>
        </View>
    )
}

// Props: weeklyData — array of { day: string, value: number }
export default function WeeklyChart({ weeklyData }) {
    // Recalculate max each render so bars scale correctly
    maxValue = Math.max(...weeklyData.map(d => d.value))

    return (
        <View style={styles.shadowWrapper}>
            <View style={styles.card}>
                {/* Card header */}
                <View style={styles.headingRow}>
                    <Ionicons name="sparkles" size={22} color={colors.streakCard} />
                    <Text style={styles.title}>Activity This Week</Text>
                </View>

                {/* Render a Bar for each day */}
                <View style={styles.chart}>
                    {weeklyData.map(item => (
                        <Bar key={item.day} {...item} />
                    ))}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    shadowWrapper: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginVertical: spacing.sm,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    card: {
        backgroundColor: colors.background, // white
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.lg,
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    title: {
        ...typography.body,
        fontSize: 18,
        color: colors.textDark,
    },
    // Row that holds all the bars
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end', // bars grow upward from the bottom
        justifyContent: 'space-between',
        gap: 6,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    barBackground: {
        width: '100%',
        justifyContent: 'flex-end', // bar sits at the bottom of its container
    },
    // Black offset behind bar = hard shadow
    barShadow: {
        backgroundColor: colors.border,
        borderRadius: 8,
        transform: [{ translateX: 2 }, { translateY: 2 }],
    },
    bar: {
        borderRadius: 8,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        transform: [{ translateX: -2 }, { translateY: -2 }],
    },
    dayLabel: {
        ...typography.small,
        color: colors.textDark,
    },
})