import { View, Text, StyleSheet } from 'react-native';

interface DividerProps {
  text?: string;
  color?: string;
  thickness?: number;
  marginVertical?: number;
}

export const Divider = ({
  text,
  color = '#E5E7EB',
  thickness = 1,
  marginVertical = 16,
}: DividerProps) => {
  if (text) {
    return (
      <View style={[styles.containerWithText, { marginVertical }]}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={styles.text}>{text}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  text: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
