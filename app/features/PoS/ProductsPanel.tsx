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

    const productsToShow = productsMatching.length > 0 ? productsMatching : []

    const finalProducts =
      !selectedCategory || selectedCategory === 'Todos'
        ? productsToShow
        : productsToShow.filter((p) => p.category === selectedCategory)

    return {
      filteredCategories: allMatchingCategories,
      filteredProductsBySearch: finalProducts
    }
  }, [searchText, categoriesList, productsList, selectedCategory])

  const containerStyle = [
    styles.categorySelector,
    { flexDirection: isPortrait ? ('row' as const) : ('column' as const) }
  ]

  const columns = isPortrait ? 3 : 4
  const columnWidth = 100 / columns

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
              <ActivityIndicator size='large' color='#130918' />
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

        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.productsContainer,
              {
                alignItems: 'flex-start'
              }
            ]}
            showsVerticalScrollIndicator
          >
            {(isProductsLoading || isProductsRefetching) && (
              <ActivityIndicator size='large' color='#130918' />
            )}

            {!isProductsLoading && filteredProductsBySearch.length === 0 && (
              <Text style={{ fontSize: 16, color: '#130918' }}>
                No hay productos en esta búsqueda
              </Text>
            )}

            {!isProductsLoading &&
              !isProductsRefetching &&
              filteredProductsBySearch.length > 0 &&
              filteredProductsBySearch.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexBasis: `${columnWidth}%`,
                    maxWidth: `${columnWidth}%`,
                    paddingHorizontal: 6,
                    paddingVertical: 6
                  }}
                >
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
    backgroundColor: '#ece2d0',
    width: 'auto',
    alignItems: 'center'
  },
  selectedCategory: {
    backgroundColor: '#f1aa1c'
  },
  categoryText: {
    fontSize: 16,
    color: '#130918'
  },
  selectedCategoryText: {
    color: '#130918'
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingRight: 10
  },
  card: {
    flexGrow: 1
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
    flex: 2,
    backgroundColor: '#ece2d0'
  }
})
