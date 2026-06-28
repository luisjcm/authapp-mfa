// src/components/ui/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps 
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../src/theme';

// 1. Tipado estricto: Extendemos las propiedades nativas de un botón en React Native
interface ButtonProps extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
}

export default function Button({
  label,
  isLoading = false,
  variant = 'primary',
  style,
  disabled,
  ...rest
}: ButtonProps) {
  
  // 2. Lógica dinámica de colores basada en el tema centralizado
  const getBgColor = () => {
    if (disabled) return COLORS.border;
    if (variant === 'danger') return COLORS.danger;
    if (variant === 'outline') return 'transparent';
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    if (variant === 'outline') return COLORS.primary;
    return COLORS.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBgColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
      // Si la app está procesando una petición HTTP, bloqueamos el botón automáticamente
      disabled={disabled || isLoading} 
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        // Spinner de carga nativo
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.label, { color: getTextColor() }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // 🍏🤖 Estándar de accesibilidad internacional para áreas táctiles móviles
    width: '100%',
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});