// Try graphing / displaying vibrato

import React, { useState, useEffect, useContext } from "react";
import { View, Button, Text, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { io } from "socket.io-client";
import { UserContext } from '../userContext';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

// Replace this with your server address
const SOCKET_SERVER_URL = "https://domis.blue:644";

export default function AudioRecordTab({ userId }) {
  const [recording, setRecording] = useState(null);
  const [socket, setSocket] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Press record to start");
  const [isRecording, setIsRecording] = useState(false);
  const [thisId, setThisId] = useState(null);

  const { uniqueId } = useContext(UserContext);

  useEffect(() => {
    const generatedId = String(uniqueId);
    setThisId(generatedId);

    const socketInstance = io(SOCKET_SERVER_URL, {
      query: { id: generatedId },
    });
    setSocket(socketInstance);

    socketInstance.on("Recordings Analyzed", () => {
      Alert.alert("Success", "Recording Successfully Analyzed");
    });

    return () => {
      if (socketInstance) {
        socketInstance.off("Recordings Analyzed");
        socketInstance.disconnect();
      }
    };
  }, []);

  // Automatically stop recording after 5 minutes and release keep awake
  useEffect(() => {
    let keepAwakeTimeout;
    if (isRecording) {
      keepAwakeTimeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
    return () => clearTimeout(keepAwakeTimeout);
  }, [isRecording]);

  async function startRecording() {
    try {
      setStatusMessage("Requesting microphone permission...");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        setStatusMessage("Permission to access microphone is required!");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        // Set AVAudioSessionModeMeasurement for iOS to disable AGC
        ios: {
          AVAudioSessionCategory: Audio.AVAudioSessionCategoryPlayAndRecord,
          AVAudioSessionCategoryOptions: Audio.AVAudioSessionCategoryOptionMixWithOthers,
          AVAudioSessionMode: Audio.AVAudioSessionModeMeasurement, 
        }});

      await activateKeepAwakeAsync();

      setStatusMessage("Starting recording...");
      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 1,        
          bitRate: 64000,  
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      setRecording(recording);
      setIsRecording(true);
      setStatusMessage("Recording in progress...");
    } catch (error) {
      console.error("Failed to start recording", error);
      setStatusMessage("Failed to start recording" + String(error));
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    setStatusMessage("Stopping recording...");
    setIsRecording(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await deactivateKeepAwake();

      const uri = recording.getURI();
      setStatusMessage("Recording stopped. Ready to submit.");
      setRecording({ ...recording, uri });
    } catch (error) {
      console.error("Failed to stop recording", error);
      setStatusMessage("Failed to stop recording");
    }
  }

  async function submitRecording() {
    if (!recording || !recording.uri) {
      setStatusMessage("No recording available to submit");
      return;
    }

    try {
      setStatusMessage("Reading file and sending to server...");
      const base64data = await FileSystem.readAsStringAsync(recording.uri, {
        encoding: 'base64',
      });

      socket.emit("App Recording Submit", {
        stringVal: base64data,
        senderId: thisId,
      });

      setStatusMessage("Audio submitted to server.");
    } catch (error) {
      console.error("Failed to submit recording", error);
      setStatusMessage("Failed to submit recording");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{statusMessage}</Text>

      <Button
        title={isRecording ? "Stop Recording" : "Record Audio"}
        onPress={isRecording ? stopRecording : startRecording}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit Audio" onPress={submitRecording} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  status: {
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
