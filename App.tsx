import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { DataProvider } from './src/contexts/DataContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  const scheme = useColorScheme();
  return (
    <DataProvider>
      <NavigationContainer>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <TabNavigator />
      </NavigationContainer>
    </DataProvider>
  );
}
