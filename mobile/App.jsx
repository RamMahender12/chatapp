import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import "./src/config/axios";
import { SocketProvider } from "./src/context/SocketContext";
import { ChatProvider } from "./src/context/ChatContext";
import AppNavigator from "./src/navigation/AppNavigator";
import "./src/global.css";

export default function App() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              <StatusBar style="light" />
              <AppNavigator />
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
