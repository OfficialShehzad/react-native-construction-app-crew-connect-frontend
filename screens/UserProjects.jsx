import React, { useState, useEffect } from 'react';
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

  const fetchEngineers = async () => {
    try {
      const response = await api.get('/projects/available-engineers');
      setEngineers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch engineers');
    }
  };

  const pickImage = async (isEdit = false) => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select images!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (isEdit) {
        setEditProject({...editProject, plan_image_url: result.assets[0].uri});
      } else {
        setNewProject({...newProject, plan_image_url: result.assets[0].uri});
      }
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setNewProject({...newProject, start_date: formattedDate});
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setNewProject({...newProject, end_date: formattedDate});
    }
  };

  const onEditStartDateChange = (event, selectedDate) => {
    setShowEditStartDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEditProject({...editProject, start_date: formattedDate});
    }
  };

  const onEditEndDateChange = (event, selectedDate) => {
    setShowEditEndDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEditProject({...editProject, end_date: formattedDate});
    }
  };

  const handleCreateProject = async () => {
    console.log('newproject', newProject)
    if (!newProject.name || !newProject.budget) {
      Alert.alert('Error', 'Name and budget are required');
      return;
    }

    try {
      console.log('trying api call')
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newProject.name);
      formData.append('description', newProject.description);
      formData.append('budget', newProject.budget);
      formData.append('start_date', newProject.start_date);
      formData.append('end_date', newProject.end_date);
      
      // Add image if selected
      if (newProject.plan_image_url) {
        const imageUri = newProject.plan_image_url;
        const filename = imageUri.split('/').pop() || 'plan_image.jpg';
        const fileType = 'image/jpeg'; // Default to jpeg, you can detect actual type
        
        formData.append('plan_image', {
          uri: imageUri,
          type: fileType,
          name: filename,
        });
      }

      const response = await api.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('trying api call after')
      setProjects([response.data, ...projects]);
      setModalVisible(false);
      setNewProject({
        name: '',
        description: '',
        budget: '',
        plan_image_url: '',
        start_date: '',
        end_date: '',
      });
      Alert.alert('Success', 'Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleEditProject = async () => {
    if (!editProject.name || !editProject.budget) {
      Alert.alert('Error', 'Name and budget are required');
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', editProject.name);
      formData.append('description', editProject.description);
      formData.append('budget', editProject.budget);
      formData.append('start_date', editProject.start_date);
      formData.append('end_date', editProject.end_date);
      formData.append('status', editProject.status);
      
      // Add image if selected
      if (editProject.plan_image_url && editProject.plan_image_url.startsWith('file://')) {
        const imageUri = editProject.plan_image_url;
        const filename = imageUri.split('/').pop() || 'plan_image.jpg';
        const fileType = 'image/jpeg';
        
        formData.append('plan_image', {
          uri: imageUri,
          type: fileType,
          name: filename,
        });
      }

      const response = await api.put(`/projects/${editProject.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProjects(projects.map(p => p.id === editProject.id ? response.data : p));
      setEditModalVisible(false);
      setEditProject({
        id: null,
        name: '',
        description: '',
        budget: '',
        plan_image_url: '',
        start_date: '',
        end_date: '',
        status: 'planning',
      });
      Alert.alert('Success', 'Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project');
    }
  };

  const openEditModal = (project) => {
    setEditProject({
      id: project.id,
      name: project.name,
      description: project.description,
      budget: project.budget.toString(),
      plan_image_url: project.plan_image_url || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      status: project.status,
    });
    setEditModalVisible(true);
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  const handleDeleteProject = async (projectId) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/projects/${projectId}`);
              setProjects(projects.filter(p => p.id !== projectId));
              Alert.alert('Success', 'Project deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
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
      onPress={() => openDetailModal(item)}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.projectDescription}>{item.description}</Text>

      <View style={styles.projectDetails}>
        <Text style={styles.detailText}>Budget: ₹{item.budget}</Text>
        <Text style={styles.detailText}>Engineer: {item.civil_engineer_name || 'Not assigned'}</Text>
        <Text style={styles.detailText}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.projectActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {item.status === 'planning' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.hireButton]}
            onPress={() => handleHireEngineer(item)}
          >
            <Text style={styles.actionButtonText}>Hire Engineer</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProject(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
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

      {/* Create Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.input}
                placeholder="Project Name *"
                value={newProject.name}
                onChangeText={(text) => setNewProject({...newProject, name: text})}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                multiline
                numberOfLines={3}
                value={newProject.description}
                onChangeText={(text) => setNewProject({...newProject, description: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Budget (₹) *"
                keyboardType="numeric"
                value={newProject.budget}
                onChangeText={(text) => setNewProject({...newProject, budget: text})}
              />

              {/* Plan Image Selection */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Plan Image</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(false)}>
                  {newProject.plan_image_url ? (
                    <Image source={{ uri: newProject.plan_image_url }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>Select from Gallery</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Start Date Picker */}
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.datePicker} 
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {newProject.start_date || 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* End Date Picker */}
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.datePicker} 
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {newProject.end_date || 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateProject}
              >
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Project</Text>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.input}
                placeholder="Project Name *"
                value={editProject.name}
                onChangeText={(text) => setEditProject({...editProject, name: text})}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                multiline
                numberOfLines={3}
                value={editProject.description}
                onChangeText={(text) => setEditProject({...editProject, description: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Budget (₹) *"
                keyboardType="numeric"
                value={editProject.budget}
                onChangeText={(text) => setEditProject({...editProject, budget: text})}
              />

              {/* Plan Image Selection */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Plan Image</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(true)}>
                  {editProject.plan_image_url ? (
                    <Image source={{ uri: editProject.plan_image_url }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>Select from Gallery</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Start Date Picker */}
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.datePicker} 
                  onPress={() => setShowEditStartDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {editProject.start_date || 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* End Date Picker */}
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.datePicker} 
                  onPress={() => setShowEditEndDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {editProject.end_date || 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Picker */}
              <View style={styles.statusSection}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {['planning', 'in_progress', 'completed', 'cancelled'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        editProject.status === status && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditProject({...editProject, status})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editProject.status === status && styles.statusOptionTextSelected
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleEditProject}
              >
                <Text style={styles.createButtonText}>Update Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Edit Date Pickers */}
        {showEditStartDatePicker && (
          <DateTimePicker
            value={editProject.start_date ? new Date(editProject.start_date) : new Date()}
            mode="date"
            display="default"
            onChange={onEditStartDateChange}
          />
        )}

        {showEditEndDatePicker && (
          <DateTimePicker
            value={editProject.end_date ? new Date(editProject.end_date) : new Date()}
            mode="date"
            display="default"
            onChange={onEditEndDateChange}
          />
        )}
      </Modal>

      {/* Project Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <ScrollView style={styles.detailScroll}>
              {selectedProject && (
                <>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>{selectedProject.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedProject.status) }]}>
                      <Text style={styles.statusText}>{selectedProject.status}</Text>
                    </View>
                  </View>

                  {selectedProject.plan_image_url && (
                    <View style={styles.detailImageContainer}>
                      <Image source={{ uri: selectedProject.plan_image_url }} style={styles.detailImage} />
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Description</Text>
                    <Text style={styles.detailSectionText}>{selectedProject.description || 'No description provided'}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Project Details</Text>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Budget:</Text>
                      <Text style={styles.detailInfoValue}>₹{selectedProject.budget}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Start Date:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedProject.start_date)}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>End Date:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedProject.end_date)}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Engineer:</Text>
                      <Text style={styles.detailInfoValue}>{selectedProject.civil_engineer_name || 'Not assigned'}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Created:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedProject.created_at)}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Last Updated:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedProject.updated_at)}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.detailButton, styles.editButton]}
                onPress={() => {
                  setDetailModalVisible(false);
                  openEditModal(selectedProject);
                }}
              >
                <Text style={styles.detailButtonText}>Edit Project</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.detailButton, styles.closeButton]}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.detailButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
  projectDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  projectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  hireButton: {
    backgroundColor: '#10b981',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
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
