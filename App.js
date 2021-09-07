import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  AppState,
} from "react-native";
import PINCode, {
  hasUserSetPinCode,
  resetPinCodeInternalStates,
  deleteUserPinCode,
} from "@haskkor/react-native-pincode";
import BackgroundTimer from "react-native-background-timer";

export default function App() {
  const [showPinLock, setShowPinLock] = React.useState(true);
  const [showPinCodeStatus, setShowPinCodeStatus] = React.useState("");
  const [hasPinState, setHasPinState] = React.useState(false);
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current
  );
  let timeoutId;

  React.useEffect(() => {
    getHasPinState();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
      if (appState.current === "background") {
        // Start a timer that runs once after X milliseconds
        timeoutId = BackgroundTimer.setTimeout(() => {
          // this will be executed once after 10 seconds
          // even when app is the the background
          console.log("loc do");
          setShowPinLock(true);
        }, 2 * 60 * 1000);

        // Cancel the timeout if necessary
     
      }
    });

    return () => {
      subscription?.remove();
      BackgroundTimer.clearTimeout(timeoutId);
    };
  }, []);

  const getHasPinState = async () => {
    const hasPin = await hasUserSetPinCode();
    setHasPinState(hasPin);
    if (hasPin) {
      setShowPinCodeStatus("enter");
    } else {
      setShowPinCodeStatus("choose");
    }
  };

  const _showRemovePinLock = async () => {
    await deleteUserPinCode();
    await resetPinCodeInternalStates();
    Alert.alert(null, "You have cleared your pin.", [
      {
        title: "Ok",
        onPress: () => {
          setShowPinLock(true);
          getHasPinState();
        },
      },
    ]);
  };

  const _finishProcess = async () => {
    if (showPinCodeStatus === "choose") {
      Alert.alert(null, "You have successfully set your pin.", [
        {
          title: "Ok",
          onPress: () => {
            getHasPinState();
          },
        },
      ]);
    }

    if (showPinCodeStatus === "enter") {
      Alert.alert(null, "You have successfully entered your pin.", [
        {
          title: "Ok",
          onPress: () => {
            setShowPinLock(false);
            getHasPinState();
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {showPinLock === false && hasPinState === true && (
        <View>
          <TouchableOpacity onPress={() => _showRemovePinLock()}>
            <Text>Remove Pin</Text>
          </TouchableOpacity>
        </View>
      )}
      {showPinLock === true && (
        <PINCode
          status={showPinCodeStatus}
          touchIDDisabled={true}
          finishProcess={() => _finishProcess()}
          styleMainContainer={{
            backgroundColor: '#444444',
            flex: 1,
            width: `100%`
          }}
          colorCircleButtons={{
            backgroundColor: '#444444'
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
