// components/OTPInput.tsx
import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

type Props = {
  length?: number;
  onChangeCode?: (code: string) => void;
  onFulfill?: (code: string) => void;
  autoFocus?: boolean;
  size?: number;   // tamaño deseado (se usa si fit=false)
  gap?: number;    // espacio entre cajas
  fit?: boolean;   // ⬅️ NUEVO: ajusta el tamaño para que quepa en el ancho disponible
  minSize?: number; // tamaño mínimo al autoajustar
    error?: boolean;      // ← NUEVO

};

export default function OTPInput({
  length = 6,
  onChangeCode,
  onFulfill,
  autoFocus = true,
  size = 48,
  gap = SPACING.sm,
  fit = false,
  minSize = 40,
    error = false,

}: Props) {
  const [values, setValues] = React.useState<string[]>(
    Array.from({ length }, () => '')
  );
  const [focused, setFocused] = React.useState<number | null>(null);
  const refs = React.useRef<(TextInput | null)[]>(
    Array.from({ length }, () => null)
  );

  // ancho del contenedor para calcular el tamaño efectivo
  const [containerW, setContainerW] = React.useState(0);

const onChangeRef = React.useRef(onChangeCode);
const onFulfillRef = React.useRef(onFulfill);

React.useEffect(() => { onChangeRef.current = onChangeCode; }, [onChangeCode]);
React.useEffect(() => { onFulfillRef.current = onFulfill; }, [onFulfill]);

  const effSize = React.useMemo(() => {
    if (!fit || containerW === 0) return size;
    const available = containerW; // ya incluye padding de Screen
    const maxBox = Math.floor((available - gap * (length - 1)) / length);
    return Math.max(Math.min(size, maxBox), minSize);
  }, [fit, containerW, size, gap, length, minSize]);

  React.useEffect(() => {
  const code = values.join('');
  onChangeRef.current?.(code);
  if (code.length === length && values.every(v => v !== '')) {
    onFulfillRef.current?.(code);
  }
}, [values, length]);

  const setDigit = (index: number, text: string) => {
    const clean = text.replace(/\D/g, '');
    setValues(prev => {
      const next = [...prev];

      if (clean.length > 1) {
        const chars = clean.slice(0, length).split('');
        for (let i = 0; i < length; i++) next[i] = chars[i] ?? '';
        const last = Math.min(chars.length, length) - 1;
        if (last >= 0) refs.current[last]?.focus();
        return next;
      }

      next[index] = clean;
      if (clean && index < length - 1) refs.current[index + 1]?.focus();
      return next;
    });
  };

  const onKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      setValues(prev => {
        const next = [...prev];
        if (next[index] === '' && index > 0) {
          refs.current[index - 1]?.focus();
          next[index - 1] = '';
        } else {
          next[index] = '';
        }
        return next;
      });
    }
  };

  return (
    <View
      style={[styles.row, { columnGap: gap }]}
      onLayout={e => setContainerW(e.nativeEvent.layout.width)} // ⬅️ detecta ancho disponible
    >
      {values.map((val, i) => (
        <TextInput
          key={i}
          ref={el => { refs.current[i] = el; }}
          value={val}
          onChangeText={t => setDigit(i, t)}
          onKeyPress={e => onKeyPress(i, e)}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(null)}
          maxLength={1}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          caretHidden
          selectionColor={COLORS.primary}
          style={[
            styles.box,
            {
              width: effSize,
              height: effSize + 4,
              borderColor: error
                ? '#ef4444'                          // ← si error, rojo
                : (focused === i ? COLORS.primary : COLORS.border),
              backgroundColor: COLORS.card,
            },
          ]}
          placeholder="•"
          placeholderTextColor={COLORS.muted}
          returnKeyType="done"
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',                       // ⬅️ ocupa todo el ancho disponible
    flexDirection: 'row',
    justifyContent: 'center',            // con columnGap mantiene espacios iguales
  },
  box: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    textAlign: 'center',
    fontFamily: FONTS.semibold,
    fontSize: 20,
    color: COLORS.text,
    paddingVertical: 10,
  },
});
