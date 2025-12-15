import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import { createOrder } from '@/lib/appwrite';
import { images } from '@/constants';

const Checkout = () => {
  const params = useLocalSearchParams();
  const totalAmount = parseFloat(params.total as string);
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Error', 'Please enter transaction ID');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsProcessing(true);
    try {
      // Create order in database
      const orderData = {
        userId: user.$id,
        items: items.map(item => ({
          menuId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || []
        })),
        totalAmount,
        transactionId: transactionId.trim(),
        status: 'pending',
        paymentMethod: 'UPI',
        deliveryAddress: user.address || 'Not provided',
        orderDate: new Date().toISOString(),
      };

      await createOrder(orderData);

      // Clear cart
      clearCart();

      Alert.alert(
        'Order Placed Successfully!',
        'Your order has been placed. You will receive a confirmation shortly.',
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/orders/history'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={images.backArrow} className="size-6" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="h3-bold text-dark-100 ml-4">Payment</Text>
        </View>

        <View className="px-5 py-6">
          {/* Payment Amount */}
          <View className="bg-primary/10 p-6 rounded-2xl mb-6">
            <Text className="small-regular text-gray-200 mb-2">Total Amount</Text>
            <Text className="text-4xl font-bold text-primary">₹{totalAmount.toFixed(2)}</Text>
          </View>

          {/* QR Code Section */}
          <View className="items-center mb-6">
            <Text className="h3-bold text-dark-100 mb-4">Scan QR to Pay</Text>
            <View className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
              <Image
                source={images.swarupQr}
                className="w-52 h-52"
                resizeMode="contain"
              />
            </View>
            <Text className="paragraph-regular text-gray-200 mt-4 text-center">
              Scan this QR code with any UPI app to complete payment
            </Text>
          </View>

          {/* UPI ID Display */}
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <Text className="small-regular text-gray-200 mb-1">Payment Amount</Text>
            <Text className="base-semibold text-dark-100">₹{totalAmount.toFixed(2)}</Text>
          </View>

          {/* Transaction ID Input */}
          <View className="mb-6">
            <Text className="base-semibold text-dark-100 mb-3">
              Enter Transaction ID
            </Text>
            <TextInput
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Enter UPI transaction ID"
              className="border-2 border-gray-200 rounded-xl p-4 base-regular text-dark-100"
              autoCapitalize="characters"
            />
            <Text className="small-regular text-gray-200 mt-2">
              You'll receive this ID after completing the payment
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            className="custom-btn mb-4"
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="base-bold text-white">Confirm Payment</Text>
            )}
          </TouchableOpacity>

          {/* Instructions */}
          <View className="bg-blue-50 p-4 rounded-xl">
            <Text className="base-semibold text-dark-100 mb-2">📱 Payment Instructions:</Text>
            <Text className="small-regular text-gray-200 mb-1">1. Scan the QR code with your UPI app</Text>
            <Text className="small-regular text-gray-200 mb-1">2. Complete the payment of ₹{totalAmount.toFixed(2)}</Text>
            <Text className="small-regular text-gray-200 mb-1">3. Copy the transaction ID from your UPI app</Text>
            <Text className="small-regular text-gray-200">4. Paste it above and click Confirm Payment</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Checkout;
