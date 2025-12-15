import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/store/auth.store';
import { images } from '@/constants';
import { updateUser, signOut , storage, appwriteConfig } from '@/lib/appwrite';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ID } from 'react-native-appwrite';

const Profile = () => {
  const { user, setUser, setIsAuthenticated } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || '');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone?.toString() || '',
    address: user?.address || '',
    DOB: user?.DOB || '',
    avatar: user?.avatar || '',
  });

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Sync currentAvatar with user.avatar when user changes
  useEffect(() => {
    if (user?.avatar) {
      console.log('User avatar from state:', user.avatar);
      console.log('Setting avatar from user:', user.avatar);
      setCurrentAvatar(user.avatar);
    }
  }, [user?.avatar]);

  // Debug current state
  useEffect(() => {
    console.log('Current avatar state:', currentAvatar);
    console.log('Current user:', user);
  }, [currentAvatar, user]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    setUploadingImage(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileObj = {
        name: `avatar-${user.$id}-${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: blob.size,
        uri: uri,
      };

      console.log('Uploading file:', fileObj.name);
      const file = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        fileObj as any,
        ['read("any")']  // Grant read permission to anyone
      );

      console.log('File uploaded, ID:', file.$id);

      // Use file view instead of preview (preview requires paid plan for transformations)
      const avatarUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;

      console.log('Generated avatar URL:', avatarUrl);

      // Auto-save avatar
      const updatedUser = await updateUser(user.$id, { avatar: avatarUrl });
      console.log('Updated user avatar in DB:', updatedUser.avatar);
      
      setUser(updatedUser as any);
      setCurrentAvatar(avatarUrl);
      setFormData({ ...formData, avatar: avatarUrl });
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedUser = await updateUser(user.$id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone ? parseInt(formData.phone) : undefined,
        address: formData.address,
        DOB: formData.DOB,
      });

      setUser(updatedUser as any);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              setIsAuthenticated(false);
              setUser(null);
              router.replace('/sign-in');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone?.toString() || '',
      address: user?.address || '',
      DOB: user?.DOB || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#FF6D00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={images.backArrow} className="size-6" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="h3-bold text-dark-100">Profile</Text>
          <TouchableOpacity>
            <Image source={images.search} className="size-6" resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View className="items-center mt-6 mb-8">
          <View className="profile-avatar">
            {uploadingImage ? (
              <View className="size-full rounded-full bg-gray-200 items-center justify-center">
                <ActivityIndicator size="small" color="#FF6D00" />
              </View>
            ) : currentAvatar ? (
              <Image
                key={currentAvatar}
                source={{ uri: currentAvatar }}
                className="size-full rounded-full bg-gray-100"
                resizeMode="cover"
                onLoadStart={() => console.log('Image loading started:', currentAvatar)}
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <View className="size-full rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-2xl text-gray-500">{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
              </View>
            )}
            <TouchableOpacity className="profile-edit" onPress={pickImage} disabled={uploadingImage}>
              <Image
                source={images.edit}
                className="size-4"
                resizeMode="contain"
                tintColor="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Fields */}
        <View className="px-5">
          {/* Full Name */}
          <View className="profile-field">
            <View className="profile-field__icon">
              <Image
                source={images.person}
                className="size-6"
                resizeMode="contain"
                tintColor="#FF6D00"
              />
            </View>
            <View className="flex-1">
              <Text className="small-regular text-gray-200 mb-1">Full Name</Text>
              {isEditing ? (
                <View className="flex-row gap-2">
                  <TextInput
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    className="flex-1 base-semibold text-dark-100 border-b border-gray-300 pb-1"
                    placeholder="First Name"
                  />
                  <TextInput
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    className="flex-1 base-semibold text-dark-100 border-b border-gray-300 pb-1"
                    placeholder="Last Name"
                  />
                </View>
              ) : (
                <Text className="base-semibold text-dark-100">
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`.trim()
                    : user.username}
                </Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View className="profile-field">
            <View className="profile-field__icon">
              <Image
                source={images.email}
                className="size-6"
                resizeMode="contain"
                tintColor="#FF6D00"
              />
            </View>
            <View className="flex-1">
              <Text className="small-regular text-gray-200 mb-1">Email</Text>
              <Text className="base-semibold text-dark-100">{user.email}</Text>
            </View>
          </View>

          {/* Phone Number */}
          <View className="profile-field">
            <View className="profile-field__icon">
              <Image
                source={images.call}
                className="size-6"
                resizeMode="contain"
                tintColor="#FF6D00"
              />
            </View>
            <View className="flex-1">
              <Text className="small-regular text-gray-200 mb-1">Phone number</Text>
              {isEditing ? (
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  className="base-semibold text-dark-100 border-b border-gray-300 pb-1"
                  placeholder="+1 555 123 4567"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="base-semibold text-dark-100">
                  {formData.phone || 'Not provided'}
                </Text>
              )}
            </View>
          </View>

          {/* Address */}
          <View className="profile-field">
            <View className="profile-field__icon">
              <Image
                source={images.location}
                className="size-6"
                resizeMode="contain"
                tintColor="#FF6D00"
              />
            </View>
            <View className="flex-1">
              <Text className="small-regular text-gray-200 mb-1">Address</Text>
              {isEditing ? (
                <TextInput
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  className="base-semibold text-dark-100 border-b border-gray-300 pb-1"
                  placeholder="123 Main Street, Springfield, IL 62704"
                  multiline
                />
              ) : (
                <Text className="base-semibold text-dark-100">
                  {formData.address || 'Not provided'}
                </Text>
              )}
            </View>
          </View>

          {/* Date of Birth */}
          <View className="profile-field">
            <View className="profile-field__icon">
              <Image
                source={images.clock}
                className="size-6"
                resizeMode="contain"
                tintColor="#FF6D00"
              />
            </View>
            <View className="flex-1">
              <Text className="small-regular text-gray-200 mb-1">Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  value={formData.DOB ? new Date(formData.DOB).toISOString().split('T')[0] : ''}
                  onChangeText={(text) => setFormData({ ...formData, DOB: text })}
                  className="base-semibold text-dark-100 border-b border-gray-300 pb-1"
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text className="base-semibold text-dark-100">
                  {formatDate(formData.DOB)}
                </Text>
              )}
            </View>
          </View>

          {/* Buttons */}
          {isEditing ? (
            <View className="mt-8 mb-6 gap-4">
              <TouchableOpacity
                className="custom-btn"
                onPress={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="base-bold text-white">Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="border-2 border-gray-300 rounded-full p-3"
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text className="base-bold text-dark-100 text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-8 mb-6 gap-4">
              <TouchableOpacity
                className="border-2 border-primary rounded-full p-3"
                onPress={() => setIsEditing(true)}
              >
                <Text className="base-bold text-primary text-center">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border-2 border-red-500 rounded-full p-3"
                onPress={handleLogout}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Image
                    source={images.logout}
                    className="size-5"
                    resizeMode="contain"
                    tintColor="#EF4444"
                  />
                  <Text className="base-bold text-red-500">Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;