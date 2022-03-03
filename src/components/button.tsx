import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts} from '../utils';

interface TProps {
  title: string;
  style?: any;
  styleTitle?: any;
  loading?: boolean;
  disabled?: boolean;
}

export const Btn: React.FC<TProps & TouchableOpacityProps> = ({
  title,
  style,
  loading = false,
  styleTitle,
  disabled,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.root, {opacity: disabled ? 0.5 : 1}, style]}
      activeOpacity={disabled ? 1 : 0.8}
      {...props}>
      <LinearGradient
        colors={['#4E9F3D', '#1E5128']}
        style={styles.linearGradient}>
        {loading ? (
          <ActivityIndicator
            color="white"
            style={{transform: [{scale: 0.9}]}}
          />
        ) : props.children ? (
          props.children
        ) : (
          <Text style={[styles.title, styleTitle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: {
    height: 44,
    borderRadius: 7,
  },
  linearGradient: {
    flex: 1,
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#D8E9A8',
  },
});
