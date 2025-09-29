import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WorkerProjects from './WorkerProjects';
import WorkerRequests from './WorkerRequests';
import WorkerProfile from './WorkerProfile';

const Tab = createBottomTabNavigator();

export default function WorkerNavigation() {
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
        name="MyProjects"
        component={WorkerProjects}
        options={{
          title: 'My Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hammer" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={WorkerRequests}
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={WorkerProfile}
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
