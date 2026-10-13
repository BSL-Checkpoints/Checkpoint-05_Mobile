/** Estrelas de nota: `Stars` só exibe, `StarsInput` deixa escolher de 1 a 5. */
import { Pressable, StyleSheet, Text, View } from 'react-native';

const STAR_COLOR = '#fcd735';
const STAR_OFF = '#D4D4D8';

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <View style={styles.row} accessibilityLabel={`Nota ${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={{ fontSize: size, color: n <= filled ? STAR_COLOR : STAR_OFF }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export function StarsInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          disabled={disabled}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
        >
          <Text style={[styles.input, { color: n <= value ? STAR_COLOR : STAR_OFF }]}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
  input: { fontSize: 38 },
});