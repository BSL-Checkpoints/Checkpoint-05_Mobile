/**
 * Botão de favoritar (RF-50): ação SEM navegação, então precisa de confirmação visual.
 *   full     o coração "pula" com uma mola e preenche
 *   reduced  o coração preenche e pisca (fade), sem pulo
 *   off      o coração preenche e muda de cor
 * Em todos, o coração troca de ♡ para ♥ e de cor.
 */
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useFavorites } from '@/contexts/FavoritesContext';
import { MOTION, useMotionMode } from '@/lib/motion';
import { COLORS } from '@/styles/style';

interface Props {
  productId: string;
  productName: string;
  style?: StyleProp<ViewStyle>;
}

export function FavoriteButton({ productId, productName, style }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(productId);
  const mode = useMotionMode();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function handlePress() {
    toggle({ id: productId, name: productName });

    if (mode === 'full') {
      scale.value = withSequence(withSpring(MOTION.pop.scale, MOTION.pop.up), withSpring(1, MOTION.pop.settle));
    } else if (mode === 'reduced') {
      opacity.value = withSequence(
        withTiming(MOTION.press.dimOpacity, { duration: MOTION.press.dimMs, reduceMotion: ReduceMotion.Never }),
        withTiming(1, { duration: MOTION.pop.flashMs, reduceMotion: ReduceMotion.Never }),
      );
    }
    // 'off': sem animação. A troca de ♡ para ♥ e de cor já confirma a ação.
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={[styles.badge, style]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Animated.Text style={[styles.heart, active && styles.heartActive, heartStyle]}>
        {active ? '♥' : '♡'}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: { fontSize: 16, color: COLORS.primary },
  heartActive: { color: '#e11d48' },
});
