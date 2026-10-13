/** Tipagem das rotas. Dois stacks por causa da guarda:
 *  - deslogado -> AuthStack (SignIn / SignUp)
 *  - logado    -> RootStack (Products / ProductDetail / Cart / ...)
 */
import type { PickupSelection } from '@/types/pickup';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { id: string; name: string };
  Cart: undefined;
  Profile: undefined;
  
  Checkout: { pickupPoint?: PickupSelection } | undefined;
  Order: { id: string };
  Orders: undefined;

  ReviewForm: { productId: string; productName: string };
  PickupPoints: { mode?: 'browse' | 'select'; selectedId?: string } | undefined;
};


