import React from "react";
import { Image, View } from "react-native";

const TabIcon = ({ focused, icon }: any) => {
  const tintColor = focused ? "#548E32" : "#FEF7E5";

  return (
    <View
      className={
        focused
          ? "flex-1 justify-center items-center min-w-20 min-h-14 mt-2"
          : "flex-1 size-full justify-center items-center mt-2"
      }
    >
      <Image
        source={icon}
        style={{ tintColor: tintColor }}
        className="size-7"
      />
    </View>
  );
};

export default TabIcon;
