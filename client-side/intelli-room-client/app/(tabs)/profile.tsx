import React from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthButton from '../../components/AuthButton';
import InputField from '../../components/InputField';
import { icons } from '../../constants/icons';

const profilePicture = require('../../assets/images/profilepic.png');

const Profile = () => {
  const handleConfirm = () => {
    console.log('Profile updated!');
  };

  const handleEditPicture = () => {
    console.log('Edit profile picture');
  };

  return (
    <ScrollView className="flex-1 bg-backgroundclr pt-16" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="items-center mb-8">
        <View className="relative w-32 h-32 rounded-full mb-4">
          <Image
            source={profilePicture}
            className="w-full h-full"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={handleEditPicture}
            className="absolute bottom-0 right-[-4] p-2 bg-primary rounded-full"
          >
            <Image
              source={icons.edit}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text className="text-primary text-2xl font-cinzel-bold">
          Edit Profile
        </Text>
      </View>

      <View className="bg-white rounded-t-3xl pt-8 px-4">
        <View className="w-full">
          <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
            First Name
          </Text>
          <InputField placeholder="Joelle" />
          
          <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
            Last Name
          </Text>
          <InputField placeholder="Tabet" />

          <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
            Email
          </Text>
          <InputField placeholder="JoelleTabet@mail.com" />
          
          <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
            New Password
          </Text>
          <InputField placeholder="New Password" secureTextEntry />
          
          <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
            Phone Number
          </Text>
          <InputField placeholder="+961 03 123 456" />
        </View>

        <AuthButton
          text="Confirm"
          variant="primary"
          onPress={handleConfirm}
        />
      </View>
    </ScrollView>
  );
};

export default Profile;