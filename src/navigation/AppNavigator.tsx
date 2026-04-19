import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const TAB_LABELS: Record<string, string> = {
  Home: 'Início',
  Rules: 'Regras',
  Log: 'Histórico',
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0e1118',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.neonGreen,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: ({ focused }: any) => (
          <Text style={{ color: focused ? colors.neonGreen : colors.textMuted, fontSize: 10, marginTop: -2, marginBottom: 4 }}>
            {TAB_LABELS[route.name] || route.name}
          </Text>
        ),
        tabBarIcon: ({ focused }: any) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rules" component={RulesScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
    </Tab.Navigator>
  );
};

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
