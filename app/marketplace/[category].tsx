import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import useAppwrite from '@/lib/useAppwrite';
import { getMenu, getCategories } from '@/lib/appwrite';
import { images } from '@/constants';
import MenuCard from '@/components/MenuCard';
import Filter from '@/components/Filter';
import CartButton from '@/components/CartButton';
import cn from 'clsx';
import { MenuItem } from '@/type';
import { useCartStore } from '@/store/cart.store';

const Marketplace = () => {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const { addItem } = useCartStore();
  
  const { data, refetch, loading } = useAppwrite({ 
    fn: getMenu, 
    params: { category, limit: 20 } 
  });
  const { data: categories } = useAppwrite({ fn: getCategories });

  useEffect(() => {
    refetch({ category, limit: 20 });
  }, [category]);

  const getSortedData = () => {
    if (!data) return [];
    
    const sorted = [...data];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  const quickAddToCart = (item: MenuItem) => {
    addItem({
      id: item.$id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      customizations: [],
    });
  };

  const getCategoryTitle = () => {
    if (!category) return 'All Products';
    const cat = categories?.find((c: any) => c.$id === category);
    return cat?.name || 'Products';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={getSortedData()}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-4 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <View className="px-5 py-4 bg-white">
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => router.back()}>
                  <Image source={images.backArrow} className="size-6" resizeMode="contain" />
                </TouchableOpacity>
                <Text className="h3-bold text-dark-100">{getCategoryTitle()}</Text>
                <CartButton />
              </View>
            </View>

            {/* Category Filter */}
            <View className="px-5 py-4 bg-white mb-2">
              <Filter categories={categories!} />
            </View>

            {/* Sort Options */}
            <View className="px-5 py-4 bg-white mb-4">
              <Text className="base-semibold text-dark-100 mb-3">Sort By</Text>
              <View className="flex-row gap-2 flex-wrap">
                <TouchableOpacity
                  className={cn(
                    'px-4 py-2 rounded-full border',
                    sortBy === 'popular' ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                  )}
                  onPress={() => setSortBy('popular')}
                >
                  <Text className={cn(
                    'base-semibold',
                    sortBy === 'popular' ? 'text-white' : 'text-gray-400'
                  )}>
                    Popular
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={cn(
                    'px-4 py-2 rounded-full border',
                    sortBy === 'price-low' ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                  )}
                  onPress={() => setSortBy('price-low')}
                >
                  <Text className={cn(
                    'base-semibold',
                    sortBy === 'price-low' ? 'text-white' : 'text-gray-400'
                  )}>
                    Price: Low to High
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={cn(
                    'px-4 py-2 rounded-full border',
                    sortBy === 'price-high' ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                  )}
                  onPress={() => setSortBy('price-high')}
                >
                  <Text className={cn(
                    'base-semibold',
                    sortBy === 'price-high' ? 'text-white' : 'text-gray-400'
                  )}>
                    Price: High to Low
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={cn(
                    'px-4 py-2 rounded-full border',
                    sortBy === 'rating' ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                  )}
                  onPress={() => setSortBy('rating')}
                >
                  <Text className={cn(
                    'base-semibold',
                    sortBy === 'rating' ? 'text-white' : 'text-gray-400'
                  )}>
                    Rating
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Results Count */}
            <View className="px-5 py-3">
              <Text className="base-regular text-gray-400">
                {loading ? 'Loading...' : `${data?.length || 0} items found`}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          
          return (
            <View className={cn('flex-1 max-w-[48%]', !isFirstRightColItem ? 'mt-4' : 'mt-0')}>
              {/* Product Card */}
              <Pressable
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/menu/${item.$id}`)}
                android_ripple={{ color: '#f3f4f6' }}
              >
                {/* Product Image */}
                <View className="relative">
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  {/* Rating Badge */}
                  {item.rating && (
                    <View className="absolute top-2 right-2 bg-white/95 rounded-full px-2 py-1 flex-row items-center gap-1">
                      <Text className="text-xs">⭐</Text>
                      <Text className="text-xs font-semibold text-dark-100">
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View className="p-3">
                  <Text className="base-bold text-dark-100 mb-1" numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text className="small-regular text-gray-400 mb-2" numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Nutritional Info */}
                  <View className="flex-row items-center gap-3 mb-3">
                    {item.calories && (
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-400">🔥 </Text>
                        <Text className="text-xs text-gray-400">{item.calories}</Text>
                      </View>
                    )}
                    {item.protein && (
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-400">💪 </Text>
                        <Text className="text-xs text-gray-400">{item.protein}g</Text>
                      </View>
                    )}
                  </View>

                  {/* Price and Add Button */}
                  <View className="flex-row items-center justify-between">
                    <Text className="h3-bold text-primary">₹{item.price}</Text>
                    <TouchableOpacity
                      className="bg-primary rounded-full w-8 h-8 items-center justify-center"
                      onPress={(e) => {
                        e.stopPropagation();
                        quickAddToCart(item as MenuItem);
                      }}
                    >
                      <Image
                        source={images.plus}
                        className="size-4"
                        tintColor="#ffffff"
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          !loading && (
            <View className="flex-1 items-center justify-center py-20 px-5">
              <Image
                source={images.emptyState}
                className="w-48 h-48 mb-4"
                resizeMode="contain"
              />
              <Text className="h3-bold text-dark-100 mb-2">No Products Found</Text>
              <Text className="base-regular text-gray-400 text-center mb-6">
                Try changing filters or exploring other categories
              </Text>
              <TouchableOpacity
                className="custom-btn"
                onPress={() => router.push('/search')}
              >
                <Text className="base-bold text-white">Explore Menu</Text>
              </TouchableOpacity>
            </View>
          )
        )}
        ListFooterComponent={() => (
          loading && (
            <View className="py-10">
              <ActivityIndicator size="large" color="#FF6D00" />
            </View>
          )
        )}
      />
    </SafeAreaView>
  );
};

export default Marketplace;
