import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput
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

  const [searchText, setSearchText] = useState('')

  const { filteredCategories, filteredProductsBySearch } = useMemo(() => {
    const lowerSearch = searchText.toLowerCase()

    const categoriesFromName = categoriesList.filter((cat) =>
      cat.toLowerCase().includes(lowerSearch)
    )

    const productsMatchingByName = productsList.filter((prod) =>
      prod.name.toLowerCase().includes(lowerSearch)
    )

    const productsMatchingByCategory = productsList.filter((prod) =>
      prod.category.toLowerCase().includes(lowerSearch)
    )

    const productsMatching =
      productsMatchingByName.length > 0
        ? productsMatchingByName
        : productsMatchingByCategory

    const categoriesFromProducts = Array.from(
      new Set(productsMatching.map((p) => p.category))
    )

    const allMatchingCategories = Array.from(
      new Set([...categoriesFromName, ...categoriesFromProducts])
    )

    const productsToShow =
      productsMatching.length > 0 ? productsMatching : filteredProducts

    const finalProducts =
      !selectedCategory || selectedCategory === 'Todos'
        ? productsToShow
        : productsToShow.filter((p) => p.category === selectedCategory)

    return {
      filteredCategories: allMatchingCategories,
      filteredProductsBySearch: finalProducts
    }
  }, [
    searchText,
    categoriesList,
    productsList,
    filteredProducts,
    selectedCategory
  ])

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

  const mainContentStyle = [
    styles.mainContent,
    { flexDirection: isPortrait ? ('column' as const) : ('row' as const) }
  ]

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchWrapper}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder='Buscar categoría o producto'
          style={styles.searchInput}
        />
      </View>

      <View style={mainContentStyle}>
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
              filteredCategories.map((category) => (
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
                      selectedCategory === category &&
                        styles.selectedCategoryText
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
            {!isProductsLoading && filteredProductsBySearch.length === 0 && (
              <Text style={{ fontSize: 16, color: '#000' }}>
                No hay productos en esta búsqueda
              </Text>
            )}
            {!isProductsLoading &&
              !isProductsRefetching &&
              filteredProductsBySearch.length > 0 &&
              filteredProductsBySearch.map((item) => (
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
      </View>
    </View>
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
    gap: 10,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  card: {
    width: '48%',
    overflow: 'hidden'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#fff'
  },
  searchWrapper: {
    padding: 10
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row'
  },
  wrapper: {
    flex: 2
  }
})
