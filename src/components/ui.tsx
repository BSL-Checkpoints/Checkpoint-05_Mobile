/** Componentes de UI mínimos e reutilizados pelas telas. Nada de framework. */
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PressableScale } from '@/components/PressableScale';
import { MOTION, useMotionMode } from '@/lib/motion';

/** Campo de texto padronizado (usado nas telas de login/cadastro). */
export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor="#9ca3af" style={styles.input} {...props} />;
}

/** Etiqueta colorida — usada para o status do pedido. */
export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

/**
 * Carregamento com "sinal de vida" (RF-53): três pontos que pulsam em sequência.
 * No modo reduzido/desligado ficam só o indicador nativo e o texto, sem pulsar.
 */
export function Loading({ label = 'Carregando…' }: { label?: string }) {
  const mode = useMotionMode();
  return (
    <Center>
      <ActivityIndicator size="large" />
      {mode === 'full' && (
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <PulseDot key={i} delay={i * MOTION.loading.dotGapMs} />
          ))}
        </View>
      )}
      <Text style={styles.muted}>{label}</Text>
    </Center>
  );
}

function PulseDot({ delay }: { delay: number }) {
  const opacity = useSharedValue<number>(MOTION.loading.dimOpacity);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: MOTION.loading.dotMs }),
          withTiming(MOTION.loading.dimOpacity, { duration: MOTION.loading.dotMs }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Estado de erro com botão de tentar de novo (ex.: refetch de uma query). */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Center>
      <Text style={styles.errorTitle}>Algo deu errado</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry && (
        <Button label="Tentar de novo" onPress={onRetry} />
      )}
    </Center>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, variant === 'ghost' && styles.btnGhost, disabled && styles.btnDim]}
    >
      <Text style={[styles.btnText, variant === 'ghost' && styles.btnTextGhost]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7E61D5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  muted: { color: '#6b7280', textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#b91c1c' },
  btn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#d1d5db' },
  btnDim: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextGhost: { color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
