/**
 * Pressable que RESPONDE AO TOQUE (RF-49).
 *   full     afunda com uma mola
 *   reduced  escurece com um fade curto (sem movimento)
 *   off      escurece na hora (sem animação)
 * Nos três o usuário vê que o toque foi recebido — o feedback nunca some.
 */
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { MOTION, useMotionMode } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({ style, onPressIn, onPressOut, ...rest }: Props) {
  const mode = useMotionMode();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function feedback(pressed: boolean) {
    if (mode === 'full') {
      scale.value = withSpring(pressed ? MOTION.press.scale : 1, MOTION.press.spring);
    } else if (mode === 'reduced') {
      opacity.value = withTiming(pressed ? MOTION.press.dimOpacity : 1, {
        duration: MOTION.press.dimMs,
        reduceMotion: ReduceMotion.Never,
      });
    } else {
      opacity.value = pressed ? MOTION.press.dimOpacity : 1;
    }
  }

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(event: GestureResponderEvent) => {
        feedback(true);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        feedback(false);
        onPressOut?.(event);
      }}
    />
  );
}
