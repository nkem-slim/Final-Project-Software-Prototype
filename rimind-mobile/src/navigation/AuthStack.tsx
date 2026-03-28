import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const S = createNativeStackNavigator();

export function AuthStack() {
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="Login" component={LoginScreen} />
      <S.Screen name="Register" component={RegisterScreen} />
    </S.Navigator>
  );
}
