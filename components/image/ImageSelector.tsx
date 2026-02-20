import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Button, Image, StyleSheet, View } from "react-native";

export default function ImageSelector({ onImageSelected, image }: any) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Choisir une image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 20 },
  image: { width: 300, height: 200, marginTop: 10, resizeMode: "contain" },
});
