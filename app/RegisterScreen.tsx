import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../firebaseconfig";

export default function RegisterScreen({ onRegister, onGoToLogin }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const register = async () => {
    try {
      const trimmedUsername = username.trim().toLowerCase();

      if (!trimmedUsername || !password) {
        Alert.alert("Gagal", "Email dan password harus diisi");
        return;
      }

      if (!trimmedUsername.endsWith("@steamapp.fake")) {
        Alert.alert(
          "Email Tidak Valid",
          "Gunakan email dengan domain @steamapp.fake"
        );
        return;
      }

      if (password.length < 6) {
        Alert.alert("Gagal", "Password minimal 6 karakter");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedUsername,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: trimmedUsername,
      });

      Alert.alert("Berhasil", "Akun berhasil dibuat!");
      onRegister();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Registrasi Gagal", "Email sudah digunakan");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Registrasi Gagal", "Format email tidak valid");
      } else {
        Alert.alert("Registrasi Gagal", error.message);
      }
    }
  };

  const getInitial = () => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  return (
    <ImageBackground
      source={{
        uri: "https://gamesbeat.com/wp-content/uploads/2025/05/steam-library-update-2-2-scaled.png",
      }}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />

      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>

        <Text style={styles.logo}>STEAM</Text>

        <View style={styles.formPanel}>
          <Text style={styles.formTitle}>Create Account</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>

            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Masukkan email"
                placeholderTextColor="#8f98a0"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.helperText}>
              Gunakan email dengan domain @steamapp.fake
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Masukkan password"
                placeholderTextColor="#8f98a0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#8f98a0"
                />
              </Pressable>
            </View>

            <Text style={styles.helperText}>
              Password minimal 6 karakter
            </Text>
          </View>

          <Pressable style={styles.buttonWrapper} onPress={register}>
            <LinearGradient
              colors={["#06BFFF", "#2D73FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>DAFTAR</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onGoToLogin} style={styles.loginButton}>
            <Text style={styles.loginText}>
              Sudah punya akun? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 13, 22, 0.60)",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#66C0F4",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },

  logo: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: 1,
  },

  formPanel: {
    backgroundColor: "rgba(18, 26, 36, 0.94)",
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  formTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    color: "#66C0F4",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 7,
    letterSpacing: 0.8,
  },

  inputBox: {
    backgroundColor: "#32353C",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#3E4653",
  },

  input: {
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },

  passwordContainer: {
    backgroundColor: "#32353C",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#3E4653",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  passwordInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 14,
    fontSize: 15,
  },

  helperText: {
    color: "#8f98a0",
    fontSize: 11,
    marginTop: 6,
  },

  buttonWrapper: {
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },

  button: {
    padding: 15,
    borderRadius: 3,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },

  loginButton: {
    marginTop: 18,
  },

  loginText: {
    color: "#c7d5e0",
    textAlign: "center",
  },

  loginLink: {
    color: "#66C0F4",
    fontWeight: "bold",
  },
});