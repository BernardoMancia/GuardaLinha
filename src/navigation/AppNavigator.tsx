import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { RulesScreen } from '../screens/RulesScreen';
import { AddRuleScreen } from '../screens/AddRuleScreen';
import { LogScreen } from '../screens/LogScreen';
import { PermissionScreen } from '../screens/PermissionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🛡️',
  Rules: '🔧',
  Log: '📋',
};

const screenOptions = (route: any, focused: boolean) => {
  const color = focused ? colors.neonGreen : colors.textMuted;
  return {
    tabBarLabel: ({ focused }: any) => (
      <Text style={{ color: focused ? colors.neonGreen : colors.textMuted, fontSize: 10, marginTop: -4 }}>
        {route.name === 'Home' ? 'Início' : route.name === 'Rules' ? 'Regras' : 'Histórico'}
      </Text>
    ),
    tabBarIcon: () => (
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
    ),
  };
};

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0e1118',
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: colors.neonGreen,
      tabBarInactiveTintColor: colors.textMuted,
      ...screenOptions(route, false),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Rules" component={RulesScreen} />
    <Tab.Screen name="Log" component={LogScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="AddRule"
        component={AddRuleScreen}
        options={{
          headerShown: true,
          headerTitle: 'Nova Regra',
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.neonGreen,
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="Permission"
        component={PermissionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Permissão',
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.neonGreen,
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
