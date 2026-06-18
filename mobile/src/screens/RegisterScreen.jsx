import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-dark-950"
      >
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-3xl bg-accent-primary items-center justify-center mb-6">
            <Feather name="message-circle" size={32} color="white" />
          </View>

          <Text className="text-2xl font-bold text-dark-50 mb-1">
            Create Account
          </Text>
          <Text className="text-dark-400 text-center mb-10">
            Join the conversation
          </Text>

          {/* Name */}
          <View className="w-full mb-5">
            <Text className="text-dark-300 text-xs font-medium uppercase tracking-wider mb-2">
              Name
            </Text>
            <View className="flex-row items-center bg-dark-800 rounded-xl border border-white/[0.06] px-4">
              <Feather name="user" size={18} color="#52525b" />
              <TextInput
                className="flex-1 text-dark-50 py-4 px-3 text-base"
                placeholder="Your name"
                placeholderTextColor="#52525b"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View className="w-full mb-5">
            <Text className="text-dark-300 text-xs font-medium uppercase tracking-wider mb-2">
              Email
            </Text>
            <View className="flex-row items-center bg-dark-800 rounded-xl border border-white/[0.06] px-4">
              <Feather name="mail" size={18} color="#52525b" />
              <TextInput
                className="flex-1 text-dark-50 py-4 px-3 text-base"
                placeholder="you@example.com"
                placeholderTextColor="#52525b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View className="w-full mb-8">
            <Text className="text-dark-300 text-xs font-medium uppercase tracking-wider mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-dark-800 rounded-xl border border-white/[0.06] px-4">
              <Feather name="lock" size={18} color="#52525b" />
              <TextInput
                className="flex-1 text-dark-50 py-4 px-3 text-base"
                placeholder="Min 6 characters"
                placeholderTextColor="#52525b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#52525b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="w-full bg-accent-primary py-4 rounded-xl items-center flex-row justify-center"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-semibold text-base mr-2">
                  Create Account
                </Text>
                <Feather name="arrow-right" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            className="mt-8"
          >
            <Text className="text-dark-400">
              Already have an account?{" "}
              <Text className="text-accent-primary font-medium">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
