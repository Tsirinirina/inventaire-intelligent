import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  onPress,
  title,
}: {
  onPress: () => void;
  title: string;
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF", // Button background color
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    borderRadius: 8, // Rounded corners
    alignItems: "center", // Center child text horizontally
    justifyContent: "center", // Center child text vertically
    shadowColor: "#000", // Add shadow for depth (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Add shadow for depth (Android)
  },
  buttonText: {
    color: "#FFFFFF", // Text color
    fontSize: 16, // Text size
    fontWeight: "600", // Text weight
    textTransform: "uppercase", // Uppercase text
  },
});

export default CustomButton;
