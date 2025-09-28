import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import UserProjects from './UserProjects';
import UserProfile from './UserProfile';
import HireEngineer from './HireEngineer';

const Tab = createBottomTabNavigator();

export default function UserNavigation() {
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
        component={UserProjects}
        options={{
          title: 'My Projects',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
      {/* <Tab.Screen
        name="HireEngineer"
        component={HireEngineer}
        options={{
          title: 'Hire Engineer',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⛑️</Text>
          ),
        }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={UserProfile}
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
