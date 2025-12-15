import {View, KeyboardAvoidingView, Platform, ScrollView, Dimensions, ImageBackground, Image, Text} from 'react-native'
import {Redirect, Slot} from "expo-router";
import {images} from "@/constants";
import useAuthStore from "@/store/auth.store";

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Wait for auth state to load before redirecting
    if(isLoading) return null;
    
    if(isAuthenticated) return <Redirect href="/" />

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* Dark Header with Image */}
                <View className="relative" style={{ height: Dimensions.get('screen').height * 0.4 }}>
                    <ImageBackground source={images.loginGraphic} className="size-full" resizeMode="cover">
                        {/* Dark Overlay */}
                        <View className="absolute inset-0 bg-black/40" />
                        
                        {/* Logo */}
                        <View className="absolute top-12 left-5">
                            <Image source={images.logo} className="w-16 h-16" resizeMode="contain" />
                        </View>
                        
                        {/* Welcome Text */}
                        <View className="absolute bottom-8 left-5 right-5">
                            <Text className="text-3xl font-bold text-white mb-2">
                                Get Started now
                            </Text>
                            <Text className="text-base text-white/90">
                                Create an account or log in to explore
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
                
                <Slot />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
