import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import api, { setAuthToken } from "../api/axios"; // ✅ import the axios instance and setAuthToken

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");

  const handleLogin = async () => {
    if (!username || !password || !userType) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
        user_type: userType,
      });

      const { token, user } = response.data;

      // Save the token to AsyncStorage
      await setAuthToken(token);
      
      console.log("Login successful for user:", user.username, "as", user.user_type);
      
      Alert.alert("Success", `Welcome ${user.username}!`);

      // Navigate based on the actual user type from the server response
      if (user.user_type === "admin") {
        navigation.replace("Admin");
      } else if (user.user_type === "worker") {
        navigation.replace("Worker");
      } else {
        navigation.replace("User");
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.error || "Network error. Please check your connection.";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Username" style={styles.input} value={username} onChangeText={setUsername} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>Login as:</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={userType} onValueChange={setUserType}>
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Admin" value="admin" />
          <Picker.Item label="Worker" value="worker" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  pickerWrapper: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: "#2c3e50", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
