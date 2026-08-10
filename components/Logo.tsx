import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: any;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
  const logoSizes = {
    small: { width: 24, height: 24 },
    medium: { width: 40, height: 40 },
    large: { width: 60, height: 60 },
    xlarge: { width: 120, height: 120 }
  };

  return (
    <Image
      source={require('../assets/images/labourbridgelogo.png')}
      style={[styles.logo, logoSizes[size], style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});

export default Logo;