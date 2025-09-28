import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminMaterials from './AdminMaterials';
import AdminProfile from './AdminProfile';

const Tab = createBottomTabNavigator();

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
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsers}
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Materials"
        component={AdminMaterials}
        options={{
          title: 'Materials',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🧱</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfile}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
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
