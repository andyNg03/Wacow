// Component for the header greetings in Home Screen
// A component is a reusable element that can be displayed on any screen
// We make one by creating view(s) for it and display them via calling their functions

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
//import { Dumbbell, Clock, Flame } from 'lucide-react-native'

// Greeting view for Home screen
export default function WorkoutCard({ name, duration, calories, gradientColors }) {
    return (
        <View style={styles.shadowWrapper}>
            <TouchableOpacity activeOpacity={0.9}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.topRow}>
                        <Text style={styles.title}>{name}</Text>
                        <Text style={{ fontSize: 28 }}>🏋️</Text>
                    </View>
                    <View style={styles.bottomRow}>
                        <View style={styles.stat}>
                            <Text>⏱ </Text>
                            <Text style={styles.statText}>{duration} min</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text>🔥 </Text>
                            <Text style={styles.statText}>{calories} cal</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    shadowWrapper: {
        backgroundColor: '#000000',
        borderRadius: 24,
        marginHorizontal: 15,
        marginVertical: 8,
        transform: [{ translateX: 0 }, { translateY: 15 }],
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 4,
        borderColor: '#000000',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: '900',
    },
    bottomRow: {
        flexDirection: 'row',
        gap: 16,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    }
})