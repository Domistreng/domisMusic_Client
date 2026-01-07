import React from 'react';

import {
  View,
  Text,
  Dimensions,
} from 'react-native';

import domisStyle from '../domisStyles';

type LoadIdProps = {
  currentAudioValue: number;
  currentAudioLabel: string;
};

const DynamicsStringDisplay: React.FC<LoadIdProps> = ( {currentAudioValue, currentAudioLabel}) => {
    return(
        <View style={domisStyle.audioDynamicsContainer}>
            {currentAudioValue !== null && currentAudioLabel !== null ? (
            <>
                <Text style={domisStyle.audioValueText}>{currentAudioValue}</Text>
                <Text style={domisStyle.audioLabelText}>{currentAudioLabel}</Text>
            </>
            ) : (
            <Text style={domisStyle.noNoteText}>-</Text>
            )}
        </View>
    )
};

export default DynamicsStringDisplay;