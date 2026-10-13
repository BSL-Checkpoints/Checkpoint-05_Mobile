/**
 * Ponto de entrada (SEMANA 3 — Checkout e Pedidos).
 *
 * GUARDA DE ROTAS (backend): a sessão diz se há login; conforme isso, montamos
 * o stack de autenticação (SignIn/SignUp) ou o do app. Trocar o login/logout
 * re-renderiza e o stack certo aparece sozinho — não empurramos telas na mão.
 *
 * O stack do app ganhou as telas de compra: Checkout -> Order -> Orders.
 */
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { queryClient } from '@/lib/queryClient';
import { SessionProvider, useSession } from '@/session/session';
import { SignInScreen } from '@/screens/SignInScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { ProductsScreen } from '@/screens/ProductsScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { CartScreen } from '@/screens/CartScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen';
import { OrderScreen } from '@/screens/OrderScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { ReviewFormScreen } from '@/screens/ReviewFormScreen';
import { PickupPointsScreen } from '@/screens/PickupPointsScreen';
import type { AuthStackParamList, RootStackParamList } from '@/navigation';
import { COLORS } from '@/styles/style';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function AppFlow() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.white },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { color: COLORS.black, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AppStack.Screen name="Products" component={ProductsScreen} options={{ title: 'Tech Lab' }} />
      <AppStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <AppStack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <AppStack.Screen name="Order" component={OrderScreen} options={{ title: 'Pedido' }} />
      <AppStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Meus pedidos' }} />
      <AppStack.Screen name="ReviewForm" component={ReviewFormScreen} options={{ title: 'Avaliar produto' }} />
      <AppStack.Screen name="PickupPoints" component={PickupPointsScreen} options={{ title: 'Retirada' }} />
    </AppStack.Navigator>
  );
}

/** A guarda: escolhe o stack conforme o login. */
function RootNavigator() {
  const { isLoggedIn } = useSession();
  return isLoggedIn ? <AppFlow /> : <AuthFlow />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}