import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { UserContext } from '../userContext';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import domisStyle from '../domisStyles'

type LoadIdProps = {
    onDeleteRecording: () => void,
    onDeleteAllRecordings: () => void,
};

const RecordingSelectionDisplay: React.FC<LoadIdProps> = ({onDeleteRecording, onDeleteAllRecordings}) => {
    return(
        <View style={domisStyle.deleteButtonsContainer}>
            <TouchableOpacity style={domisStyle.deleteButton} onPress={onDeleteRecording}>
                <Text style={domisStyle.deleteButtonText}>Delete Recording</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[domisStyle.deleteButton, domisStyle.deleteAllButton]} onPress={onDeleteAllRecordings}>
                <Text style={domisStyle.deleteButtonText}>Delete All Recordings</Text>
            </TouchableOpacity>
        </View>
    )
};

export default RecordingSelectionDisplay;