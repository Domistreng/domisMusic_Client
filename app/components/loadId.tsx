import { Text, View } from '@/components/Themed';
import React, { useEffect, useContext } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../userContext';
import 'react-native-get-random-values'; // needed for UUID in React Native
import { v4 as uuidv4 } from 'uuid';

import { domisStyle } from '../domisStyles.js';

const UNIQUE_ID_KEY = 'userUniqueId';

const LoadId: React.FC = () => {
  const { uniqueId, setUniqueId } = useContext(UserContext);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function loadOrCreateUniqueId() {
      try {
        const storedId = await AsyncStorage.getItem(UNIQUE_ID_KEY);
        if (storedId) {
          setUniqueId(storedId);
        } else {
          const newId = uuidv4();
          await AsyncStorage.setItem(UNIQUE_ID_KEY, newId);
          setUniqueId(newId);
        }
      } catch (e) {
        console.error('Failed to load or create uniqueId', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrCreateUniqueId();
  }, []);

  if (loading) {
    return (
      <View style={domisStyle.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  return (
    <View>
        {uniqueId && <Text style={domisStyle.userIdText}>userId: {uniqueId}</Text>}
    </View>
  )

}

export default LoadId;