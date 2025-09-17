import React, { useEffect, useRef } from "react";
import { View, Animated, Image } from "react-native";
import { icons } from "../../constants/icons.ts";

const TypingIndicator = () => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const animationSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),

          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),

          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

      animationSequence.start();
    };

    animateDots();

    return () => {
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View className="flex-row items-start mb-4">
      <Image source={icons.chatbot} className="w-6 h-6 mr-2" />
      <View className="bg-beigeclr p-3 rounded-lg flex-row items-center">
        <Animated.Text
          className="text-gray-600 font-bold text-base"
          style={{ opacity: dot1Opacity }}
        >
          .
        </Animated.Text>
        <Animated.Text
          className="text-gray-600 font-bold text-base"
          style={{ opacity: dot2Opacity }}
        >
          .
        </Animated.Text>
        <Animated.Text
          className="text-gray-600 font-bold text-base"
          style={{ opacity: dot3Opacity }}
        >
          .
        </Animated.Text>
      </View>
    </View>
  );
};

export default TypingIndicator;
