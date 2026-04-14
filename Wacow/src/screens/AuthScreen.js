import { useState } from 'react'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
    // State to track which mode we're in
    const [mode, setMode] = useState('login') // 'login' or 'signup'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAuth = async () => {
        setLoading(true)
        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) Alert.alert('Error', error.message)
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) {
                Alert.alert('Error', error.message)
            } else {
                // Save the name to the users table
                await supabase
                    .from('users')
                    .update({ name })
                    .eq('auth_id', data.user.id)
            }
        }
        setLoading(false)
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
                {/* Toggle buttons */}
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

                {/* Name input - only shows for signup */}
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

                {/* Email input */}
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

                {/* Submit button */}
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
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e53935',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#000',
        marginBottom: 16,
    },
    logoText: { fontSize: 36 },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#000',
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
        borderColor: '#000',
        alignItems: 'center',
    },
    toggleActive: { backgroundColor: '#e53935' },
    toggleText: { fontWeight: '700', color: '#000' },
    toggleTextActive: { color: '#fff' },
    label: { fontWeight: '700', marginBottom: 6 },
    input: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#e53935',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    buttonText: { color: '#fff', fontWeight: '900', fontSize: 18 },
    terms: { color: '#888', fontSize: 12, textAlign: 'center' },
})