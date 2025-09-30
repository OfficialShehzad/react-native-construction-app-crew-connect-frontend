import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../api/axios';

export default function ProjectMaterials({ route, navigation }) {
  const { project } = route.params || {};
  const [materials, setMaterials] = useState([]);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add Materials',
    });
  }, [navigation]);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      Alert.alert('Error', 'Failed to fetch materials');
    }
  };

  const fetchProjectMaterials = async () => {
    try {
      const response = await api.get(`/materials/project/${project.id}`);
      setProjectMaterials(response.data);
    } catch (error) {
      console.error('Error fetching project materials:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchMaterials(), fetchProjectMaterials()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openOrderModal = (material) => {
    setSelectedMaterial(material);
    setQuantity('');
    setOrderModalVisible(true);
  };

  const closeOrderModal = () => {
    setOrderModalVisible(false);
    setSelectedMaterial(null);
    setQuantity('');
  };

  const handleOrderMaterial = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (qty > selectedMaterial.stock_quantity) {
      Alert.alert('Error', 'Quantity exceeds available stock');
      return;
    }

    try {
      await api.post('/materials/order', {
        project_id: project.id,
        material_id: selectedMaterial.id,
        quantity: qty,
      });

      Alert.alert('Success', 'Material ordered successfully');
      closeOrderModal();
      await loadData();
    } catch (error) {
      console.error('Error ordering material:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to order material');
    }
  };

  const getOrderedQuantity = (materialId) => {
    const projectMat = projectMaterials.find(pm => pm.material_id === materialId);
    return projectMat ? projectMat.quantity : 0;
  };

  const renderMaterial = ({ item }) => {
    const orderedQty = getOrderedQuantity(item.id);

    return (
      <View style={styles.materialCard}>
        <View style={styles.materialContent}>
          <View style={styles.materialHeader}>
            <Text style={styles.materialName}>{item.name}</Text>
            <Text style={styles.categoryBadge}>{item.category}</Text>
          </View>

          {item.description && (
            <Text style={styles.materialDescription}>{item.description}</Text>
          )}

          <View style={styles.materialDetails}>
            <Text style={styles.detailText}>Unit: {item.unit}</Text>
            <Text style={styles.detailText}>Price: ₹{item.price_per_unit}</Text>
            <Text style={styles.stockText}>Stock: {item.stock_quantity}</Text>
            {orderedQty > 0 && (
              <Text style={styles.orderedText}>Ordered: {orderedQty} {item.unit}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.orderButton,
            item.stock_quantity <= 0 && styles.orderButtonDisabled
          ]}
          onPress={() => openOrderModal(item)}
          disabled={item.stock_quantity <= 0}
        >
          <Text style={[
            styles.orderButtonText,
            item.stock_quantity <= 0 && styles.orderButtonTextDisabled
          ]}>
            {item.stock_quantity <= 0 ? 'Out of Stock' : 'Order'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{project.name}</Text>
        <Text style={styles.headerSubtitle}>Add materials to project</Text>
      </View>

      <FlatList
        data={materials}
        renderItem={renderMaterial}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No materials available</Text>
            <Text style={styles.emptySubtext}>Contact admin to add materials</Text>
          </View>
        }
      />

      <Modal
        visible={orderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeOrderModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Material</Text>

            {selectedMaterial && (
              <>
                <Text style={styles.modalMaterialName}>{selectedMaterial.name}</Text>
                <Text style={styles.modalMaterialInfo}>
                  Available: {selectedMaterial.stock_quantity} {selectedMaterial.unit}
                </Text>
                <Text style={styles.modalMaterialInfo}>
                  Price per unit: ₹{selectedMaterial.price_per_unit}
                </Text>

                <TextInput
                  style={styles.quantityInput}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  maxLength={10}
                />

                {quantity && !isNaN(parseInt(quantity)) && (
                  <Text style={styles.totalCost}>
                    Total Cost: ₹{(parseInt(quantity) * selectedMaterial.price_per_unit).toLocaleString()}
                  </Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeOrderModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleOrderMaterial}
                  >
                    <Text style={styles.confirmButtonText}>Order</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 20,
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialContent: {
    flex: 1,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  materialDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  materialDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#374151',
  },
  stockText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  orderedText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  orderButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderButtonTextDisabled: {
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMaterialName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  modalMaterialInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  totalCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#1e40af',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
