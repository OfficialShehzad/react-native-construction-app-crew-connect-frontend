import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/axios';

export default function UserProjects({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEditStartDatePicker, setShowEditStartDatePicker] = useState(false);
  const [showEditEndDatePicker, setShowEditEndDatePicker] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: '',
    plan_image_url: '',
    start_date: '',
    end_date: '',
  });
  const [editProject, setEditProject] = useState({
    id: null,
    name: '',
    description: '',
    budget: '',
    plan_image_url: '',
    start_date: '',
    end_date: '',
    status: 'planning',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('error is : ', error)
      Alert.alert('Error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const fetchEngineers = async () => {
    try {
      const response = await api.get('/projects/available-engineers');
      setEngineers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch engineers');
    }
  };

  const openDetailsScreen = (project) => {
    navigation.navigate('ProjectDetails', {
      project,
      onDeleted: (deletedId) => setProjects(projects.filter(p => p.id !== deletedId)),
    });
  };

  const handleHireEngineer = async (project) => {
    // Navigate to the HireEngineer screen
    navigation.navigate('HireEngineer', {
      projectId: project.id,
      projectName: project.name,
    });
  };

  const renderProject = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => openDetailsScreen(item)}
      activeOpacity={0.85}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.plan_image_url ? (
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: item.plan_image_url }} style={styles.cardImage} />
        </View>
      ) : null}

      <Text style={styles.projectDescription} numberOfLines={2}>{item.description}</Text>

      <View style={styles.projectDetails}>
        <Text style={styles.detailText}>Budget: ₹{item.budget}</Text>
        <Text style={styles.detailText}>Engineer: {item.civil_engineer_name || 'Not assigned'}</Text>
        <Text style={styles.detailText}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return '#fbbf24';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Projects</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ProjectForm', {
          mode: 'create',
          onSaved: (created) => setProjects([created, ...projects]),
        })}>
          <Text style={styles.addButtonText}>+ New Project</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create your first project to get started</Text>
          </View>
        }
      />

      {/* Modals removed: details/edit/create now use dedicated screens */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
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
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardImageWrap: {
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  projectDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  // action buttons removed for cleaner card UI
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
    maxHeight: '80%',
  },
  detailModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  detailScroll: {
    maxHeight: 600,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#1e40af',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#6b7280',
    fontSize: 16,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  statusSection: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  statusOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  statusOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  // Detail Modal Styles
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  detailImageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailSectionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  detailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailInfoLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailInfoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#6b7280',
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
