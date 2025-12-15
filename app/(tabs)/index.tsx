import { offers, images } from "@/constants";
import { Fragment, useState, useEffect } from "react";
import { FlatList, Pressable, View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import cn from "clsx";
import CartButton from "@/components/CartButton";
import useAuthStore from "@/store/auth.store";
import * as Location from 'expo-location';

export default function Index() {
  const { user } = useAuthStore();
  const [location, setLocation] = useState<string>("Silchar");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (address) {
        const locationName = address.city || address.subregion || address.region || 'Unknown Location';
        setLocation(locationName);
        Alert.alert('Location Updated', `Delivering to ${locationName}`);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to get current location. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      <FlatList
        data={offers}
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;

          return (
            <View>
              <Pressable 
                className={cn("offer-card", isEven ? 'flex-row-reverse' : 'flex-row')} 
                style={{
                  backgroundColor: item.color
                }}
                android_ripple={{ color: "#ffff2" }}
                onPress={() => router.push(`/marketplace/${item.id}`)}
              >
                {({ pressed }) => (
                  <Fragment>
                    <View className={"h-full w-1/2"}>
                      <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                    </View>

                    <View className={cn("offer-card__info", isEven ? 'pl-10' : 'pr-10')}>
                      <Text className="h1-bold text-white leading-tight">
                        {item.title}
                      </Text>
                      <Image
                        className="size-10"
                        resizeMode="contain"
                        tintColor={"#ffffff"}
                        source={images.arrowRight}
                      />
                    </View>
                  </Fragment>
                )}
              </Pressable>
            </View>
          )
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={() => (
          <View>
            {/* Welcome Header */}
            <View className="flex-row items-center justify-between py-5">
              <View className="flex-1">
                <Text className="small-bold text-gray-400">{getGreeting()}</Text>
                <Text className="h2-bold text-dark-100">
                  Hello, {user?.firstName || user?.username || 'Guest'}!
                </Text>
              </View>
              <CartButton/>
            </View>

            {/* Delivery Location */}
            <View className="flex-start mb-5">
              <Text className="small-bold text-primary">DELIVER TO</Text>
              <View className="flex-row items-center gap-x-3 mt-0.5">
                <TouchableOpacity className="flex-center flex-row gap-x-1">
                  <Text className="paragraph-bold text-dark-100">{location}</Text>
                  <Image source={images.arrowDown}
                    className="size-3"
                    resizeMode="contain" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="flex-row items-center gap-x-1.5 bg-primary px-3 py-2 rounded-full"
                  activeOpacity={0.7}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                     
                      <Text className="small-semibold text-sm text-white">Use Current Location</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

    </SafeAreaView>
  );
}
