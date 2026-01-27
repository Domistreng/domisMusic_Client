import React, { useMemo } from 'react';

import {
  View,
  Text,
  Dimensions,
} from 'react-native';
import Svg, { Polyline, Line } from 'react-native-svg';

import domisStyle from '../domisStyles';

type VolumeSample = { t: number; v: number };

type LoadIdProps = {
  currentAudioValue: number | null;
  currentAudioLabel: string | null;
  positionSeconds: number;
  samples: VolumeSample[];
};



const DynamicsStringDisplay: React.FC<LoadIdProps> = ( {currentAudioValue, currentAudioLabel, positionSeconds, samples}) => {

    const WINDOW_SECONDS = 5;
    const { width } = Dimensions.get('window');
    const GRAPH_WIDTH = width * 0.35;
    const GRAPH_HEIGHT = 80;

    const { windowedSamples, minV, maxV, minT, maxT } = useMemo(() => {
        const minT = positionSeconds - WINDOW_SECONDS;
        const maxT = positionSeconds + WINDOW_SECONDS;
        const windowed = samples.filter(s => s.t >= minT && s.t <= maxT).sort((a, b) => a.t - b.t);

        if (windowed.length === 0) {
            return {
                windowedSamples: [],
                minV: -3,
                maxV: 3,
                minT,
                maxT,
            };
        }

        const vs = windowed.map(s => s.v);
        const minV = Math.min(...vs);
        const maxV = Math.max(...vs);

        return {
            windowedSamples: windowed,
            minV: minV === maxV ? minV - 1 : minV,
            maxV: minV === maxV ? maxV + 1 : maxV,
            minT,
            maxT,
        };
    }, [samples, positionSeconds]);

    const polylinePoints = windowedSamples.map(s => {
      const xNorm = (s.t - minT) / (maxT - minT || 1); // 0–1
      const yNorm = (s.v - minV) / (maxV - minV || 1); // 0–1
      const x = xNorm * GRAPH_WIDTH;
      const y = GRAPH_HEIGHT - yNorm * GRAPH_HEIGHT; // invert Y
      return `${x},${y}`;
    }).join(' ');

    // X position of current time (center of window)
    const currentX =
        ((positionSeconds - minT) / (maxT - minT || 1)) * GRAPH_WIDTH;
                
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

            <Svg
                width={GRAPH_WIDTH}
                height={GRAPH_HEIGHT}
                style={{ marginLeft: 8 }}
            >
            {/* Volume line */}
            {polylinePoints.length > 0 && (
                <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth={2}
                />
            )}

            {/* Center time cursor */}
            <Line
                x1={currentX}
                x2={currentX}
                y1={0}
                y2={GRAPH_HEIGHT}
                stroke="red"
                strokeWidth={1}
            />
        </Svg>
    </View>
  );
};

export default DynamicsStringDisplay;