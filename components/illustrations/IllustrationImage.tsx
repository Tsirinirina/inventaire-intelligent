import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface IllustrationImageProps {
  uri: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export default function IllustrationImage({
  uri,
  width = 200,
  height = 200,
  style,
}: IllustrationImageProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={{ width, height }}
        contentFit="contain"
        transition={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
