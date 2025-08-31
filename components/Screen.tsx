// components/Screen.tsx
import React from 'react';
import { SafeAreaView, View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
  style?: ViewStyle;
};

export default function Screen({ children, scroll = false, center = false, style }: Props) {
  const content = (
    <View style={[styles.content, center && styles.center, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
            {content}
          </ScrollView>
        ) : content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg, // antes xl
    paddingTop: SPACING.lg
  },
  center: { alignItems: 'center', justifyContent: 'center' }
});
