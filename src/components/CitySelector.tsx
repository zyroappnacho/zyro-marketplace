import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { mockCities } from '../data/mockData';

interface Props {
  selectedCity: string;
  onCityChange: (city: string) => void;
  style?: any;
}

export const CitySelector: React.FC<Props> = ({ selectedCity, onCityChange, style }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const enabledCities = mockCities.map(city => ({ id: city.toLowerCase(), name: city }));

  const handleCitySelect = (city: { id: string; name: string }) => {
    onCityChange(city.name);
    setIsModalVisible(false);
  };

  const renderCityItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.cityItem,
        item.name === selectedCity && styles.selectedCityItem,
      ]}
      onPress={() => handleCitySelect(item)}
    >
      <View style={styles.cityItemContent}>
        <Icon name="location-city" size={24} color={colors.goldElegant} />
        <Text style={[
          styles.cityItemText,
          item.name === selectedCity && styles.selectedCityItemText,
        ]}>
          ZYRO {item.name}
        </Text>
      </View>
      {item.name === selectedCity && (
        <Icon name="check-circle" size={24} color={colors.goldElegant} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.selectorText}>ZYRO {selectedCity}</Text>
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
            <Text style={styles.modalTitle}>Seleccionar Ciudad</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Icon name="close" size={24} color={colors.goldElegant} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={enabledCities}
            keyExtractor={(item) => item.id}
            renderItem={renderCityItem}
            style={styles.cityList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          
          {enabledCities.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="location-off" size={48} color={colors.mediumGray} />
              <Text style={styles.emptyStateText}>
                No hay ciudades disponibles
              </Text>
              <Text style={styles.emptyStateSubtext}>
                El administrador debe habilitar ciudades primero
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.goldElegant,
    minWidth: 140,
  },
  selectorText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.goldElegant,
    marginRight: spacing.xs,
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
  
  // City List Styles
  cityList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    marginVertical: spacing.xs,
  },
  selectedCityItem: {
    borderColor: colors.goldElegant,
    backgroundColor: `${colors.goldElegant}10`,
  },
  cityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityItemText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    marginLeft: spacing.md,
  },
  selectedCityItemText: {
    color: colors.goldElegant,
  },
  separator: {
    height: 1,
    backgroundColor: colors.mediumGray,
    marginHorizontal: spacing.md,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: fontSizes.lg,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: fontWeights.medium,
  },
  emptyStateSubtext: {
    fontSize: fontSizes.sm,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});