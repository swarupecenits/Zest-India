import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { getOrderById } from '@/lib/appwrite';
import { images } from '@/constants';

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(id as string);
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#FF6D00" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="paragraph-regular text-gray-200">Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={images.backArrow} className="size-6" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="h3-bold text-dark-100 ml-4">Order Details</Text>
        </View>

        <View className="px-5">
          {/* Order Status */}
          <View className="bg-primary/10 p-6 rounded-2xl mb-6">
            <Text className="small-regular text-gray-200 mb-2">Order Status</Text>
            <Text className="h2-bold text-primary capitalize">{order.status}</Text>
            <Text className="small-regular text-gray-200 mt-2">
              Order #{order.$id.slice(-8).toUpperCase()}
            </Text>
          </View>

          {/* Order Information */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <Text className="h3-bold text-dark-100 mb-4">Order Information</Text>
            
            <View className="mb-3">
              <Text className="small-regular text-gray-200">Order Date</Text>
              <Text className="base-semibold text-dark-100">
                {new Date(order.orderDate).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="small-regular text-gray-200">Transaction ID</Text>
              <Text className="base-semibold text-dark-100">{order.transactionId}</Text>
            </View>

            <View className="mb-3">
              <Text className="small-regular text-gray-200">Payment Method</Text>
              <Text className="base-semibold text-dark-100">{order.paymentMethod}</Text>
            </View>

            <View>
              <Text className="small-regular text-gray-200">Delivery Address</Text>
              <Text className="base-semibold text-dark-100">{order.deliveryAddress}</Text>
            </View>
          </View>

          {/* Order Items */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <Text className="h3-bold text-dark-100 mb-4">Order Items</Text>
            
            {order.items.map((item: any, index: number) => (
              <View key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                <View className="flex-row justify-between mb-2">
                  <Text className="base-semibold text-dark-100 flex-1">{item.name}</Text>
                  <Text className="base-semibold text-primary">₹{item.price.toFixed(2)}</Text>
                </View>
                <Text className="small-regular text-gray-200 mb-1">Quantity: {item.quantity}</Text>
                {item.customizations && item.customizations.length > 0 && (
                  <Text className="small-regular text-gray-200">
                    Customizations: {item.customizations.join(', ')}
                  </Text>
                )}
                <Text className="base-semibold text-dark-100 mt-2">
                  Subtotal: ₹{(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Summary */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <Text className="h3-bold text-dark-100 mb-4">Payment Summary</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="paragraph-regular text-gray-200">Subtotal</Text>
              <Text className="paragraph-semibold text-dark-100">
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="paragraph-regular text-gray-200">Delivery Fee</Text>
              <Text className="paragraph-semibold text-dark-100">₹5.00</Text>
            </View>
            <View className="border-t border-gray-200 my-2" />
            <View className="flex-row justify-between">
              <Text className="base-bold text-dark-100">Total Amount</Text>
              <Text className="base-bold text-primary">₹{order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;
