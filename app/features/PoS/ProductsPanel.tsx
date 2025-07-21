import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import Card from '@/app/components/Card'
import { Product } from '@/types/types'
import { useWindowDimensions } from 'react-native'

export default function ProductsPanel({
  categoriesList,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  productsList,
  isCategoriesLoading,
  isCategoriesRefetching,
  isProductsLoading,
  isProductsRefetching,
  handlePress
}: {
  categoriesList: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  filteredProducts: Product[]
  productsList: Product[]
  isCategoriesLoading: boolean
  isCategoriesRefetching: boolean
  isProductsLoading: boolean
  isProductsRefetching: boolean
  handlePress: (product: Product) => void
}) {
  const { height, width } = useWindowDimensions()
  const isPortrait = height >= width
  const containerStyle = [
    styles.categorySelector,
    { flexDirection: isPortrait ? ('row' as const) : ('column' as const) }
  ]
  const cardStyle = [
    styles.card,
    { width: isPortrait ? ('25%' as const) : ('48%' as const) }
  ]
  const CategorySelectorScrollViewStyle = {
    flexDirection: isPortrait ? ('row' as const) : ('column' as const),
    gap: 10,
    padding: 10
  }
  return (
    <>
      <View style={containerStyle}>
        <ScrollView
          horizontal={isPortrait}
          contentContainerStyle={CategorySelectorScrollViewStyle}
        >
          {(isCategoriesLoading || isCategoriesRefetching) && (
            <ActivityIndicator size='large' color='#6200ea' />
          )}
          {!isCategoriesLoading &&
            !isCategoriesRefetching &&
            categoriesList.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <View style={styles.productsWrapper}>
        <ScrollView contentContainerStyle={styles.productsContainer}>
          {(isProductsLoading || isProductsRefetching) && (
            <ActivityIndicator size='large' color='#6200ea' />
          )}
          {!isProductsLoading && filteredProducts.length === 0 && (
            <Text style={{ fontSize: 16, color: '#000' }}>
              No hay productos en esta categoría
            </Text>
          )}
          {!isProductsLoading &&
            !isProductsRefetching &&
            filteredProducts.length > 0 &&
            productsList.length > 0 &&
            filteredProducts.map((item) => (
              <View key={item.id} style={cardStyle}>
                <Card
                  data={item}
                  onPress={() => handlePress(item)}
                  _hiddenFields={['id', 'category']}
                />
              </View>
            ))}
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  categorySelector: {
    gap: 10,
    padding: 10
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    width: 'auto',
    alignItems: 'center'
  },
  selectedCategory: {
    backgroundColor: '#6200ea'
  },
  categoryText: {
    fontSize: 16,
    color: '#000'
  },
  selectedCategoryText: {
    color: '#fff'
  },
  productsWrapper: {
    flex: 2
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10
  },
  card: {
    width: '48%',
    overflow: 'hidden'
  }
})
