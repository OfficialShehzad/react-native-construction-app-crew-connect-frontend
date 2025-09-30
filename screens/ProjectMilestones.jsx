import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/axios';

export default function ProjectMilestones({ route, navigation }) {
  const { project } = route.params;
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    target_date: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: `Milestones - ${project.name}`,
    });
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/milestones/project/${project.id}`);
      setMilestones(response.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      Alert.alert('Error', 'Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      target_date: '',
    });
    setEditingMilestone(null);
  };

  const openModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setForm({
        title: milestone.title || '',
        description: milestone.description || '',
        target_date: milestone.target_date || '',
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const saveMilestone = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    try {
      const milestoneData = {
        project_id: project.id,
        title: form.title.trim(),
        description: form.description.trim(),
        target_date: form.target_date,
        ...(editingMilestone && { status: editingMilestone.status }),
      };

      if (editingMilestone) {
        await api.put(`/milestones/${editingMilestone.id}`, milestoneData);
      } else {
        await api.post('/milestones', milestoneData);
      }

      closeModal();
      fetchMilestones();
    } catch (error) {
      console.error('Error saving milestone:', error);
      Alert.alert('Error', 'Failed to save milestone');
    }
  };

  const deleteMilestone = async (milestone) => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/milestones/${milestone.id}`);
              fetchMilestones();
            } catch (error) {
              console.error('Error deleting milestone:', error);
              Alert.alert('Error', 'Failed to delete milestone');
            }
          },
        },
      ]
    );
  };

  const completeMilestone = async (milestone) => {
    try {
      await api.put(`/milestones/${milestone.id}/complete`);
      fetchMilestones();
    } catch (error) {
      console.error('Error completing milestone:', error);
      Alert.alert('Error', 'Failed to complete milestone');
    }
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setForm({ ...form, target_date: date.toISOString().split('T')[0] });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMilestone = ({ item }) => (
    <View style={styles.milestoneCard}>
      <View style={styles.milestoneHeader}>
        <View style={styles.milestoneTitleSection}>
          <Text style={styles.milestoneTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={styles.milestoneActions}>
          {item.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => completeMilestone(item)}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openModal(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteMilestone(item)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.milestoneDescription}>{item.description}</Text>
      ) : null}

      <View style={styles.milestoneFooter}>
        <Text style={styles.milestoneDate}>
          Target: {formatDate(item.target_date)}
        </Text>
        {item.completion_date && (
          <Text style={styles.milestoneDate}>
            Completed: {formatDate(item.completion_date)}
          </Text>
        )}
        <Text style={styles.milestoneDate}>
          Created: {formatDate(item.created_at)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading milestones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>+ Add Milestone</Text>
      </TouchableOpacity>

      <FlatList
        data={milestones}
        renderItem={renderMilestone}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No milestones yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add Milestone" to get started</Text>
          </View>
        }
      />

      {/* Modal for Add/Edit Milestone */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>
                {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Milestone Title *"
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={form.target_date ? styles.dateText : styles.datePlaceholder}>
                  {form.target_date ? formatDate(form.target_date) : 'Select Target Date'}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveMilestone}>
                  <Text style={styles.saveButtonText}>
                    {editingMilestone ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={form.target_date ? new Date(form.target_date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </ScrollView>
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
  addButton: {
    backgroundColor: '#1e40af',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneHeader: {
    marginBottom: 12,
  },
  milestoneTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  milestoneActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  milestoneDescription: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 22,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  milestoneDate: {
    fontSize: 12,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalScroll: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#6b7280',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1e40af',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
