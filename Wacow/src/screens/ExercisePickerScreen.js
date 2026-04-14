// Exercise Picker — lets user search and select exercises from Supabase
// Selected exercises get passed to the workout session
import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { colors, borders, spacing, typography } from '../style/theme'

// Muscle group filter buttons
const MUSCLE_GROUPS = [
    'All', 'Chest', 'Shoulder', 'Bicep', 'Tricep', 'Leg',
    'Back', 'Glute', 'Ab', 'Calves', 'Forearm', 'Neck', 'Cardio'
]

export default function ExercisePickerScreen({ onStartSession }) {
    const [exercises, setExercises] = useState([])
    const [search, setSearch] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('All')
    const [selectedExercises, setSelectedExercises] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch all preset workouts from Supabase on mount
    useEffect(() => {
        fetchExercises()
    }, [])

    const fetchExercises = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('is_preset', true)
            .order('type')
            .order('name')

        if (error) Alert.alert('Error', error.message)
        else setExercises(data)
        setLoading(false)
    }

    // Filter exercises by search and muscle group
    const filteredExercises = exercises.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = selectedFilter === 'All' || e.type === selectedFilter
        return matchesSearch && matchesFilter
    })

    // Toggle exercise selection
    const toggleExercise = (exercise) => {
        setSelectedExercises((prev) => {
            const exists = prev.find((e) => e.id === exercise.id)
            if (exists) return prev.filter((e) => e.id !== exercise.id)
            return [...prev, exercise]
        })
    }

    const isSelected = (id) => selectedExercises.some((e) => e.id === id)

    // Start session with selected exercises
    const handleStart = () => {
        if (selectedExercises.length === 0) {
            Alert.alert('No exercises', 'Select at least one exercise to start.')
            return
        }
        onStartSession(selectedExercises)
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Choose Exercises</Text>
                <Text style={styles.subtitle}>
                    {selectedExercises.length} selected
                </Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Muscle group filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContainer}
            >
                {MUSCLE_GROUPS.map((group) => (
                    <TouchableOpacity
                        key={group}
                        style={[
                            styles.filterBtn,
                            selectedFilter === group && styles.filterActive,
                        ]}
                        onPress={() => setSelectedFilter(group)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                selectedFilter === group && styles.filterTextActive,
                            ]}
                        >
                            {group}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Exercise list */}
            <ScrollView style={styles.list}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading exercises...</Text>
                ) : filteredExercises.length === 0 ? (
                    <Text style={styles.loadingText}>No exercises found</Text>
                ) : (
                    filteredExercises.map((exercise) => (
                        <TouchableOpacity
                            key={exercise.id}
                            style={[
                                styles.exerciseRow,
                                isSelected(exercise.id) && styles.exerciseRowSelected,
                            ]}
                            onPress={() => toggleExercise(exercise)}
                        >
                            <View style={styles.exerciseInfo}>
                                <Text
                                    style={[
                                        styles.exerciseName,
                                        isSelected(exercise.id) && styles.exerciseNameSelected,
                                    ]}
                                >
                                    {exercise.name}
                                </Text>
                                <Text style={styles.exerciseType}>{exercise.type}</Text>
                            </View>
                            <View
                                style={[
                                    styles.checkbox,
                                    isSelected(exercise.id) && styles.checkboxSelected,
                                ]}
                            >
                                {isSelected(exercise.id) && (
                                    <Ionicons name="checkmark" size={18} color={colors.textLight} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Start session button */}
            {selectedExercises.length > 0 && (
                <View style={styles.startShadow}>
                    <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                        <Text style={styles.startText}>
                            Start Session ({selectedExercises.length})
                        </Text>
                    </TouchableOpacity>
                </View>
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
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textDark,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textMuted,
        marginTop: 4,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        marginHorizontal: spacing.md,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: spacing.sm,
        fontSize: 16,
    },
    filterScroll: {
        maxHeight: 50,
        marginBottom: spacing.sm,
    },
    filterContainer: {
        paddingHorizontal: spacing.md,
        gap: 8,
    },
    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    filterActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontWeight: '700',
        fontSize: 13,
        color: colors.textDark,
    },
    filterTextActive: {
        color: colors.textLight,
    },
    list: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    loadingText: {
        textAlign: 'center',
        color: colors.textMuted,
        marginTop: spacing.lg,
        fontSize: 16,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    exerciseRowSelected: {
        backgroundColor: '#fdeaea',
        borderColor: colors.primary,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.textDark,
    },
    exerciseNameSelected: {
        color: colors.primary,
    },
    exerciseType: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
        marginTop: 2,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    startShadow: {
        backgroundColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        marginHorizontal: spacing.md,
        marginBottom: spacing.xl,
        transform: [{ translateX: 4 }, { translateY: 4 }],
    },
    startBtn: {
        backgroundColor: colors.primary,
        borderRadius: borders.standard.borderRadius,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        alignItems: 'center',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    startText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '900',
    },
})