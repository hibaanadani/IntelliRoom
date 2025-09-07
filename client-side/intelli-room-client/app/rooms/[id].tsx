import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const RoomDetails = () => {
    const { id } = useLocalSearchParams();
    return (
        <View>
            <Text>RoomDetails: {id}</Text>
        </View>
  )
} 

export default RoomDetails;

const styles = StyleSheet.create({})