import { useState } from 'react'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '../lib/supabase'

export default function ProfileSetupScreen({ session, onComplete }) {
    const [step, setStep] = useState(1)
    const [sex, setSex] = useState('')
    const [age, setAge] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [goal, setGoal] = useState('')
    const [loading, setLoading] = useState(false)

    const handleComplete = async () => {
        setLoading(true)
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
        else if (onComplete) onComplete()
        setLoading(false)
    }

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
            </View>

            {/* Progress bar */}
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>

            {/* Step 1: Basic Info */}
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

            {/* Navigation buttons */}
            <View style={styles.navRow}>
                {step > 1 && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                )}
                {step < 3 ? (
                    <TouchableOpacity
                        style={[styles.nextBtn, step === 1 && { flex: 1 }]}
                        onPress={() => setStep(step + 1)}>
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
})