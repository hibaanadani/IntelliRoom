import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const TabIcon = ({focused, icon, title}: any) => {
  const tintColor = focused ? '#548E32' : '#FEF7E5';

  if (focused) {
    return (
      <View
        className="flex-1 justify-center items-center bg-secondary min-w-20 min-h-14 mt-2"      >
        <Image 
          source={icon} 
          // style={{ tintColor: tintColor }}
          className="size-7 " 
        />
      </View>
    );
  }
  
  return (
    <View className='flex-1 size-full justify-center items-center mt-2'>
      <Image 
        source={icon} 
        style={{ tintColor: tintColor }}
        className='size-7'
      />
    </View>
  );
}

export default TabIcon

const styles = StyleSheet.create({});
