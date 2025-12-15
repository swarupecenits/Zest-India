import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import {useCartStore} from "@/store/cart.store";
import CustomHeader from "@/components/CustomHeader";
import cn from "clsx";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import { router } from 'expo-router';
import { images } from '@/constants';

const PaymentInfoStripe = ({ label,  value,  labelStyle,  valueStyle, icon }: PaymentInfoStripeProps & { icon?: any }) => (
    <View className="flex-between flex-row my-2 items-center">
        {icon && (
            <View className="mr-2">
                <Image source={icon} className="w-5 h-5" resizeMode="contain" tintColor="#FF6D00" />
            </View>
        )}
        <Text className={cn("paragraph-medium text-gray-200 flex-1", labelStyle)}>
            {label}
        </Text>
        <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
            {value}
        </Text>
    </View>
);

const Cart = () => {
    const { items, getTotalItems, getTotalPrice } = useCartStore();

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={items}
                renderItem={({ item }) => <CartItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerClassName="pb-32 px-5 pt-5"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View className="mb-4">
                        <CustomHeader title="Your Cart" />
                        
                        {/* Order History Button */}
                        <TouchableOpacity
                            className="bg-primary/10 border border-primary/30 rounded-2xl py-4 px-5 mt-4 mb-2 flex-row items-center justify-between"
                            onPress={() => router.push('/orders/history')}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="mr-3">
                                    <Image source={images.clock} className="w-6 h-6" resizeMode="contain" tintColor="#FF6D00" />
                                </View>
                                <View className="flex-1">
                                    <Text className="base-semibold text-dark-100">Order History</Text>
                                    <Text className="small-regular text-gray-200">View your past orders</Text>
                                </View>
                            </View>
                            <Image source={images.arrowRight} className="w-5 h-5" resizeMode="contain" tintColor="#FF6D00" />
                        </TouchableOpacity>
                        
                        {totalItems > 0 && (
                            <View className="mt-6 mb-3">
                                <Text className="h3-bold text-dark-100">Cart Items ({totalItems})</Text>
                            </View>
                        )}
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-20">
                        <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-6">
                            <Image source={images.bag} className="w-16 h-16" resizeMode="contain" tintColor="#D1D5DB" />
                        </View>
                        <Text className="h3-bold text-gray-300 mb-2">Your Cart is Empty</Text>
                        <Text className="paragraph-regular text-gray-200 text-center px-8 mb-8">
                            Looks like you haven&apos;t added anything to your cart yet
                        </Text>
                        <CustomButton 
                            title="Browse Menu" 
                            onPress={() => router.push('/(tabs)')}
                        />
                    </View>
                )}
                ListFooterComponent={() => totalItems > 0 && (
                    <View className="gap-5 mt-4">
                        {/* Payment Summary Card */}
                        <View className="border-2 border-gray-200 p-6 rounded-3xl bg-white shadow-sm">
                            <View className="flex-row items-center mb-6">
                                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Image source={images.dollar} className="w-5 h-5" resizeMode="contain" tintColor="#FF6D00" />
                                </View>
                                <Text className="h3-bold text-dark-100">
                                    Payment Summary
                                </Text>
                            </View>

                            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                                <PaymentInfoStripe
                                    icon={images.bag}
                                    label={`Items (${totalItems})`}
                                    value={`₹${totalPrice.toFixed(2)}`}
                                />
                                <PaymentInfoStripe
                                    icon={images.location}
                                    label="Delivery Fee"
                                    value="₹5.00"
                                />
                                <PaymentInfoStripe
                                    icon={images.star}
                                    label="Discount"
                                    value="- ₹0.50"
                                    valueStyle="!text-green-600"
                                />
                            </View>
                            
                            <View className="border-t-2 border-dashed border-gray-300 my-4" />
                            
                            <View className="flex-row items-center justify-between bg-primary/5 p-4 rounded-2xl">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">
                                        <Image source={images.check} className="w-4 h-4" resizeMode="contain" tintColor="#FFFFFF" />
                                    </View>
                                    <Text className="base-bold text-dark-100">Total Amount</Text>
                                </View>
                                <Text className="h3-bold text-primary">
                                    ₹{(totalPrice + 5 - 0.5).toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        {/* Order Now Button */}
                        <View className="bg-gradient-to-r">
                            <CustomButton 
                                title="Proceed to Checkout" 
                                onPress={() => {
                                    const finalTotal = totalPrice + 5 - 0.5;
                                    router.push(`/payment/checkout?total=${finalTotal}`);
                                }} 
                            />
                        </View>
                        
                        {/* Security Badge */}
                        <View className="flex-row items-center justify-center py-2">
                            <Image source={images.check} className="w-4 h-4 mr-2" resizeMode="contain" tintColor="#10B981" />
                            <Text className="small-regular text-gray-200">Secure Payment Processing</Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

export default Cart
