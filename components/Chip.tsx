import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: string;
  closable?: boolean;
  onClose?: () => void;
}

export const Chip = ({
  label,
  selected = false,
  onPress,
  variant = 'default',
  icon,
  closable = false,
  onClose,
}: ChipProps) => {
  const getVariantStyle = () => {
    if (selected) return styles.selected;
    switch (variant) {
      case 'success': return styles.success;
      case 'warning': return styles.warning;
      case 'danger': return styles.danger;
      default: return styles.default;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, getVariantStyle()]}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, selected && styles.selectedText]}>
        {label}
      </Text>
      {closable && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  default: {
    backgroundColor: '#F3F4F6',
  },
  selected: {
    backgroundColor: '#057642',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  selectedText: {
    color: 'white',
  },
  icon: {
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 4,
    padding: 2,
  },
  closeIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
});
