// import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import React, { useEffect, useContext } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../userContext';
import 'react-native-get-random-values'; // needed for UUID in React Native
import { v4 as uuidv4 } from 'uuid';
// import * as ScreenOrientation from "expo-screen-orientation";

import LoadId from '../components/loadId';

import { domisStyle } from '../domisStyles.js';


export default function TabOneScreen() {
  
  return (
    <View style={domisStyle.container}>
      <Text style={domisStyle.title}>Welcome to DomisMusic</Text>
      <LoadId/>
      <View style={domisStyle.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}
