import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getGalleryById } from "../services/gallary.service";
import { Gallery as GalleryInterface } from "../interfaces/gallery.interface";
import Pdf from "react-native-pdf";

const Catalogue = () => {
  const { galleryId } = useLocalSearchParams();
  const [gallery, setGallery] = useState<GalleryInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!galleryId) {
      setLoading(false);
      return;
    }

    const fetchGallery = async () => {
      try {
        const data = await getGalleryById(galleryId as string);
        setGallery(data);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [galleryId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8C3B1E" />
        <Text style={styles.loadingText}>Loading Catalogue...</Text>
      </View>
    );
  }

  if (!gallery?.catalogue) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          No catalogue available for this gallery.
        </Text>
      </View>
    );
  }

  const pdfSource = {
    uri: `${process.env.EXPO_PUBLIC_API_URL}/${gallery.catalogue}`,
  };

  return (
    <View style={styles.pdfContainer}>
      <Pdf
        source={pdfSource}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pdfContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF5EE",
  },
  loadingText: {
    marginTop: 10,
    color: "#8C3B1E",
    fontFamily: "cinzel-bold",
  },
  errorText: {
    fontSize: 20,
    fontFamily: "cinzel-bold",
    color: "#8C3B1E",
    textAlign: "center",
  },
});

export default Catalogue;
