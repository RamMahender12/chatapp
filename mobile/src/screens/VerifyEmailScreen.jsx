import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const inputRefs = useRef([]);
  const { sendOTP, verifyOTP, user } = useAuth();

  useEffect(() => {
    handleSendOTP();
  }, []);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const data = await sendOTP();
      setOtpSent(true);
      if (data.devMode || data.bypass) {
        setDevMode(true);
        setDevOtp(data.otp || "Bypass enabled");
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(code);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-dark-950 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-accent-primary/10 items-center justify-center mb-6">
          <Feather name="mail" size={32} color="#8b5cf6" />
        </View>

        <Text className="text-2xl font-bold text-dark-50 mb-1">
          Verify Email
        </Text>
        <Text className="text-dark-400 text-center mb-2">
          We sent a verification code to
        </Text>
        <Text className="text-dark-200 font-medium mb-8">
          {user?.email}
        </Text>

        {devMode && (
          <View className="w-full mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20">
            <Text className="text-danger text-sm text-center">
              Dev Mode OTP: {devOtp}
            </Text>
          </View>
        )}

        {/* OTP Input */}
        <View className="flex-row gap-3 mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="w-12 h-14 bg-dark-800 rounded-xl border border-white/[0.06] text-center text-dark-50 text-xl font-bold"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading}
          className="w-full bg-accent-primary py-4 rounded-xl items-center flex-row justify-center"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-semibold text-base mr-2">
                Verify
              </Text>
              <Feather name="check" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSendOTP}
          disabled={loading}
          className="mt-6"
        >
          <Text className="text-dark-400">
            Didn't receive code?{" "}
            <Text className="text-accent-primary font-medium">Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
