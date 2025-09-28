import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import api from '../api/axios';

export default function WorkerProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'in_progress', 'completed'

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return '#fbbf24';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
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

  const getFilteredProjects = () => {
    if (filter === 'all') return projects;
    return projects.filter(project => project.status === filter);
  };

  const getProjectRole = (project) => {
    if (project.civil_engineer_id && project.civil_engineer_name) {
      return 'Civil Engineer';
    }
    return 'Team Member';
  };

  const renderProject = ({ item }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => openDetailModal(item)}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description || 'No description provided'}
      </Text>

      <View style={styles.projectDetails}>
        <Text style={styles.detailText}>Budget: ₹{item.budget}</Text>
        <Text style={styles.detailText}>Role: {getProjectRole(item)}</Text>
        <Text style={styles.detailText}>Client: {item.created_by_name}</Text>
      </View>

      <View style={styles.projectFooter}>
        <Text style={styles.dateText}>
          {formatDate(item.start_date)} - {formatDate(item.end_date)}
        </Text>
        <Text style={styles.roleText}>{getProjectRole(item)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  const filteredProjects = getFilteredProjects();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Projects</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProjects.length} {filter === 'all' ? 'total' : filter} projects
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('in_progress', 'In Progress')}
        {renderFilterButton('completed', 'Completed')}
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? "You don't have any projects yet" 
                : `No ${filter.replace('_', ' ')} projects found`
              }
            </Text>
          </View>
        }
      />

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
                      <Text style={styles.statusText}>{getStatusText(selectedProject.status)}</Text>
                    </View>
                  </View>

                  {/* Project Plan Image */}
                  {selectedProject.plan_image_url && (
                    <View style={styles.detailImageContainer}>
                      <Text style={styles.imageLabel}>Project Plan</Text>
                      <Image 
                        source={{ uri: selectedProject.plan_image_url }} 
                        style={styles.detailImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Project Information</Text>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Description:</Text>
                      <Text style={styles.detailInfoValue}>
                        {selectedProject.description || 'No description provided'}
                      </Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Budget:</Text>
                      <Text style={styles.detailInfoValue}>₹{selectedProject.budget}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Your Role:</Text>
                      <Text style={styles.detailInfoValue}>{getProjectRole(selectedProject)}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Client:</Text>
                      <Text style={styles.detailInfoValue}>{selectedProject.created_by_name}</Text>
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
                      <Text style={styles.detailInfoLabel}>Project Created:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedProject.created_at)}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Last Updated:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedProject.updated_at)}</Text>
                    </View>
                  </View>

                  {/* Project Progress Section */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Project Status</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(selectedProject.status) }]} />
                      <Text style={styles.statusDescription}>
                        {selectedProject.status === 'planning' && 'Project is in planning phase'}
                        {selectedProject.status === 'in_progress' && 'Project is currently in progress'}
                        {selectedProject.status === 'completed' && 'Project has been completed'}
                        {selectedProject.status === 'cancelled' && 'Project has been cancelled'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.detailActions}>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  filterButtonActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterButtonTextActive: {
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
    lineHeight: 20,
  },
  projectDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  roleText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
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
  detailModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  detailScroll: {
    maxHeight: 600,
  },
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
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  detailInfo: {
    marginBottom: 12,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailInfoValue: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
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
