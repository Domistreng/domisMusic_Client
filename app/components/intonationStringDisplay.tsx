import React from 'react';

import {
  View,
  Text,
  Dimensions,
} from 'react-native';

import domisStyle from '../domisStyles';

const formatCentsDifference = (cents: number) => {
    return (cents >= 0 ? '+' : '') + cents.toFixed(2);
  };


type LoadIdProps = {
  currentNote: object;
};


const IntonationStringDisplay: React.FC<LoadIdProps> = ( {currentNote}) => {
    return(
        <View style={domisStyle.currentNoteContainer}>
            {currentNote ? (
            <>
                <Text style={domisStyle.currentNoteText}>{currentNote.noteName}</Text>
                <Text style={domisStyle.centsDifferenceText}>
                {formatCentsDifference(currentNote.centsDifference)}
                </Text>
            </>
            ) : (
            <Text style={domisStyle.noNoteText}>No note playing</Text>
            )}
        </View>
    )
};

export default IntonationStringDisplay;