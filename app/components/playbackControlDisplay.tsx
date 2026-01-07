import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import Slider from '@react-native-community/slider';

import domisStyle from '../domisStyles';

type LoadIdProps = {
  isHalfSpeed: boolean,
  toggleHalfSpeed: any,
  togglePlayback: any,
  isPlaying: boolean,
  positionMillis: number,
  durationMillis: number,
  onSeekSliderValueChange: any,
};

const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PlaybackControlDisplay: React.FC<LoadIdProps> = ({isHalfSpeed, toggleHalfSpeed, togglePlayback, isPlaying, positionMillis, durationMillis, onSeekSliderValueChange}) => {
    return (
        <View>
            <View style={domisStyle.controlsRow}>
                <TouchableOpacity
                    style={[domisStyle.playButton, isHalfSpeed && { backgroundColor: '#005BB5' }]}
                    onPress={toggleHalfSpeed}
                >
                    <Text style={domisStyle.playButtonText}>{isHalfSpeed ? 'Normal Speed' : 'Half Speed'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={domisStyle.playButton} onPress={togglePlayback}>
                    <Text style={domisStyle.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>
            </View>

            <View style={domisStyle.sliderRow}>
                <Text style={domisStyle.timeText}>{formatTime(positionMillis)}</Text>
                <View style={domisStyle.sliderContainer}>
                <Slider
                    minimumValue={0}
                    maximumValue={durationMillis}
                    value={positionMillis}
                    onSlidingComplete={onSeekSliderValueChange}
                    minimumTrackTintColor="#007AFF"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#007AFF"
                    style={domisStyle.slider}
                />
                </View>
                <Text style={domisStyle.timeText}>{formatTime(durationMillis)}</Text>
            </View>
        </View>
    )
}

export default PlaybackControlDisplay