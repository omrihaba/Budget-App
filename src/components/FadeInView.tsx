import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface Props {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function FadeInView({ delay = 0, style, children }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[style, {
      opacity: anim,
      transform: [{
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }),
      }],
    }]}>
      {children}
    </Animated.View>
  );
}
