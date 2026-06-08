import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import DashboardScreen   from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BillsScreen       from '../screens/BillsScreen';
import GoalsScreen       from '../screens/GoalsScreen';
import WalletScreen      from '../screens/WalletScreen';

const Tab = createBottomTabNavigator();

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, [IconName, IconName]> = {
  Dashboard:    ['home',         'home-outline'],
  Transactions: ['receipt',      'receipt-outline'],
  Bills:        ['calendar',     'calendar-outline'],
  Goals:        ['flag',         'flag-outline'],
  Wallet:       ['wallet',       'wallet-outline'],
};

export default function TabNavigator() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.tabBorder,
        },
        tabBarActiveTintColor:   c.primary,
        tabBarInactiveTintColor: c.secondaryText,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? icons[0] : icons[1]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"    component={DashboardScreen}    />
      <Tab.Screen name="Transactions" component={TransactionsScreen}  />
      <Tab.Screen name="Bills"        component={BillsScreen}         />
      <Tab.Screen name="Goals"        component={GoalsScreen}         />
      <Tab.Screen name="Wallet"       component={WalletScreen}        />
    </Tab.Navigator>
  );
}
