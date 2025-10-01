import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from './AdminDashboard';
import AdminPage from './AdminPage';
import AdminMaterials from './AdminMaterials';
import AdminProfile from './AdminProfile';
import UserDetails from './UserDetails';

const Tab = createBottomTabNavigator();
const UserStack = createStackNavigator();

function UsersStackNavigator() {
  return (
    <UserStack.Navigator>
      <UserStack.Screen
        name="UsersHome"
        component={AdminPage}
        options={{ title: 'Users', headerShown: false }}
      />
      <UserStack.Screen
        name="UserDetails"
        component={UserDetails}
        options={{ title: 'User Details' }}
      />
    </UserStack.Navigator>
  );
}

export default function AdminNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: styles.header,
        headerTintColor: '#fff',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={UsersStackNavigator}
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Materials"
        component={AdminMaterials}
        options={{
          title: 'Materials',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfile}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  header: {
    backgroundColor: '#1e40af',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
