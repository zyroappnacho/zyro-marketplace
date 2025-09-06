import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { mockCategories } from '../data/mockData';

interface Props {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  style?: any;
  showAsChips?: boolean;
}

export const CategoryFilter: React.FC<Props> = ({ 
  selectedCategory, 
  onCategoryChange, 
  style,
  showAsChips = false 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Add "All Categories" option
  const allCategoriesOption = {
    id: 'all',
    name: 'TODAS LAS CATEGORÍAS',
    icon: 'apps',
  };
  
  const categoriesWithAll = [allCategoriesOption, ...mockCategories];

  const handleCategorySelect = (category: any) => {
    const categoryValue = category.id === 'all' ? 'TODAS LAS CATEGORÍAS' : category.name;
    onCategoryChange(categoryValue);
    setIsModalVisible(false);
  };

  const getSelectedCategoryConfig = () => {
    if (selectedCategory === 'TODAS LAS CATEGORÍAS') {
      return allCategoriesOption;
    }
    return mockCategories.find(cat => cat.name === selectedCategory) || allCategoriesOption;
  };

  const renderCategoryItem = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === (item.id === 'all' ? 'TODAS LAS CATEGORÍAS' : item.name);
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategoryItem,
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <View style={styles.categoryItemContent}>
          <View style={[
            styles.categoryIconContainer,
            isSelected && styles.selectedCategoryIconContainer,
          ]}>
            <Icon 
              name={item.icon} 
              size={24} 
              color={isSelected ? colors.black : colors.goldElegant} 
            />
          </View>
          <Text style={[
            styles.categoryItemText,
            isSelected && styles.selectedCategoryItemText,
          ]}>
            {item.id === 'all' ? item.name : item.name}
          </Text>
        </View>
        {isSelected && (
          <Icon name="check-circle" size={24} color={colors.goldElegant} />
        )}
      </TouchableOpacity>
    );
  };

  const renderChipView = () => {
    const selectedConfig = getSelectedCategoryConfig();
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        contentContainerStyle={styles.chipsContent}
      >
        {categoriesWithAll.map((category) => {
          const isSelected = selectedCategory === (category.id === 'all' ? 'TODAS LAS CATEGORÍAS' : category.name);
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.chip,
                isSelected && styles.selectedChip,
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Icon 
                name={category.icon} 
                size={16} 
                color={isSelected ? colors.black : colors.goldElegant} 
                style={styles.chipIcon}
              />
              <Text style={[
                styles.chipText,
                isSelected && styles.selectedChipText,
              ]}>
                {category.id === 'all' ? category.name : category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderDropdownView = () => {
    const selectedConfig = getSelectedCategoryConfig();
    
    return (
      <>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setIsModalVisible(true)}
        >
          <View style={styles.dropdownContent}>
            <Icon name={selectedConfig.icon} size={20} color={colors.goldElegant} />
            <Text style={styles.dropdownText}>{selectedConfig.id === 'all' ? selectedConfig.name : selectedConfig.name}</Text>
          </View>
          <Icon name="keyboard-arrow-down" size={20} color={colors.goldElegant} />
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={24} color={colors.goldElegant} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categoriesWithAll}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={styles.categoryRow}
            />
          </SafeAreaView>
        </Modal>
      </>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showAsChips ? renderChipView() : renderDropdownView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  // Dropdown Styles
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.goldElegant,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    fontSize: fontSizes.sm,
    color: colors.goldElegant,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.sm,
  },
  
  // Chips Styles
  chipsContainer: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    marginRight: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.goldElegant,
    borderColor: colors.goldBright,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: fontSizes.xs,
    color: colors.goldElegant,
    fontWeight: fontWeights.medium,
  },
  selectedChipText: {
    color: colors.black,
    fontWeight: fontWeights.semibold,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldElegant,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.goldElegant,
  },
  closeButton: {
    padding: spacing.xs,
  },
  
  // Category List Styles
  categoryList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryItem: {
    flex: 0.48,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    minHeight: 100,
  },
  selectedCategoryItem: {
    borderColor: colors.goldElegant,
    backgroundColor: `${colors.goldElegant}10`,
  },
  categoryItemContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.goldElegant}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedCategoryIconContainer: {
    backgroundColor: colors.goldElegant,
  },
  categoryItemText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedCategoryItemText: {
    color: colors.goldElegant,
  },
});