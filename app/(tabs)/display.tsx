//#region top file
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { UserContext } from '../userContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import PagerView from "react-native-pager-view";
import { io, Socket } from 'socket.io-client';
import DropDownPicker from 'react-native-dropdown-picker';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

import IntonationStringDisplay from '../components/intonationStringDisplay';
import DynamicsStringDisplay from '../components/dynamicsStringDisplay';
import RecordingSelectionDisplay from '../components/recordingSelectionDisplay';
import PlaybackControlDisplay from '../components/playbackControlDisplay';

const { height: screenHeight } = Dimensions.get('window');
const TOP_BAR_MARGIN_TOP = screenHeight * 0.10;

function fillNoteGaps(notes) {
  if (!notes || notes.length === 0) return [];
  const filledNotes = [];
  for (let i = 0; i < notes.length; i++) {
    filledNotes.push({ ...notes[i] });
    if (i < notes.length - 1) {
      const gapStart = notes[i].endTime;
      const gapEnd = notes[i + 1].startTime;
      if (gapEnd > gapStart) {
        filledNotes.push({
          ...notes[i],
          startTime: gapStart,
          endTime: gapEnd,
        });
      }
    }
  }
  return filledNotes;
}
//#endregion

const displayScreen: React.FC = () => {
  //#region definitons
  const { uniqueId } = useContext(UserContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [notes, setNotes] = useState<
    { startTime: number; endTime: number; noteName: string; centsDifference: number }[]
  >([]);
  const [currentNote, setCurrentNote] = useState<{ noteName: string; centsDifference: number } | null>(null);
  const [notesAudio, setNotesAudio] = useState<Record<string, number>>({});
  const [currentAudioValue, setCurrentAudioValue] = useState<number | null>(null);
  const [currentAudioLabel, setCurrentAudioLabel] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isHalfSpeed, setIsHalfSpeed] = useState(false);
  const [value, setValue] = useState<string | null>(null);

  const fullUserId = `APPUSER${uniqueId}`;
  const notesRef = useRef(notes);
  const notesAudioRef = useRef(notesAudio);
  //#endregion

  //#region useEffect hooks
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  
  useEffect(() => {
    notesAudioRef.current = notesAudio;
  }, [notesAudio]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    const socketInstance = io('https://domis.blue:644', {
      transports: ['websocket'],
      secure: true,
      query: { id: fullUserId },
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('deleteRecordingResult', (data) => {
      if (data.success) {
        Alert.alert("Success", `Recording deleted successfully.`);
        fetchTimestampFolders();
      } else {
        Alert.alert("Error", `Failed to delete recording: ${data.error}`);
      }
    });

    socketInstance.on('deleteAllRecordingsResult', (data) => {
      if (data.success) {
        Alert.alert("Success", `All recordings deleted successfully.`);
        fetchTimestampFolders();
      } else {
        Alert.alert("Error", `Failed to delete all recordings: ${data.error}`);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [fullUserId]);

  useEffect(() => {
    if (socket) {
      fetchTimestampFolders();
    }
  }, [socket]);

  useEffect(() => {
    setSelectedTimestamp(value);
  }, [value]);

  useEffect(() => {
    async function loadAudioAndNotes() {
      if (!socket || !selectedTimestamp) {
        setNotes([]);
        setCurrentNote(null);
        setNotesAudio({});
        setCurrentAudioValue(null);
        setCurrentAudioLabel(null);
        setLoading(false);
        return;
      }
      setLoading(true);

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }

      setNotes([]);
      setCurrentNote(null);
      setPositionMillis(0);
      setDurationMillis(0);
      setIsPlaying(false);
      setNotesAudio({});
      setCurrentAudioValue(null);
      setCurrentAudioLabel(null);

      socket.off('recordingAudioData');
      socket.emit('getRecordingAudio', { userId: fullUserId, timestamp: selectedTimestamp });
      socket.once('recordingAudioData', async (data: { audioUrl?: string; error?: string }) => {
        if (data.error) {
          console.error('Error fetching recording audio:', data.error);
          setLoading(false);
          return;
        }

        try {
          if (data.audioUrl) {
            const { sound } = await Audio.Sound.createAsync(
              { uri: data.audioUrl },
              { shouldPlay: false, progressUpdateIntervalMillis: 50 },
              onPlaybackStatusUpdate
            );
            soundRef.current = sound;
            await sound.setVolumeAsync(1.0);
            await sound.setRateAsync(isHalfSpeed ? 0.5 : 1.0, false);
          }
        } catch (e) {
          console.error('Audio.Sound error:', e);
        }

        // Fetch notes.json
        const notesUrl = `https://domis.blue:644/${fullUserId}/${selectedTimestamp}/Notes.json`;
        try {
          const response = await fetch(notesUrl);
          if (!response.ok) throw new Error('Failed to fetch notes.json');
          const notesData = await response.json();
          setNotes(fillNoteGaps(notesData));
        } catch (err) {
          console.error('Error loading notes.json:', err);
          setNotes([]);
        }

        // Fetch NotesAudio.json
        const notesAudioUrl = `https://domis.blue:644/${fullUserId}/${selectedTimestamp}/NotesAudio.json`;
        try {
          const response = await fetch(notesAudioUrl);
          if (!response.ok) throw new Error('Failed to fetch NotesAudio.json');
          const notesAudioData = await response.json();
          // Convert keys to number keys while storing
          const parsedAudioData: Record<number, number> = {};
          Object.entries(notesAudioData).forEach(([key, val]) => {
            parsedAudioData[parseFloat(key)] = val as number;
          });
          setNotesAudio(parsedAudioData);
        } catch (err) {
          console.error('Error loading NotesAudio.json:', err);
          setNotesAudio({});
        }
        setLoading(false);
      });
    }
    loadAudioAndNotes();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
    };
  }, [socket, selectedTimestamp, fullUserId, isHalfSpeed]);
  //#endregion

  //#region functions [Non api]
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Toggle half speed playback handler with alert on going from half speed to normal
  const toggleHalfSpeed = async () => {
    if (!soundRef.current) return;

    if (isHalfSpeed) {
      // going from half speed to normal speed: show alert first before switching
      Alert.alert(
        "Experimental feature",
        "The playback speed toggle is experimental. Proceed?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK", onPress: async () => {
              try {
                await soundRef.current?.setRateAsync(1.0, false);
                setIsHalfSpeed(false);
              } catch (e) {
                console.error('Error setting playback speed:', e);
              }
            }
          }
        ]
      );
    } else {
      // going from normal to half speed no alert needed
      try {
        await soundRef.current.setRateAsync(0.5, false);
        setIsHalfSpeed(true);
      } catch (e) {
        console.error('Error setting playback speed:', e);
      }
    }
  };

  // Helper function to get intensity label by value
  const getIntensityLabel = (value: number): string => {
    if (value >= 2) return 'FF';
    if (value >= 1) return 'F';
    if (value >= 0) return 'MF';
    if (value >= -1) return 'MP';
    if (value >= -2) return 'P';
    if (value >= -3) return 'PP';
    return '';
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      setIsPlaying(false);
      setPositionMillis(0);
      setDurationMillis(0);
      setCurrentNote(null);
      setCurrentAudioValue(null);
      setCurrentAudioLabel(null);
      return;
    }
    setIsPlaying(status.isPlaying);
    setPositionMillis(status.positionMillis);
    setDurationMillis(status.durationMillis ?? 0);

    const currentTime = status.positionMillis / 1000;

    // Update current note
    if (notesRef.current && notesRef.current.length > 0) {
      const note = notesRef.current.find(
        (n) => currentTime >= n.startTime && currentTime < n.endTime
      );
      if (note) {
        setCurrentNote({
          noteName: note.noteName,
          centsDifference: parseFloat(note.centsDifference.toFixed(2)),
        });
      } else {
        setCurrentNote(null);
      }
    } else {
      setCurrentNote(null);
    }

    // Update current audio value and label
    if (notesAudioRef.current && Object.keys(notesAudioRef.current).length > 0) {
      // Find closest matching key <= currentTime (to handle sparse keys)
      const keys = Object.keys(notesAudioRef.current).map(parseFloat).sort((a, b) => a - b);
      let closestKey = keys[0];
      for (let k of keys) {
        if (k <= currentTime) {
          closestKey = k;
        } else {
          break;
        }
      }
      const val = notesAudioRef.current[closestKey];
      setCurrentAudioValue(parseFloat(val.toFixed(2)));
      setCurrentAudioLabel(getIntensityLabel(val));
    } else {
      setCurrentAudioValue(null);
      setCurrentAudioLabel(null);
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const onSeekSliderValueChange = async (value: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(value);
  };
  //#endregion

  //#region functions [api related]
  const fetchTimestampFolders = useCallback(() => {
    if (!socket) return;
    setLoading(true);
    setTimestamps([]);
    setSelectedTimestamp(null);
    setItems([]);
    setNotes([]);
    setCurrentNote(null);
    setNotesAudio({});
    setCurrentAudioValue(null);
    setCurrentAudioLabel(null);

    socket.off('userTimestampFolders');
    socket.emit('getUserTimestampFolders', { userId: fullUserId });
    socket.once('userTimestampFolders', (data: { timestamps: string[] }) => {
      const arr = data.timestamps ?? [];
      const reversedArr = [...arr].reverse();
      setTimestamps(reversedArr);
      const dropdownItems = reversedArr.map((ts) => ({
        label: formatTimestamp(ts),
        value: ts,
      }));
      setItems(dropdownItems);

      if (reversedArr.length > 0) {
        setSelectedTimestamp(reversedArr[0]);
        setValue(reversedArr[0]);
      } else {
        setSelectedTimestamp(null);
        setValue(null);
        setNotes([]);
        setCurrentNote(null);
        setLoading(false);
      }
    });
  }, [socket, fullUserId]);

  const onDeleteRecording = () => {
    if (!selectedTimestamp || !socket) {
      Alert.alert("No recording selected", "Please select a recording to delete.");
      return;
    }
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete the selected recording?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: () => {
            socket.emit('deleteRecording', { userId: fullUserId, timestamp: selectedTimestamp });
            fetchTimestampFolders();
          }
        }
      ]
    );
  };

  const onDeleteAllRecordings = () => {
    if (!socket) {
      Alert.alert("Error", "Socket not connected");
      return;
    }
    Alert.alert(
      "Confirm Delete All",
      "Are you sure you want to delete ALL your recordings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All", style: "destructive", onPress: () => {
            socket.emit('deleteAllRecordings', { userId: fullUserId });
            fetchTimestampFolders();
          }
        }
      ]
    );
  };

  

  const onRefresh = async () => {
    await fetchTimestampFolders();
  };
  //#endregion

  //#region display views

  if (!loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Select Recording Timestamp</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.noRecordingsContainer}>
          <Text style={styles.noRecordingsText}>
            Please record and submit a recording on the previous screen
          </Text>
          <Text style={styles.noRecordingsSubText}>
            If you have already done this, please press Refresh
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Select Recording Timestamp</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {items.length > 0 ? (
        <View style={styles.pickerContainer}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            containerStyle={{ marginBottom: 15 }}
            style={{ backgroundColor: '#fff' }}
            dropDownContainerStyle={{ backgroundColor: '#fff' }}
            textStyle={{ color: '#000', fontWeight: '500' }}
            placeholder="Select timestamp"
            listMode="SCROLLVIEW"
          />
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={styles.currentNoteRow}>

            <PagerView style={{ flex: 1 }} initialPage={0}>
              <View style={{ flex: 1 }} key="1">
                <IntonationStringDisplay currentNote={currentNote}/>
              </View>
              <View style={{ flex: 1 }} key="2">
                <DynamicsStringDisplay currentAudioValue={currentAudioValue} currentAudioLabel={currentAudioLabel}/>
              </View>
            </PagerView>
            
            
          </View>
            

          <PlaybackControlDisplay isHalfSpeed={isHalfSpeed} toggleHalfSpeed={toggleHalfSpeed} togglePlayback={togglePlayback} isPlaying={isPlaying} positionMillis={positionMillis} durationMillis={durationMillis} onSeekSliderValueChange={onSeekSliderValueChange}/>

          <RecordingSelectionDisplay onDeleteRecording={onDeleteRecording} onDeleteAllRecordings={onDeleteAllRecordings}/>
        
        </>
      )}
    </View>
  );
  //#endregion
};


//#region shitty styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: TOP_BAR_MARGIN_TOP,
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshText: { color: 'white', fontWeight: '600' },
  pickerContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    zIndex: 1000,
  },
  noTimestampsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 10,
    fontStyle: 'italic',
  },
  currentNoteRow: {
    marginVertical: 40,
    paddingHorizontal: 20,
    flex: 1
  },
  currentNoteContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  currentNoteText: {
    fontSize: 96,
    fontWeight: '900',
    textAlign: 'left',
    color: '#000',
  },
  centsDifferenceText: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'left',
    color: '#444',
  },
  audioDynamicsContainer: {
    width: 110,
    alignItems: 'flex-end',
  },
  audioValueText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#000',
  },
  audioLabelText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#444',
    marginTop: 4,
  },
  noNoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
  },
  noRecordingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noRecordingsText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  noRecordingsSubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 15,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  timeText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  slider: {
    height: 40,
  },
  deleteButtonsContainer: {
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#FF453A',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
//#endregion

export default displayScreen;
