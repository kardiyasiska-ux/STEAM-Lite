import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen({ onLogin, onGoToRegister }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const login = async () => {
    try {
      const email = username.trim().toLowerCase();

      if (!email || !password) {
        Alert.alert("Gagal", "Email dan password harus diisi");
        return;
      }

      if (!email.endsWith("@steamapp.fake")) {
        Alert.alert(
          "Email Tidak Valid",
          "Gunakan email dengan domain @steamapp.fake"
        );
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);

      onLogin();
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert("Login Gagal", "Email atau password salah");
      } else {
        Alert.alert("Login Gagal", error.message);
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
        {/* AVATAR MINI (STEAM STYLE) */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>

        <Text style={styles.logo}>STEAM</Text>

        <View style={styles.formPanel}>
          <Text style={styles.formTitle}>Sign In</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>SIGN IN WITH ACCOUNT NAME</Text>

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
          </View>

          <Pressable
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <Ionicons name="checkmark" size={14} color="#c7d5e0" />
              )}
            </View>

            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>

          <Pressable style={styles.buttonWrapper} onPress={login}>
            <LinearGradient
              colors={["#06BFFF", "#2D73FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign in</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onGoToRegister} style={styles.registerButton}>
            <Text style={styles.registerText}>
              Belum punya akun? <Text style={styles.registerLink}>Daftar</Text>
            </Text>
          </Pressable>

          <Pressable style={styles.helpButton}>
            <Text style={styles.helpText}>Help, I can't sign in</Text>
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
    backgroundColor: "rgba(8, 13, 22, 0.58)",
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

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 2,
  },

  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: "#3A404A",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#505864",
  },

  rememberText: {
    color: "#acb2b8",
    fontSize: 13,
  },

  buttonWrapper: {
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
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

  registerButton: {
    marginTop: 18,
  },

  registerText: {
    color: "#c7d5e0",
    textAlign: "center",
  },

  registerLink: {
    color: "#66C0F4",
    fontWeight: "bold",
  },

  helpButton: {
    marginTop: 14,
  },

  helpText: {
    color: "#8f98a0",
    fontSize: 12,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});