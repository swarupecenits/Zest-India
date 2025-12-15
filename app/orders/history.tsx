import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getUserOrders } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { images } from '@/constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const OrderHistory = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userOrders = await getUserOrders(user.$id);
      setOrders(userOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'confirmed':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const downloadReceipt = async (order: any) => {
    try {
      const receiptContent = `
========================================
           ZEST INDIA
        Order Receipt
========================================

Order ID: ${order.$id}
Date: ${new Date(order.orderDate).toLocaleString()}
Transaction ID: ${order.transactionId}

----------------------------------------
Items:
${order.items.map((item: any, index: number) => `
${index + 1}. ${item.name}
   Quantity: ${item.quantity}
   Price: ₹${item.price.toFixed(2)}
   Subtotal: ₹${(item.quantity * item.price).toFixed(2)}
${item.customizations?.length > 0 ? `   Customizations: ${item.customizations.join(', ')}` : ''}
`).join('\n')}
----------------------------------------

Subtotal: ₹${order.totalAmount.toFixed(2)}
Delivery Fee: ₹5.00
Total: ₹${order.totalAmount.toFixed(2)}

Payment Method: ${order.paymentMethod}
Status: ${order.status.toUpperCase()}

Delivery Address:
${order.deliveryAddress}

========================================
     Thank you for your order!
========================================
      `;

      const fileUri = FileSystem.documentDirectory + `receipt_${order.$id}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, receiptContent, {
        encoding: 'utf8',
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'Receipt saved to documents');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download receipt');
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 mx-5">
      {/* Order Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="base-semibold text-dark-100">
            Order #{item.$id.slice(-8).toUpperCase()}
          </Text>
          <Text className="small-regular text-gray-200">
            {new Date(item.orderDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${
          item.status === 'delivered' ? 'bg-green-100' :
          item.status === 'pending' ? 'bg-yellow-100' :
          item.status === 'confirmed' ? 'bg-blue-100' :
          'bg-red-100'
        }`}>
          <Text className={`small-semibold capitalize ${getStatusColor(item.status)}`}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View className="border-t border-gray-200 pt-3 mb-3">
        {item.items.map((orderItem: any, index: number) => (
          <View key={index} className="flex-row justify-between mb-2">
            <Text className="paragraph-regular text-dark-100 flex-1">
              {orderItem.quantity}x {orderItem.name}
            </Text>
            <Text className="paragraph-semibold text-dark-100">
              ₹{(orderItem.quantity * orderItem.price).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Order Total */}
      <View className="border-t border-gray-200 pt-3 mb-3">
        <View className="flex-row justify-between">
          <Text className="base-semibold text-dark-100">Total Amount</Text>
          <Text className="base-bold text-primary">₹{item.totalAmount.toFixed(2)}</Text>
        </View>
        <Text className="small-regular text-gray-200 mt-1">
          Payment: {item.paymentMethod} | {item.transactionId}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 border-2 border-primary rounded-full py-2"
          onPress={() => downloadReceipt(item)}
        >
          <Text className="base-semibold text-primary text-center">Download Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary rounded-full py-2"
          onPress={() => router.push(`/orders/${item.$id}`)}
        >
          <Text className="base-semibold text-white text-center">View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#FF6D00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="py-5"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="px-5 mb-4">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Image source={images.backArrow} className="size-6" resizeMode="contain" />
              </TouchableOpacity>
              <Text className="h3-bold text-dark-100 ml-4">Order History</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <Text className="h3-bold text-gray-200 mb-2">No Orders Yet</Text>
            <Text className="paragraph-regular text-gray-200 mb-6">
              Start ordering delicious food!
            </Text>
            <TouchableOpacity
              className="custom-btn"
              onPress={() => router.replace('/(tabs)')}
            >
              <Text className="base-bold text-white">Browse Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default OrderHistory;
