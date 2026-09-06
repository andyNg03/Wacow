import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { borders, colors, shadows, spacing } from '../style/theme'

const FILTERS = [
    'All', 'Routine', 'Chest', 'Shoulder', 'Bicep', 'Tricep',
    'Leg', 'Back', 'Glute', 'Ab', 'Calves', 'Cardio',
]

const DUMMY_EXERCISES = [
    { id: 'bench-press', name: 'Bench Press', type: 'Chest' },
    { id: 'shoulder-press', name: 'Shoulder Press', type: 'Shoulder' },
    { id: 'chest-fly', name: 'Chest Fly', type: 'Chest' },
    { id: 'tricep-extension', name: 'Tricep Extension', type: 'Tricep' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', type: 'Back' },
    { id: 'seated-row', name: 'Seated Row', type: 'Back' },
    { id: 'bicep-curl', name: 'Bicep Curl', type: 'Bicep' },
    { id: 'barbell-squat', name: 'Barbell Squat', type: 'Leg' },
    { id: 'leg-press', name: 'Leg Press', type: 'Leg' },
    { id: 'leg-curl', name: 'Leg Curl', type: 'Leg' },
    { id: 'calf-raise', name: 'Calf Raise', type: 'Calves' },
    { id: 'plank', name: 'Plank', type: 'Ab' },
    { id: 'hip-thrust', name: 'Hip Thrust', type: 'Glute' },
    { id: 'treadmill-run', name: 'Treadmill Run', type: 'Cardio' },
]

const MUSCLE_FILTERS = [
    { value: 'Chest', label: 'Chest' },
    { value: 'Back', label: 'Back' },
    { value: 'Shoulder', label: 'Shoulders' },
    { value: 'Bicep', label: 'Biceps' },
    { value: 'Tricep', label: 'Triceps' },
    { value: 'Leg', label: 'Legs' },
    { value: 'Glute', label: 'Glutes' },
    { value: 'Ab', label: 'Abs' },
    { value: 'Calves', label: 'Calves' },
    { value: 'Cardio', label: 'Cardio' },
]

// Frontend-only stand-in for the signed-in user's account preference.
// The current profile setup records body weight in kilograms, so this mockup
// uses kg until the real account preference is wired in a later pass.
const ACCOUNT_WEIGHT_UNIT = 'kg'
const LONG_PRESS_MS = 350
let localSetSequence = 0

const createSet = (exerciseId, weight = '0', reps = '1', stableIndex = null) => ({
    id: stableIndex === null
        ? `${exerciseId}-set-local-${Date.now()}-${localSetSequence++}`
        : `${exerciseId}-set-${stableIndex + 1}`,
    weight: String(weight),
    reps: String(reps),
})

const valuesFor = (exerciseId, weight, reps, setCount) => ({
    ...DUMMY_EXERCISES.find((exercise) => exercise.id === exerciseId),
    sets: Array.from(
        { length: setCount },
        (_, index) => createSet(exerciseId, weight, reps, index),
    ),
})

const INITIAL_ROUTINES = [
    {
        id: 'routine-push',
        name: 'Push Day',
        exercises: [
            valuesFor('bench-press', 135, 10, 4),
            valuesFor('shoulder-press', 60, 12, 3),
            valuesFor('chest-fly', 80, 12, 3),
            valuesFor('tricep-extension', 45, 12, 3),
        ],
    },
    {
        id: 'routine-pull',
        name: 'Pull Day',
        exercises: [
            valuesFor('lat-pulldown', 120, 10, 4),
            valuesFor('seated-row', 110, 10, 4),
            valuesFor('bicep-curl', 30, 12, 3),
        ],
    },
    {
        id: 'routine-legs',
        name: 'Leg Day',
        exercises: [
            valuesFor('barbell-squat', 185, 8, 4),
            valuesFor('leg-press', 270, 10, 4),
            valuesFor('leg-curl', 90, 12, 3),
            valuesFor('calf-raise', 100, 15, 3),
        ],
    },
]

const DUMMY_HISTORY = [
    {
        id: 'history-sep-03',
        date: 'September 3, 2026',
        duration: '48 min',
        exercises: INITIAL_ROUTINES[0].exercises,
    },
    {
        id: 'history-sep-01',
        date: 'September 1, 2026',
        duration: '42 min',
        exercises: INITIAL_ROUTINES[1].exercises,
    },
    {
        id: 'history-aug-29',
        date: 'August 29, 2026',
        duration: '55 min',
        exercises: INITIAL_ROUTINES[2].exercises,
    },
]

const CARD_COLORS = [
    { bg: colors.primary, text: colors.textLight },
    { bg: colors.streakCard, text: colors.textDark },
    { bg: colors.background, text: colors.textDark },
]

const cloneExercises = (exercises) => exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({ ...set })),
}))

const countSets = (exercises) => (
    exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
)

export default function WorkoutPresetMockupScreen({ navigation }) {
    const [page, setPage] = useState('home')
    const [selectedFilter, setSelectedFilter] = useState('All')
    const [search, setSearch] = useState('')
    const [selectedExerciseIds, setSelectedExerciseIds] = useState([])
    const [routines, setRoutines] = useState(INITIAL_ROUTINES)
    const [editor, setEditor] = useState(null)
    const [addSelection, setAddSelection] = useState([])
    const [activeWorkout, setActiveWorkout] = useState(null)
    const [completedSetIds, setCompletedSetIds] = useState([])

    useEffect(() => {
        const hideTabs = ['editor', 'add-exercise', 'history', 'results'].includes(page)
        navigation.setOptions({
            tabBarStyle: hideTabs
                ? { display: 'none' }
                : { borderTopWidth: 2, borderTopColor: colors.border },
        })

        return () => navigation.setOptions({
            tabBarStyle: { borderTopWidth: 2, borderTopColor: colors.border },
        })
    }, [navigation, page])

    const startWorkout = (name, exercises) => {
        setActiveWorkout({ name, exercises: cloneExercises(exercises) })
        setCompletedSetIds([])
        setPage('active')
    }

    const startManualWorkout = () => {
        const exercises = DUMMY_EXERCISES
            .filter((exercise) => selectedExerciseIds.includes(exercise.id))
            .map((exercise) => ({
                ...exercise,
                sets: [createSet(exercise.id)],
            }))
        startWorkout('Custom Workout', exercises)
    }

    const openNewRoutine = () => {
        setEditor({ id: null, name: '', exercises: [] })
        setPage('editor')
    }

    const openRoutineFromHistory = (historyWorkout) => {
        setEditor({ id: null, name: '', exercises: cloneExercises(historyWorkout.exercises) })
        setPage('editor')
    }

    const openEditRoutine = (routine) => {
        setEditor({ ...routine, exercises: cloneExercises(routine.exercises) })
        setPage('editor')
    }

    const saveRoutine = () => {
        if (!editor?.name.trim() || editor.exercises.length === 0) return

        const nextRoutine = {
            ...editor,
            id: editor.id ?? `routine-${Date.now()}`,
            name: editor.name.trim(),
            exercises: cloneExercises(editor.exercises),
        }

        setRoutines((current) => {
            if (editor.id) {
                return current.map((routine) => routine.id === editor.id ? nextRoutine : routine)
            }
            return [nextRoutine, ...current]
        })
        setEditor(null)
        setSelectedFilter('Routine')
        setSearch('')
        setPage('home')
    }

    const deleteRoutine = (routineId) => {
        setRoutines((current) => current.filter((routine) => routine.id !== routineId))
        setEditor(null)
        setSelectedFilter('Routine')
        setSearch('')
        setPage('home')
    }

    const openAddExercise = () => {
        setAddSelection(editor.exercises.map((exercise) => exercise.id))
        setSearch('')
        setPage('add-exercise')
    }

    const finishAddingExercises = () => {
        const currentById = new Map(editor.exercises.map((exercise) => [exercise.id, exercise]))
        const nextExercises = addSelection.map((id) => (
            currentById.get(id) ?? {
                ...DUMMY_EXERCISES.find((exercise) => exercise.id === id),
                sets: [createSet(id)],
            }
        ))
        setEditor((current) => ({ ...current, exercises: nextExercises }))
        setSearch('')
        setPage('editor')
    }

    const moveEditorExercise = (fromIndex, toIndex) => {
        setEditor((current) => {
            if (
                fromIndex === toIndex
                || fromIndex < 0
                || toIndex < 0
                || fromIndex >= current.exercises.length
                || toIndex >= current.exercises.length
            ) return current

            const exercises = [...current.exercises]
            const [moved] = exercises.splice(fromIndex, 1)
            exercises.splice(toIndex, 0, moved)
            return { ...current, exercises }
        })
    }

    const updateEditorSet = (exerciseId, setId, key, value) => {
        const cleaned = value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
        setEditor((current) => ({
            ...current,
            exercises: current.exercises.map((exercise) => (
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set) => (
                            set.id === setId ? { ...set, [key]: cleaned } : set
                        )),
                    }
                    : exercise
            )),
        }))
    }

    const addEditorSet = (exerciseId) => {
        setEditor((current) => ({
            ...current,
            exercises: current.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise
                const previous = exercise.sets[exercise.sets.length - 1]
                return {
                    ...exercise,
                    sets: [
                        ...exercise.sets,
                        createSet(exercise.id, previous?.weight ?? '0', previous?.reps ?? '1'),
                    ],
                }
            }),
        }))
    }

    const removeEditorSet = (exerciseId, setId) => {
        setEditor((current) => ({
            ...current,
            exercises: current.exercises.map((exercise) => (
                exercise.id === exerciseId
                    ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
                    : exercise
            )),
        }))
    }

    const removeEditorExercise = (exerciseId) => {
        setEditor((current) => ({
            ...current,
            exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId),
        }))
    }

    const updateActiveSet = (exerciseId, setId, key, value) => {
        const cleaned = value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
        setActiveWorkout((current) => ({
            ...current,
            exercises: current.exercises.map((exercise) => (
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set) => (
                            set.id === setId ? { ...set, [key]: cleaned } : set
                        )),
                    }
                    : exercise
            )),
        }))
    }

    const addActiveSet = (exerciseId) => {
        setActiveWorkout((current) => ({
            ...current,
            exercises: current.exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise
                const previous = exercise.sets[exercise.sets.length - 1]
                return {
                    ...exercise,
                    sets: [
                        ...exercise.sets,
                        createSet(exercise.id, previous?.weight ?? '0', previous?.reps ?? '1'),
                    ],
                }
            }),
        }))
    }

    const cancelToHome = () => {
        setEditor(null)
        setSearch('')
        setPage('home')
    }

    if (page === 'editor') {
        return (
            <RoutineEditor
                editor={editor}
                onCancel={cancelToHome}
                onChangeName={(name) => setEditor((current) => ({ ...current, name }))}
                onAddExercise={openAddExercise}
                onMoveExercise={moveEditorExercise}
                onRemoveExercise={removeEditorExercise}
                onUpdateSet={updateEditorSet}
                onAddSet={addEditorSet}
                onRemoveSet={removeEditorSet}
                onDeleteRoutine={deleteRoutine}
                onSave={saveRoutine}
                weightUnit={ACCOUNT_WEIGHT_UNIT}
            />
        )
    }

    if (page === 'add-exercise') {
        return (
            <AddExerciseScreen
                selectedIds={addSelection}
                search={search}
                onChangeSearch={setSearch}
                onCancel={() => setPage('editor')}
                onToggle={(id) => setAddSelection((current) => (
                    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                ))}
                onDone={finishAddingExercises}
            />
        )
    }

    if (page === 'history') {
        return (
            <HistoryScreen
                onCancel={cancelToHome}
                onUseWorkout={openRoutineFromHistory}
            />
        )
    }

    if (page === 'active') {
        return (
            <ActiveWorkoutScreen
                workout={activeWorkout}
                completedSetIds={completedSetIds}
                onToggleSetComplete={(id) => setCompletedSetIds((current) => (
                    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                ))}
                onUpdateSet={updateActiveSet}
                onAddSet={addActiveSet}
                onEnd={() => setPage('results')}
                weightUnit={ACCOUNT_WEIGHT_UNIT}
            />
        )
    }

    if (page === 'results') {
        return (
            <ResultsScreen
                workout={activeWorkout}
                completedSetIds={completedSetIds}
                onResume={() => setPage('active')}
                onFinish={() => {
                    setActiveWorkout(null)
                    setCompletedSetIds([])
                    setSelectedExerciseIds([])
                    setSelectedFilter('Routine')
                    setPage('home')
                }}
                weightUnit={ACCOUNT_WEIGHT_UNIT}
            />
        )
    }

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.homeContent} keyboardShouldPersistTaps="handled">
                <View style={styles.heroRow}>
                    <View>
                        <Text style={styles.pageTitle}>Choose Exercises</Text>
                        <Text style={styles.pageSubtitle}>
                            {selectedFilter === 'Routine'
                                ? `${routines.length} saved routines`
                                : `${selectedExerciseIds.length} selected`
                            }
                        </Text>
                    </View>
                    <Ionicons name="barbell" size={26} color={colors.primary} />
                </View>

                <SearchBox
                    value={search}
                    onChangeText={setSearch}
                    placeholder={selectedFilter === 'Routine' ? 'Search routines...' : 'Search exercises...'}
                />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {FILTERS.map((filter) => (
                        <FilterChip
                            key={filter}
                            label={filter}
                            selected={selectedFilter === filter}
                            onPress={() => {
                                setSelectedFilter(filter)
                                setSearch('')
                            }}
                        />
                    ))}
                </ScrollView>

                {selectedFilter === 'Routine' ? (
                    <RoutineLibrary
                        routines={routines}
                        search={search}
                        onNew={openNewRoutine}
                        onHistory={() => {
                            setSearch('')
                            setPage('history')
                        }}
                        onStart={(routine) => startWorkout(routine.name, routine.exercises)}
                        onEdit={openEditRoutine}
                    />
                ) : (
                    <ExerciseLibrary
                        selectedFilter={selectedFilter}
                        selectedIds={selectedExerciseIds}
                        search={search}
                        onToggle={(id) => setSelectedExerciseIds((current) => (
                            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                        ))}
                    />
                )}
            </ScrollView>

            {selectedFilter !== 'Routine' && selectedExerciseIds.length > 0 && (
                <View style={styles.stickyAction}>
                    <PrimaryButton
                        label={`Start Session (${selectedExerciseIds.length})`}
                        onPress={startManualWorkout}
                    />
                </View>
            )}

        </View>
    )
}

function ExerciseLibrary({ selectedFilter, selectedIds, search, onToggle }) {
    const exercises = useMemo(() => DUMMY_EXERCISES.filter((exercise) => {
        const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = selectedFilter === 'All' || exercise.type === selectedFilter
        return matchesSearch && matchesFilter
    }), [search, selectedFilter])

    if (exercises.length === 0) {
        return <EmptyState icon="search" title="No exercises found" body="Try another search or muscle group." compact />
    }

    return (
        <View style={styles.listGap}>
            {exercises.map((exercise) => {
                const selected = selectedIds.includes(exercise.id)
                return (
                    <TouchableOpacity
                        key={exercise.id}
                        style={[styles.exerciseRow, selected && styles.exerciseRowSelected]}
                        onPress={() => onToggle(exercise.id)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.exerciseIcon}>
                            <Ionicons name="barbell" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseType}>{exercise.type}</Text>
                        </View>
                        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                            {selected && <Ionicons name="checkmark" size={18} color={colors.textLight} />}
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

function RoutineLibrary({ routines, search, onNew, onHistory, onStart, onEdit }) {
    const filtered = useMemo(() => routines.filter((routine) => {
        const query = search.toLowerCase()
        return routine.name.toLowerCase().includes(query)
            || routine.exercises.some((exercise) => exercise.name.toLowerCase().includes(query))
    }), [routines, search])

    return (
        <View>
            <View style={styles.actionGrid}>
                <ActionTile icon="clipboard-outline" label="New Routine" onPress={onNew} />
                <ActionTile icon="time-outline" label="From History" onPress={onHistory} />
            </View>

            <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>My Routines</Text>
                <Text style={styles.sectionCount}>{filtered.length} routines</Text>
            </View>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={routines.length === 0 ? 'barbell-outline' : 'search'}
                    title={routines.length === 0 ? 'No routines yet' : 'No routines found'}
                    body={routines.length === 0
                        ? 'Create a routine or copy one from your workout history.'
                        : 'Try searching for another routine or exercise.'
                    }
                />
            ) : (
                <View style={styles.listGap}>
                    {filtered.map((routine) => (
                        <View key={routine.id} style={styles.routineCard}>
                            <TouchableOpacity
                                style={styles.routineCardBody}
                                onPress={() => onEdit(routine)}
                                activeOpacity={0.78}
                                accessibilityRole="button"
                                accessibilityLabel={`Edit ${routine.name}`}
                            >
                                <View style={styles.routineTitleRow}>
                                    <Text style={styles.routineName}>{routine.name}</Text>
                                    <View style={styles.editRoutineHint}>
                                        <Ionicons name="pencil" size={14} color={colors.primary} />
                                        <Text style={styles.editRoutineHintText}>Edit</Text>
                                    </View>
                                </View>
                                <Text style={styles.routineSummary} numberOfLines={2}>
                                    {routine.exercises.map((exercise) => exercise.name).join(', ')}
                                </Text>
                                <Text style={styles.routineMeta}>
                                    {routine.exercises.length} exercises • {countSets(routine.exercises)} sets
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.routineStartArea}>
                                <PrimaryButton label="Start Workout" onPress={() => onStart(routine)} compact />
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}

function RoutineEditor({
    editor,
    onCancel,
    onChangeName,
    onAddExercise,
    onMoveExercise,
    onRemoveExercise,
    onUpdateSet,
    onAddSet,
    onRemoveSet,
    onDeleteRoutine,
    onSave,
    weightUnit,
}) {
    const [draggingExerciseId, setDraggingExerciseId] = useState(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const cardLayouts = useRef({})

    const canSave = !!editor.name.trim()
        && editor.exercises.length > 0
        && editor.exercises.every((exercise) => (
            exercise.sets.length > 0
            && exercise.sets.every((set) => Number(set.reps) > 0)
        ))

    const finishDrag = (exerciseId, fromIndex, dragDistance) => {
        const draggedLayout = cardLayouts.current[exerciseId]
        let targetIndex = fromIndex

        if (draggedLayout) {
            const draggedCenter = draggedLayout.y + (draggedLayout.height / 2) + dragDistance
            let closestDistance = Number.POSITIVE_INFINITY

            editor.exercises.forEach((exercise, index) => {
                const layout = cardLayouts.current[exercise.id]
                if (!layout) return
                const distance = Math.abs(draggedCenter - (layout.y + (layout.height / 2)))
                if (distance < closestDistance) {
                    closestDistance = distance
                    targetIndex = index
                }
            })
        }

        if (targetIndex !== fromIndex) {
            onMoveExercise(fromIndex, targetIndex)
            if (Platform.OS !== 'web') Vibration.vibrate(8)
        }
        setDraggingExerciseId(null)
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.pageContent}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={!draggingExerciseId}
            >
                <TopBar
                    title={editor.id ? 'Edit Routine' : 'Create Routine'}
                    leftLabel="Cancel"
                    onLeft={onCancel}
                    rightLabel="Save"
                    onRight={onSave}
                    rightDisabled={!canSave}
                />

                <Text style={styles.fieldLabel}>Routine name</Text>
                <TextInput
                    value={editor.name}
                    onChangeText={onChangeName}
                    placeholder="Example: Push Day"
                    placeholderTextColor={colors.textMuted}
                    style={styles.nameInput}
                    maxLength={60}
                />

                <View style={styles.editorHelperRow}>
                    <Ionicons name="reorder-three" size={23} color={colors.primary} />
                    <Text style={styles.editorHelperText}>
                        Hold and drag anywhere on an exercise card to reorder it.
                    </Text>
                </View>

                {editor.exercises.length === 0 ? (
                    <EmptyState
                        icon="barbell-outline"
                        title="Build your routine"
                        body="Get started by adding an exercise to your routine."
                    />
                ) : (
                    <View style={styles.editorList}>
                        {editor.exercises.map((exercise, index) => (
                            <DraggableExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                index={index}
                                weightUnit={weightUnit}
                                dragging={draggingExerciseId === exercise.id}
                                onLayout={(layout) => { cardLayouts.current[exercise.id] = layout }}
                                onDragStart={() => setDraggingExerciseId(exercise.id)}
                                onDragEnd={(dragDistance) => finishDrag(exercise.id, index, dragDistance)}
                                onDragCancel={() => setDraggingExerciseId(null)}
                                onRemoveExercise={() => onRemoveExercise(exercise.id)}
                                onUpdateSet={(setId, key, value) => onUpdateSet(exercise.id, setId, key, value)}
                                onAddSet={() => onAddSet(exercise.id)}
                                onRemoveSet={(setId) => onRemoveSet(exercise.id, setId)}
                            />
                        ))}
                    </View>
                )}

                <View style={styles.bottomActionSpacing}>
                    <PrimaryButton label="+ Add Exercise" onPress={onAddExercise} />
                </View>

                {editor.id && (
                    <TouchableOpacity
                        style={styles.deleteRoutineLink}
                        onPress={() => setConfirmingDelete(true)}
                    >
                        <Ionicons name="trash-outline" size={19} color={colors.destructive} />
                        <Text style={styles.deleteRoutineLinkText}>Delete Routine</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <DeleteRoutineModal
                visible={confirmingDelete}
                routineName={editor.name}
                onCancel={() => setConfirmingDelete(false)}
                onDelete={() => onDeleteRoutine(editor.id)}
            />
        </KeyboardAvoidingView>
    )
}

function AddExerciseScreen({ selectedIds, search, onChangeSearch, onCancel, onToggle, onDone }) {
    const [selectedMuscles, setSelectedMuscles] = useState([])
    const filtered = DUMMY_EXERCISES.filter((exercise) => {
        const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase())
        const matchesMuscle = selectedMuscles.length === 0 || selectedMuscles.includes(exercise.type)
        return matchesSearch && matchesMuscle
    })

    const toggleMuscle = (muscle) => {
        setSelectedMuscles((current) => (
            current.includes(muscle)
                ? current.filter((item) => item !== muscle)
                : [...current, muscle]
        ))
    }

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
                <TopBar
                    title="Add Exercise"
                    leftLabel="Cancel"
                    onLeft={onCancel}
                    rightLabel={`Add (${selectedIds.length})`}
                    onRight={onDone}
                    rightDisabled={selectedIds.length === 0}
                />
                <SearchBox value={search} onChangeText={onChangeSearch} placeholder="Search exercises..." />

                <View style={styles.muscleFilterHeading}>
                    <Text style={styles.libraryLabel}>Muscle Groups</Text>
                    <Text style={styles.muscleFilterCount}>
                        {selectedMuscles.length === 0 ? 'All selected' : `${selectedMuscles.length} selected`}
                    </Text>
                </View>
                <View style={styles.muscleFilterGrid}>
                    <FilterChip
                        label="All"
                        selected={selectedMuscles.length === 0}
                        onPress={() => setSelectedMuscles([])}
                    />
                    {MUSCLE_FILTERS.map((muscle) => (
                        <FilterChip
                            key={muscle.value}
                            label={muscle.label}
                            selected={selectedMuscles.includes(muscle.value)}
                            onPress={() => toggleMuscle(muscle.value)}
                        />
                    ))}
                </View>

                <View style={styles.exerciseLibraryHeading}>
                    <Text style={styles.libraryLabel}>Exercise Library</Text>
                    <Text style={styles.muscleFilterCount}>{filtered.length} results</Text>
                </View>
                {filtered.length === 0 ? (
                    <EmptyState
                        icon="search"
                        title="No exercises found"
                        body="Try another search or change your muscle groups."
                        compact
                    />
                ) : (
                    <View>
                        {filtered.map((exercise) => {
                            const selected = selectedIds.includes(exercise.id)
                            return (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={styles.libraryRow}
                                    onPress={() => onToggle(exercise.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.libraryIcon}>
                                        <Ionicons name="barbell" size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.flexOne}>
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                                        <Text style={styles.exerciseType}>{exercise.type}</Text>
                                    </View>
                                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                        {selected && <Ionicons name="checkmark" size={18} color={colors.textLight} />}
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

function HistoryScreen({ onCancel, onUseWorkout }) {
    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.pageContent}>
                <TopBar title="From History" leftLabel="Cancel" onLeft={onCancel} />
                <Text style={styles.historyIntro}>
                    Choose a completed workout. Its exercises, sets, reps, and weight will be copied into a new routine.
                </Text>
                <View style={styles.listGap}>
                    {DUMMY_HISTORY.map((workout) => (
                        <View key={workout.id} style={styles.historyCard}>
                            <View style={styles.historyTopRow}>
                                <Text style={styles.historyDate}>{workout.date}</Text>
                                <View style={styles.durationPill}>
                                    <Text style={styles.durationText}>{workout.duration}</Text>
                                </View>
                            </View>
                            <Text style={styles.historyExercises}>
                                {workout.exercises.map((exercise) => exercise.name).join(', ')}
                            </Text>
                            <Text style={styles.historyMeta}>
                                {workout.exercises.length} exercises  •  {countSets(workout.exercises)} total sets
                            </Text>
                            <PrimaryButton
                                label="Use This Workout"
                                onPress={() => onUseWorkout(workout)}
                                compact
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}

function ActiveWorkoutScreen({
    workout,
    completedSetIds,
    onToggleSetComplete,
    onUpdateSet,
    onAddSet,
    onEnd,
    weightUnit,
}) {
    const totalSets = countSets(workout.exercises)
    const progress = totalSets
        ? (completedSetIds.length / totalSets) * 100
        : 0

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
                <View style={styles.activeLabelRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={styles.activeLabel}>TODAY'S ROUTINE</Text>
                </View>
                <Text style={styles.activeTitle}>{workout.name}</Text>
                <Text style={styles.accountUnitText}>Account weight unit: {weightUnit}</Text>

                <View style={styles.timerCard}>
                    <View style={styles.timerLabelRow}>
                        <Ionicons name="stopwatch-outline" size={20} color={colors.primary} />
                        <Text style={styles.timerLabel}>Session Timer</Text>
                    </View>
                    <Text style={styles.timerValue}>00:12:48</Text>
                </View>

                <View style={styles.activeList}>
                    {workout.exercises.map((exercise, index) => {
                        const cardColor = CARD_COLORS[index % CARD_COLORS.length]
                        const valueBackground = cardColor.text === colors.textLight
                            ? colors.achievementCard
                            : colors.primaryLight

                        return (
                            <View
                                key={exercise.id}
                                style={[styles.activeCard, { backgroundColor: cardColor.bg }]}
                            >
                                <Text style={[styles.activeExerciseName, { color: cardColor.text }]}>
                                    {exercise.name}
                                </Text>
                                <Text style={[styles.activeHint, { color: cardColor.text }]}>
                                    Complete each set with its checkbox
                                </Text>

                                <View style={styles.activeSetHeader}>
                                    <Text style={[styles.activeSetHeaderNumber, { color: cardColor.text }]}>SET</Text>
                                    <Text style={[styles.activeSetHeaderValue, { color: cardColor.text }]}>WEIGHT ({weightUnit.toUpperCase()})</Text>
                                    <Text style={[styles.activeSetHeaderValue, { color: cardColor.text }]}>REPS</Text>
                                    <Text style={[styles.activeSetHeaderDone, { color: cardColor.text }]}>DONE</Text>
                                </View>

                                {exercise.sets.map((set, setIndex) => {
                                    const completed = completedSetIds.includes(set.id)
                                    return (
                                        <View
                                            key={set.id}
                                            style={[
                                                styles.activeSetRow,
                                                { backgroundColor: valueBackground },
                                                completed && styles.activeSetRowCompleted,
                                            ]}
                                        >
                                            <Text style={[styles.activeSetNumber, { color: cardColor.text }]}>
                                                {setIndex + 1}
                                            </Text>
                                            <SetTextInput
                                                value={set.weight}
                                                onChangeText={(value) => onUpdateSet(exercise.id, set.id, 'weight', value)}
                                                textColor={cardColor.text}
                                                backgroundColor={valueBackground}
                                                maxLength={4}
                                                accessibilityLabel={`${exercise.name} set ${setIndex + 1} weight`}
                                            />
                                            <SetTextInput
                                                value={set.reps}
                                                onChangeText={(value) => onUpdateSet(exercise.id, set.id, 'reps', value)}
                                                textColor={cardColor.text}
                                                backgroundColor={valueBackground}
                                                maxLength={3}
                                                accessibilityLabel={`${exercise.name} set ${setIndex + 1} reps`}
                                            />
                                            <TouchableOpacity
                                                style={[
                                                    styles.setCompleteCheckbox,
                                                    completed && styles.setCompleteCheckboxSelected,
                                                ]}
                                                onPress={() => {
                                                    if (Number(set.reps) > 0) onToggleSetComplete(set.id)
                                                }}
                                                accessibilityRole="checkbox"
                                                accessibilityState={{ checked: completed }}
                                                accessibilityLabel={`${exercise.name} set ${setIndex + 1} complete`}
                                            >
                                                {completed && (
                                                    <Ionicons name="checkmark" size={18} color={colors.textLight} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )
                                })}

                                <TouchableOpacity
                                    style={[styles.activeAddSetButton, { backgroundColor: valueBackground }]}
                                    onPress={() => onAddSet(exercise.id)}
                                >
                                    <Ionicons name="add" size={18} color={cardColor.text} />
                                    <Text style={[styles.activeAddSetText, { color: cardColor.text }]}>Add Set</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    })}
                </View>

                <View style={styles.progressHeading}>
                    <Text style={styles.progressText}>Progress</Text>
                    <Text style={styles.progressText}>{completedSetIds.length} / {totalSets} sets</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>

                <View style={styles.bottomActionSpacing}>
                    <PrimaryButton label="End Session" onPress={onEnd} />
                </View>
            </ScrollView>
        </View>
    )
}

function ResultsScreen({ workout, completedSetIds, onResume, onFinish, weightUnit }) {
    const totalSets = countSets(workout.exercises)
    const completedExercises = workout.exercises
        .map((exercise) => ({
            ...exercise,
            sets: exercise.sets
                .map((set, index) => ({ ...set, setNumber: index + 1 }))
                .filter((set) => completedSetIds.includes(set.id)),
        }))
        .filter((exercise) => exercise.sets.length > 0)

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.resultsContent}>
                <View style={styles.resultsIcon}>
                    <Ionicons name="trophy" size={42} color={colors.textLight} />
                </View>
                <Text style={styles.resultsTitle}>Workout Summary</Text>
                <Text style={styles.resultsSubtitle}>{workout.name} • September 4, 2026</Text>

                <View style={styles.resultsCard}>
                    <ResultStat value="48 min" label="DURATION" />
                    <ResultStat value={`${completedSetIds.length}/${totalSets}`} label="SETS DONE" />
                    <ResultStat
                        value={String(completedExercises.length)}
                        label="EXERCISES"
                    />
                </View>

                <View style={styles.resultsList}>
                    {completedExercises.map((exercise) => (
                        <View key={exercise.id} style={styles.resultRow}>
                            <View style={styles.resultCheck}>
                                <Ionicons name="checkmark" size={17} color={colors.textLight} />
                            </View>
                            <View style={styles.flexOne}>
                                <Text style={styles.resultExerciseName}>{exercise.name}</Text>
                                {exercise.sets.map((set) => (
                                    <Text key={set.id} style={styles.resultExerciseValues}>
                                        Set {set.setNumber}: {set.weight} {weightUnit} × {set.reps} reps
                                    </Text>
                                ))}
                            </View>
                        </View>
                    ))}
                    {completedExercises.length === 0 && (
                        <Text style={styles.noCompletedText}>No sets completed yet.</Text>
                    )}
                </View>

                <PrimaryButton label="Finish Workout" onPress={onFinish} />
                <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
                    <Text style={styles.resumeText}>Continue Session</Text>
                </TouchableOpacity>
                <Text style={styles.localOnlyNote}>Mockup only — nothing will be saved.</Text>
            </ScrollView>
        </View>
    )
}

function DraggableExerciseCard({
    exercise,
    index,
    weightUnit,
    dragging,
    onLayout,
    onDragStart,
    onDragEnd,
    onDragCancel,
    onRemoveExercise,
    onUpdateSet,
    onAddSet,
    onRemoveSet,
}) {
    const translateY = useRef(new Animated.Value(0)).current
    const touchStartedAt = useRef(0)
    const callbacks = useRef({ onDragStart, onDragEnd, onDragCancel })
    callbacks.current = { onDragStart, onDragEnd, onDragCancel }

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
            touchStartedAt.current = Date.now()
            return false
        },
        onMoveShouldSetPanResponderCapture: (_event, gesture) => (
            Date.now() - touchStartedAt.current >= LONG_PRESS_MS
            && Math.max(Math.abs(gesture.dy), Math.abs(gesture.dx)) >= 3
        ),
        onMoveShouldSetPanResponder: (_event, gesture) => (
            Date.now() - touchStartedAt.current >= LONG_PRESS_MS
            && Math.max(Math.abs(gesture.dy), Math.abs(gesture.dx)) >= 3
        ),
        onPanResponderGrant: () => {
            translateY.setValue(0)
            callbacks.current.onDragStart()
            if (Platform.OS !== 'web') Vibration.vibrate(10)
        },
        onPanResponderMove: (_event, gesture) => {
            translateY.setValue(gesture.dy)
        },
        onPanResponderRelease: (_event, gesture) => {
            translateY.setValue(0)
            callbacks.current.onDragEnd(gesture.dy)
        },
        onPanResponderTerminate: () => {
            translateY.setValue(0)
            callbacks.current.onDragCancel()
        },
        onPanResponderTerminationRequest: () => false,
    })).current

    return (
        <Animated.View
            style={[
                styles.editorCard,
                dragging && styles.editorCardDragging,
                { transform: [{ translateY }] },
            ]}
            onLayout={(event) => onLayout(event.nativeEvent.layout)}
            accessibilityLabel={`${exercise.name}, position ${index + 1}. Hold and drag to reorder.`}
            {...panResponder.panHandlers}
        >
            <View style={styles.editorCardHeader}>
                <Ionicons name="reorder-three" size={28} color={colors.primary} />
                <View style={styles.flexOne}>
                    <Text style={styles.editorExerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseType}>{exercise.type}</Text>
                </View>
                <SmallIconButton
                    icon="trash-outline"
                    destructive
                    onPress={onRemoveExercise}
                    label={`Remove ${exercise.name}`}
                />
            </View>

            <View style={styles.setTableHeader}>
                <Text style={styles.setHeaderNumber}>SET</Text>
                <Text style={styles.setHeaderValue}>WEIGHT ({weightUnit.toUpperCase()})</Text>
                <Text style={styles.setHeaderValue}>REPS</Text>
                <View style={styles.setHeaderAction} />
            </View>

            {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.editorSetRow}>
                    <Text style={styles.editorSetNumber}>{setIndex + 1}</Text>
                    <SetTextInput
                        value={set.weight}
                        onChangeText={(value) => onUpdateSet(set.id, 'weight', value)}
                        maxLength={4}
                        accessibilityLabel={`${exercise.name} set ${setIndex + 1} weight`}
                    />
                    <SetTextInput
                        value={set.reps}
                        onChangeText={(value) => onUpdateSet(set.id, 'reps', value)}
                        maxLength={3}
                        accessibilityLabel={`${exercise.name} set ${setIndex + 1} reps`}
                    />
                    <SmallIconButton
                        icon="close-circle-outline"
                        destructive
                        onPress={() => onRemoveSet(set.id)}
                        label={`Remove set ${setIndex + 1} from ${exercise.name}`}
                    />
                </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.addSetButtonText}>Add Set</Text>
            </TouchableOpacity>
        </Animated.View>
    )
}

function DeleteRoutineModal({ visible, routineName, onCancel, onDelete }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.modalRoot}>
                <TouchableOpacity style={styles.modalScrim} onPress={onCancel} activeOpacity={1} />
                <View style={styles.menuSheet}>
                    <View style={styles.deleteIconCircle}>
                        <Ionicons name="trash-outline" size={26} color={colors.destructive} />
                    </View>
                    <Text style={styles.menuTitle}>Delete {routineName}?</Text>
                    <Text style={styles.menuDescription}>
                        This removes only the local dummy routine. Workout history stays unchanged.
                    </Text>
                    <TouchableOpacity style={styles.destructiveButton} onPress={onDelete}>
                        <Text style={styles.destructiveButtonText}>Delete Routine</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton} onPress={onCancel}>
                        <Ionicons name="close" size={20} color={colors.textDark} />
                        <Text style={styles.menuButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

function TopBar({ title, leftLabel, onLeft, rightLabel, onRight, rightDisabled }) {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBarButton} onPress={onLeft}>
                <Text style={styles.topBarButtonText}>{leftLabel}</Text>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>{title}</Text>
            {rightLabel ? (
                <TouchableOpacity
                    style={[styles.topBarButton, styles.topBarSave, rightDisabled && styles.topBarDisabled]}
                    onPress={onRight}
                    disabled={rightDisabled}
                >
                    <Text style={[styles.topBarButtonText, styles.topBarSaveText, rightDisabled && styles.disabledText]}>
                        {rightLabel}
                    </Text>
                </TouchableOpacity>
            ) : <View style={styles.topBarSpacer} />}
        </View>
    )
}

function SearchBox({ value, onChangeText, placeholder }) {
    return (
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
                style={styles.searchInput}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} accessibilityLabel="Clear search">
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    )
}

function FilterChip({ label, selected, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.filterChip, selected && styles.filterChipSelected]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label} filter`}
        >
            <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}

function ActionTile({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.actionTile} onPress={onPress} activeOpacity={0.85}>
            <Ionicons name={icon} size={25} color={colors.primary} />
            <Text style={styles.actionTileText}>{label}</Text>
        </TouchableOpacity>
    )
}

function PrimaryButton({ label, onPress, compact }) {
    return (
        <TouchableOpacity
            style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
            onPress={onPress}
            activeOpacity={0.86}
        >
            <Text style={styles.primaryButtonText}>{label}</Text>
        </TouchableOpacity>
    )
}

function SmallIconButton({ icon, onPress, label, disabled, destructive }) {
    return (
        <TouchableOpacity
            style={[styles.smallIconButton, disabled && styles.smallIconDisabled]}
            onPress={onPress}
            disabled={disabled}
            accessibilityLabel={label}
        >
            <Ionicons
                name={icon}
                size={18}
                color={destructive ? colors.destructive : colors.textDark}
            />
        </TouchableOpacity>
    )
}

function SetTextInput({
    value,
    onChangeText,
    maxLength,
    textColor = colors.textDark,
    backgroundColor = colors.background,
    accessibilityLabel,
}) {
    return (
        <TextInput
            style={[styles.setTextInput, { color: textColor, backgroundColor }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType="number-pad"
            maxLength={maxLength}
            selectTextOnFocus
            accessibilityLabel={accessibilityLabel}
        />
    )
}

function EmptyState({ icon, title, body, compact }) {
    return (
        <View style={[styles.emptyState, compact && styles.emptyStateCompact]}>
            <View style={styles.emptyIcon}>
                <Ionicons name={icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptyBody}>{body}</Text>
        </View>
    )
}

function ResultStat({ value, label }) {
    return (
        <View style={styles.resultStat}>
            <Text style={styles.resultStatValue}>{value}</Text>
            <Text style={styles.resultStatLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.backgroundTint,
    },
    homeContent: {
        paddingHorizontal: spacing.md,
        paddingTop: 58,
        paddingBottom: 110,
    },
    pageContent: {
        paddingHorizontal: spacing.md,
        paddingTop: 58,
        paddingBottom: spacing.xl,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textDark,
    },
    pageSubtitle: {
        marginTop: spacing.xs,
        fontSize: 14,
        fontWeight: '800',
        color: colors.textMuted,
    },
    searchBox: {
        minHeight: 52,
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    searchInput: {
        flex: 1,
        minHeight: 44,
        paddingVertical: spacing.sm,
        color: colors.textDark,
        fontSize: 16,
        fontWeight: '700',
    },
    filterRow: {
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: 9,
        backgroundColor: colors.background,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        borderRadius: 999,
    },
    filterChipSelected: {
        backgroundColor: colors.primary,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '900',
        color: colors.textDark,
    },
    filterChipTextSelected: {
        color: colors.textLight,
    },
    listGap: {
        gap: spacing.md,
    },
    exerciseRow: {
        minHeight: 82,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
    },
    exerciseRowSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    exerciseIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundTint,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    flexOne: {
        flex: 1,
        minWidth: 0,
    },
    exerciseName: {
        fontSize: 17,
        fontWeight: '900',
        color: colors.textDark,
    },
    exerciseType: {
        marginTop: 2,
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
    },
    checkbox: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: 9,
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stickyAction: {
        position: 'absolute',
        right: spacing.md,
        bottom: spacing.md,
        left: spacing.md,
    },
    primaryButton: {
        minHeight: 54,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    primaryButtonCompact: {
        minHeight: 46,
        borderRadius: borders.small.borderRadius,
    },
    primaryButtonText: {
        color: colors.textLight,
        fontSize: 17,
        fontWeight: '900',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionTile: {
        flex: 1,
        minHeight: 92,
        padding: spacing.md,
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    actionTileText: {
        fontSize: 15,
        fontWeight: '900',
        color: colors.textDark,
    },
    sectionHeading: {
        marginTop: spacing.xl,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textDark,
    },
    sectionCount: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textMuted,
    },
    routineCard: {
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    routineCardBody: {
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    routineTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    routineName: {
        flex: 1,
        fontSize: 21,
        fontWeight: '900',
        color: colors.textDark,
    },
    editRoutineHint: {
        minHeight: 36,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        backgroundColor: colors.primaryLight,
        borderRadius: borders.small.borderRadius,
    },
    editRoutineHintText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    routineSummary: {
        marginTop: spacing.xs,
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    routineMeta: {
        marginTop: spacing.sm,
        color: colors.textDark,
        fontSize: 12,
        fontWeight: '900',
    },
    routineStartArea: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    topBar: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    topBarButton: {
        minWidth: 76,
        minHeight: 42,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    topBarSave: {
        backgroundColor: colors.primary,
    },
    topBarDisabled: {
        backgroundColor: colors.inputBackground,
    },
    topBarButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '900',
    },
    topBarSaveText: {
        color: colors.textLight,
    },
    disabledText: {
        color: colors.textMuted,
    },
    topBarTitle: {
        flex: 1,
        color: colors.textDark,
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    topBarSpacer: {
        width: 76,
    },
    fieldLabel: {
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
        color: colors.textMuted,
        fontSize: 15,
        fontWeight: '900',
    },
    nameInput: {
        minHeight: 54,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
        color: colors.textDark,
        fontSize: 17,
        fontWeight: '800',
    },
    editorHelperRow: {
        marginTop: spacing.md,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primaryLight,
        borderRadius: borders.small.borderRadius,
    },
    editorHelperText: {
        flex: 1,
        color: colors.textDark,
        fontSize: 12,
        fontWeight: '800',
        lineHeight: 17,
    },
    emptyState: {
        minHeight: 330,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateCompact: {
        minHeight: 260,
    },
    emptyIcon: {
        width: 78,
        height: 78,
        marginBottom: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    emptyTitle: {
        color: colors.textDark,
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    emptyBody: {
        marginTop: spacing.sm,
        color: colors.textMuted,
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 21,
        textAlign: 'center',
    },
    editorList: {
        marginTop: spacing.lg,
        gap: spacing.md,
    },
    editorCard: {
        padding: spacing.md,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    editorCardDragging: {
        zIndex: 20,
        opacity: 0.92,
        borderColor: colors.primary,
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    editorCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    editorExerciseName: {
        color: colors.textDark,
        fontSize: 17,
        fontWeight: '900',
    },
    smallIconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallIconDisabled: {
        opacity: 0.25,
    },
    setTableHeader: {
        marginTop: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    setHeaderNumber: {
        width: 34,
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: '900',
        textAlign: 'center',
    },
    setHeaderValue: {
        flex: 1,
        minWidth: 0,
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: '900',
        textAlign: 'center',
    },
    setHeaderAction: {
        width: 36,
    },
    editorSetRow: {
        marginTop: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    editorSetNumber: {
        width: 34,
        color: colors.textDark,
        fontSize: 15,
        fontWeight: '900',
        textAlign: 'center',
    },
    setTextInput: {
        flex: 1,
        minWidth: 0,
        minHeight: 42,
        paddingHorizontal: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
        fontSize: 17,
        fontWeight: '900',
        textAlign: 'center',
    },
    addSetButton: {
        minHeight: 44,
        marginTop: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        backgroundColor: colors.primaryLight,
        borderRadius: borders.small.borderRadius,
    },
    addSetButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '900',
    },
    bottomActionSpacing: {
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
    deleteRoutineLink: {
        minHeight: 48,
        marginBottom: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    deleteRoutineLinkText: {
        color: colors.destructive,
        fontSize: 14,
        fontWeight: '900',
    },
    muscleFilterHeading: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    muscleFilterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    muscleFilterCount: {
        marginBottom: spacing.sm,
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: '800',
    },
    exerciseLibraryHeading: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    libraryLabel: {
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '900',
    },
    libraryRow: {
        minHeight: 76,
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: colors.inputBackground,
    },
    libraryIcon: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        borderRadius: 25,
    },
    historyIntro: {
        marginVertical: spacing.lg,
        color: colors.textMuted,
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 22,
    },
    historyCard: {
        padding: spacing.md,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    historyTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    historyDate: {
        flex: 1,
        color: colors.textDark,
        fontSize: 18,
        fontWeight: '900',
    },
    durationPill: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.backgroundTint,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 999,
    },
    durationText: {
        color: colors.textDark,
        fontSize: 11,
        fontWeight: '900',
    },
    historyExercises: {
        marginTop: spacing.md,
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    historyMeta: {
        marginVertical: spacing.md,
        color: colors.textDark,
        fontSize: 12,
        fontWeight: '900',
    },
    activeLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    activeLabel: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
    activeTitle: {
        marginTop: spacing.xs,
        color: colors.textDark,
        fontSize: 38,
        fontWeight: '900',
    },
    accountUnitText: {
        marginTop: spacing.xs,
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    timerCard: {
        marginTop: spacing.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
        ...shadows.hard,
    },
    timerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    timerLabel: {
        color: colors.textDark,
        fontSize: 15,
        fontWeight: '900',
    },
    timerValue: {
        color: colors.textDark,
        fontSize: 17,
        fontWeight: '900',
    },
    activeList: {
        marginTop: spacing.lg,
        gap: spacing.md,
    },
    activeCard: {
        padding: spacing.lg,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    activeExerciseName: {
        fontSize: 20,
        fontWeight: '900',
    },
    activeHint: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: '700',
        opacity: 0.7,
    },
    activeSetHeader: {
        marginTop: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    activeSetHeaderNumber: {
        width: 30,
        fontSize: 9,
        fontWeight: '900',
        textAlign: 'center',
        opacity: 0.75,
    },
    activeSetHeaderValue: {
        flex: 1,
        minWidth: 0,
        fontSize: 9,
        fontWeight: '900',
        textAlign: 'center',
        opacity: 0.75,
    },
    activeSetHeaderDone: {
        width: 44,
        fontSize: 9,
        fontWeight: '900',
        textAlign: 'center',
        opacity: 0.75,
    },
    activeSetRow: {
        marginTop: spacing.xs,
        padding: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    activeSetRowCompleted: {
        opacity: 0.58,
    },
    activeSetNumber: {
        width: 22,
        fontSize: 15,
        fontWeight: '900',
        textAlign: 'center',
    },
    setCompleteCheckbox: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: 10,
    },
    setCompleteCheckboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    activeAddSetButton: {
        minHeight: 42,
        marginTop: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    activeAddSetText: {
        fontSize: 13,
        fontWeight: '900',
    },
    progressHeading: {
        marginTop: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '800',
    },
    progressTrack: {
        height: 9,
        marginTop: spacing.sm,
        overflow: 'hidden',
        backgroundColor: colors.inputBackground,
        borderRadius: 999,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 999,
    },
    resultsContent: {
        paddingHorizontal: spacing.md,
        paddingTop: 70,
        paddingBottom: spacing.xl,
        alignItems: 'stretch',
    },
    resultsIcon: {
        width: 84,
        height: 84,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: 42,
        ...shadows.hard,
    },
    resultsTitle: {
        marginTop: spacing.lg,
        color: colors.textDark,
        fontSize: 30,
        fontWeight: '900',
        textAlign: 'center',
    },
    resultsSubtitle: {
        marginTop: spacing.xs,
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    resultsCard: {
        marginTop: spacing.lg,
        padding: spacing.md,
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    resultStat: {
        flex: 1,
        alignItems: 'center',
    },
    resultStatValue: {
        color: colors.textDark,
        fontSize: 19,
        fontWeight: '900',
    },
    resultStatLabel: {
        marginTop: spacing.xs,
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    resultsList: {
        marginVertical: spacing.lg,
        gap: spacing.sm,
    },
    noCompletedText: {
        paddingVertical: spacing.lg,
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    resultRow: {
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.background,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    resultCheck: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 15,
    },
    resultExerciseName: {
        color: colors.textDark,
        fontSize: 15,
        fontWeight: '900',
    },
    resultExerciseValues: {
        marginTop: 2,
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '700',
    },
    resumeButton: {
        minHeight: 48,
        marginTop: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resumeText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '900',
    },
    localOnlyNote: {
        marginTop: spacing.md,
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalScrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.border,
        opacity: 0.48,
    },
    menuSheet: {
        margin: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderWidth: borders.standard.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.standard.borderRadius,
        ...shadows.hard,
    },
    menuTitle: {
        color: colors.textDark,
        fontSize: 24,
        fontWeight: '900',
    },
    menuDescription: {
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    menuButton: {
        minHeight: 52,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.background,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.border,
        borderRadius: borders.small.borderRadius,
    },
    menuButtonText: {
        color: colors.textDark,
        fontSize: 15,
        fontWeight: '900',
    },
    destructiveButton: {
        minHeight: 52,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.background,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.destructive,
        borderRadius: borders.small.borderRadius,
    },
    destructiveButtonText: {
        color: colors.destructive,
        fontSize: 15,
        fontWeight: '900',
    },
    deleteIconCircle: {
        width: 58,
        height: 58,
        marginBottom: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryLight,
        borderWidth: borders.small.borderWidth,
        borderColor: colors.destructive,
        borderRadius: 29,
    },
})
