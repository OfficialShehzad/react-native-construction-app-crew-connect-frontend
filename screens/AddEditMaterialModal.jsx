import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import api from '../api/axios';

export default function AddEditMaterialModal({
  visible,
  onClose,
  onSave,
  initialData = null,
  isEditing = false
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price_per_unit: '',
    stock_quantity: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (isEditing && initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          unit: initialData.unit || '',
          price_per_unit: initialData.price_per_unit ? String(initialData.price_per_unit) : '',
          stock_quantity: initialData.stock_quantity ? String(initialData.stock_quantity) : '',
          category: initialData.category || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          unit: '',
          price_per_unit: '',
          stock_quantity: '',
          category: '',
        });
      }
    }
  }, [visible, initialData, isEditing]);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.unit.trim()) {
      Alert.alert('Error', 'Unit is required');
      return;
    }
    if (!formData.price_per_unit || isNaN(parseFloat(formData.price_per_unit))) {
      Alert.alert('Error', 'Valid price per unit is required');
      return;
    }
    if (!formData.stock_quantity || isNaN(parseInt(formData.stock_quantity))) {
      Alert.alert('Error', 'Valid stock quantity is required');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      if (isEditing) {
        const response = await api.put(`/materials/${initialData.id}`, dataToSend);
        onSave(response.data, 'edit');
      } else {
        const response = await api.post('/materials', dataToSend);
        onSave(response.data, 'add');
      }

      onClose();
    } catch (error) {
      console.error('Error saving material:', error);
      const message = error.response?.data?.error || 'Failed to save material';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>
                {isEditing ? 'Edit Material' : 'Add Material'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={value => updateField('name', value)}
                  placeholder="Material name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={formData.description}
                  onChangeText={value => updateField('description', value)}
                  placeholder="Material description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Unit *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit}
                  onChangeText={value => updateField('unit', value)}
                  placeholder="e.g., kg, piece, bag"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price per Unit *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price_per_unit}
                  onChangeText={value => updateField('price_per_unit', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Stock Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock_quantity}
                  onChangeText={value => updateField('stock_quantity', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={formData.category}
                  onChangeText={value => updateField('category', value)}
                  placeholder="e.g., Building Materials"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.saveButtonText]}>
                    {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48, // For multiline support
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#1e40af',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
  },
});
