import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';
import AddEditMaterialModal from './AddEditMaterialModal';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      Alert.alert('Error', 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaterial = (material, action) => {
    if (action === 'add') {
      setMaterials(prev => [...prev, material]);
    } else if (action === 'edit') {
      setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setModalVisible(true);
  };

  const handleDelete = (material) => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete "${material.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(material),
        },
      ]
    );
  };

  const confirmDelete = async (material) => {
    try {
      await api.delete(`/materials/${material.id}`);
      setMaterials(prev => prev.filter(m => m.id !== material.id));
      Alert.alert('Success', 'Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      const message = error.response?.data?.error || 'Failed to delete material';
      Alert.alert('Error', message);
    }
  };

  const showMaterialActions = (material) => {
    Alert.alert(
      material.name,
      'Choose an action',
      [
        { text: 'Edit', onPress: () => handleEdit(material) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(material) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMaterialItem = ({ item }) => (
    <View style={styles.materialRow}>
      <View style={styles.materialInfo}>
        <Text style={styles.materialName}>{item.name}</Text>
        <Text style={styles.materialDescription}>{item.description || 'No description'}</Text>
        <Text style={styles.materialCategory}>
          {item.category}{item.category && ' • '}
          {item.unit} • ₹{parseFloat(item.price_per_unit).toFixed(2)} per {item.unit}
        </Text>
      </View>
      <View style={styles.materialStats}>
        <Text style={styles.stockQuantity}>Stock: {item.stock_quantity}</Text>
        <TouchableOpacity
          style={styles.actionsButton}
          onPress={() => showMaterialActions(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No materials found</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Material Management</Text>
        <Text style={styles.subtitle}>Manage construction materials and inventory</Text>
      </View>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingMaterial(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Material</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={materials}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMaterialItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <AddEditMaterialModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        initialData={editingMaterial}
        isEditing={!!editingMaterial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 8,
  },
  addButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  materialRow: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  materialCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  materialStats: {
    alignItems: 'flex-end',
  },
  stockQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 8,
  },
  actionsButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
