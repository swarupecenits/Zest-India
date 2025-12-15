import { images } from '@/constants';
import { appwriteConfig, databases } from '@/lib/appwrite';
import { useCartStore } from '@/store/cart.store';
import { CartCustomization } from '@/type';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Customization {
    $id: string;
    name: string;
    price: number;
    type: string;
}

const MenuDetail = () => {
    const { id } = useLocalSearchParams();
    const [menuItem, setMenuItem] = useState<any>(null);
    const [customizations, setCustomizations] = useState<Customization[]>([]);
    const [selectedCustomizations, setSelectedCustomizations] = useState<CartCustomization[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartStore();

    useEffect(() => {
        fetchMenuDetails();
    }, [id]);

    const fetchMenuDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch menu item details
            const menuDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                id as string
            );
            setMenuItem(menuDoc);

            // Fetch customizations for this menu item
            const menuCustomizations = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.menuCustomizationsCollectionId,
                [Query.equal('menu', id as string)]
            );

            // Get full customization details
            const customizationIds = menuCustomizations.documents.map(
                (doc: any) => doc.customizations
            );

            if (customizationIds.length > 0) {
                const customizationDetails = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.customizationsCollectionId,
                    [Query.equal('$id', customizationIds)]
                );
                setCustomizations(customizationDetails.documents as Customization[]);
            }
        } catch (error) {
            console.error('Error fetching menu details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCustomization = (customization: Customization) => {
        setSelectedCustomizations((prev) => {
            const exists = prev.find((c) => c.id === customization.$id);
            if (exists) {
                return prev.filter((c) => c.id !== customization.$id);
            } else {
                return [
                    ...prev,
                    {
                        id: customization.$id,
                        name: customization.name,
                        price: customization.price,
                        type: customization.type,
                    },
                ];
            }
        });
    };

    const isSelected = (customizationId: string) => {
        return selectedCustomizations.some((c) => c.id === customizationId);
    };

    const getTotalPrice = () => {
        if (!menuItem) return 0;
        const basePrice = menuItem.price * quantity;
        const customizationsPrice = selectedCustomizations.reduce(
            (sum, c) => sum + c.price * quantity,
            0
        );
        return basePrice + customizationsPrice;
    };

    const handleAddToCart = () => {
        if (!menuItem) return;

        for (let i = 0; i < quantity; i++) {
            addItem({
                id: menuItem.$id,
                name: menuItem.name,
                price: menuItem.price,
                image_url: menuItem.image_url,
                customizations: selectedCustomizations,
            });
        }

        router.back();
    };

    const toppings = customizations.filter((c) => c.type === 'topping');
    const sides = customizations.filter((c) => c.type === 'side');

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#FF6D00" />
            </SafeAreaView>
        );
    }

    if (!menuItem) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="base-regular text-gray-200">Menu item not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Image
                            source={images.backArrow}
                            className="size-6"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            source={images.search}
                            className="size-6"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                {/* Product Image */}
                <View className="items-center py-5">
                    <Image
                        source={{ uri: menuItem.image_url }}
                        className="w-72 h-72"
                        resizeMode="contain"
                    />
                </View>

                {/* Product Info */}
                <View className="px-5">
                    <Text className="h1-bold text-dark-100 mb-1">{menuItem.name}</Text>
                    <Text className="base-regular text-gray-200 mb-3">
                        {menuItem.description}
                    </Text>

                    {/* Rating */}
                    <View className="flex-row items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Text key={i} className="text-lg mr-1">
                                {i < Math.floor(menuItem.rating) ? '⭐' : '☆'}
                            </Text>
                        ))}
                        <Text className="base-semibold text-dark-100 ml-2">
                            {menuItem.rating}/5
                        </Text>
                    </View>

                    {/* Price */}
                    <Text className="h3-bold text-primary mb-4">₹{menuItem.price}</Text>

                    {/* Nutritional Info */}
                    <View className="flex-row justify-between mb-6">
                        <View className="flex-1">
                            <Text className="small-regular text-gray-200">Calories</Text>
                            <Text className="base-bold text-dark-100">
                                {menuItem.calories} Cal
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="small-regular text-gray-200">Protein</Text>
                            <Text className="base-bold text-dark-100">{menuItem.protein}g</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="small-regular text-gray-200">Fat Type</Text>
                            <Text className="base-bold text-dark-100">Whole Wheat</Text>
                        </View>
                    </View>

                    {/* Delivery Info */}
                    <View className="flex-row items-center mb-6 gap-x-4">
                        <View className="flex-row items-center">
                            <Text className="text-green-600 text-lg mr-1">🚚</Text>
                            <Text className="small-bold text-dark-100">Free Delivery</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-primary text-lg mr-1">⏰</Text>
                            <Text className="small-bold text-dark-100">20 - 30 mins</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-yellow-500 text-lg mr-1">⭐</Text>
                            <Text className="small-bold text-dark-100">4.5</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="base-regular text-gray-200 mb-6 leading-6">
                        {menuItem.description}
                    </Text>

                    {/* Toppings Section */}
                    {toppings.length > 0 && (
                        <View className="mb-6">
                            <Text className="h3-bold text-dark-100 mb-4">Toppings</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {toppings.map((topping) => (
                                    <TouchableOpacity
                                        key={topping.$id}
                                        onPress={() => toggleCustomization(topping)}
                                        className={`px-4 py-3 rounded-full border-2 ${
                                            isSelected(topping.$id)
                                                ? 'bg-primary border-primary'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text
                                            className={`small-bold ${
                                                isSelected(topping.$id)
                                                    ? 'text-white'
                                                    : 'text-dark-100'
                                            }`}
                                        >
                                            {topping.name} +₹{topping.price}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Side Options Section */}
                    {sides.length > 0 && (
                        <View className="mb-6">
                            <Text className="h3-bold text-dark-100 mb-4">Side options</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {sides.map((side) => (
                                    <TouchableOpacity
                                        key={side.$id}
                                        onPress={() => toggleCustomization(side)}
                                        className={`px-4 py-3 rounded-full border-2 ${
                                            isSelected(side.$id)
                                                ? 'bg-primary border-primary'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text
                                            className={`small-bold ${
                                                isSelected(side.$id) ? 'text-white' : 'text-dark-100'
                                            }`}
                                        >
                                            {side.name} +₹{side.price}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Quantity and Add to Cart */}
                    <View className="flex-row items-center justify-between mb-8">
                        <View className="flex-row items-center gap-x-4">
                            <TouchableOpacity
                                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                className="size-10 bg-gray-100 rounded-lg items-center justify-center"
                            >
                                <Text className="h3-bold text-dark-100">−</Text>
                            </TouchableOpacity>
                            <Text className="h3-bold text-dark-100 w-8 text-center">
                                {quantity}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setQuantity((prev) => prev + 1)}
                                className="size-10 bg-gray-100 rounded-lg items-center justify-center"
                            >
                                <Text className="h3-bold text-dark-100">+</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleAddToCart}
                            className="custom-btn flex-1 ml-4"
                        >
                            <Text className="base-bold text-white">
                                Add to cart ₹{getTotalPrice().toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MenuDetail;
