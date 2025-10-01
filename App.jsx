// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LandingPage from "./screens/LandingPage";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import UserNavigation from "./screens/UserNavigation";
import WorkerNavigation from "./screens/WorkerNavigation";
import AdminNavigation from "./screens/AdminNavigation";
import HireEngineer from './screens/HireEngineer';
import HireWorkers from './screens/HireWorkers';
import Toast, { ToastProvider } from "react-native-toast-message";


const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen
            name="Landing"
            component={LandingPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Register" component={RegisterPage} />
          <Stack.Screen
            name="User"
            component={UserNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Worker"
            component={WorkerNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
  name="HireEngineer"
  component={HireEngineer}
  options={{ title: 'Hire Engineer' }}
/>
          <Stack.Screen
  name="HireWorkers"
  component={HireWorkers}
  options={{ title: 'Hire Workers' }}
/>
        </Stack.Navigator>
      </NavigationContainer>
      <Toast /> 
    </>
  );
}
