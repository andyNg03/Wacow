// Navigation for main bottom tab
// 3 tabs: Home, Workout, Profile
// Home also carries the stats content; Profile carries the app info/menu
// Each tab has an Ionicons icon that turns red when active

// imports
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import WorkoutScreen from '../screens/WorkoutsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { colors } from '../style/theme'

// in C++, it's like creating a const pointer
// you can't change what it's pointing to,
// but fields are mutable
const Tab = createBottomTabNavigator()

// Maps each tab name to its Ionicons icon
const TAB_ICONS = {
    Home:    'home',
    Workout: 'barbell',
    Profile: 'person',
}

export default function TabNavigator() {
    return(
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                // Top border line separating screen from tab bar
                tabBarStyle: {
                    borderTopWidth: 2,
                    borderTopColor: colors.border,
                },

                // Icon for each tab — looks up the name from TAB_ICONS
                tabBarIcon: ({ color, size }) => (
                    <Ionicons
                        name={TAB_ICONS[route.name]}
                        size={size}
                        color={color}
                    />
                ),

                // Active = red, inactive = grey
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
            })}
        >
            {/* "Name" lets you identify the screen you need to access later
            and component is the screen you're putting into the navigator */}
            <Tab.Screen name="Home"    component={HomeScreen} />
            <Tab.Screen name="Workout" component={WorkoutScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    )
}