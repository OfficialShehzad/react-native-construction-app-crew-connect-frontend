// screens/RegisterPage.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { Ionicons } from '@expo/vector-icons';
import api from "../api/axios";

export default function RegisterPage({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    userType: "",
    subUserType: "",
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleRegister = async () => {
    console.log('register clicked')
    if (!form.username || !form.email || !form.password || !form.userType) {
      Toast.show({ type: "error", text1: "All fields except sub user type are required" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      Toast.show({ type: "error", text1: "Invalid email format" });
      return;
    }
    if (form.password.length < 6) {
      Toast.show({ type: "error", text1: "Password must be at least 6 chars" });
      return;
    }

    try {
      console.log('trying register')
      const response = await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        user_type: form.userType,
        sub_user_type: form.userType === "worker" ? form.subUserType : null,
      });
      console.log('response : ', response)

      Toast.show({ type: "success", text1: "Registration successful!" });
      navigation.replace("Login");
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || "Registration failed";
      Toast.show({ type: "error", text1: message });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={form.username}
        onChangeText={(val) => handleChange("username", val)}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChangeText={(val) => handleChange("email", val)}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          style={styles.passwordField}
          value={form.password}
          onChangeText={(val) => handleChange("password", val)}
        />
        <TouchableOpacity
          style={styles.passwordIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={form.password}
        onChangeText={(val) => handleChange("password", val)}
      /> */}

      {/* User Type */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.userType}
          style={styles.picker}
          onValueChange={(val) => handleChange("userType", val)}
        >
          <Picker.Item label="Select User Type" value="" />
          {/* <Picker.Item label="Admin" value="admin" /> */}
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Worker" value="worker" />
        </Picker>
      </View>

      {/* Show subUserType only if worker */}
      {form.userType === "worker" ? (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.subUserType}
            style={styles.picker}
            onValueChange={(val) => handleChange("subUserType", val)}
          >
            <Picker.Item label="Select Worker Type" value="" />
            <Picker.Item label="Civil Engineer" value="civil_engineer" />
            <Picker.Item label="Painter" value="painter" />
            <Picker.Item label="Plumber" value="plumber" />
            <Picker.Item label="Electrician" value="electrician" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 32, 
    textAlign: "center",
    color: "#1f2937",
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordField: {
    flex: 1,
    paddingVertical: 10,
  },
  passwordIcon: {
    padding: 5,
  },
  picker: {
    height: 50,
    color: "#374151",
  },
  button: { 
    backgroundColor: "#1e40af", 
    padding: 15, 
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "600",
    fontSize: 16,
  },
});
