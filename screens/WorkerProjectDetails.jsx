import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, ScrollView, Modal } from 'react-native';
import api from '../api/axios';

export default function WorkerProjectDetails({ route, navigation }) {
  const { project } = route.params || {};
  const [currentProject, setCurrentProject] = useState(project);
  const [currentUser, setCurrentUser] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [projectWorkers, setProjectWorkers] = useState([]);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(project?.status || 'planning');

  useEffect(() => {
    fetchCurrentUser();
    fetchMilestones();
    fetchProjectWorkers();
  }, []);

  const fetchProjectWorkers = async () => {
    try {
      const response = await api.get(`/workers/project/${currentProject.id}`);
      console.log('project workers : ', response.data);
      setProjectWorkers(response.data);
    } catch (error) {
      console.error('Error fetching project workers:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await api.get(`/milestones/project/${currentProject.id}`);
      console.log('project milestones : ', response.data);
      setMilestones(response.data);
    } catch (error) {
      console.error('Error fetching project milestones:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Project Details',
    });
  }, [navigation]);

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

  const getProjectRole = (project) => {
    if (project.civil_engineer_id && project.civil_engineer_name) {
      return 'Civil Engineer';
    }
    return 'Team Member';
  };

  const getMilestoneColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';    // Yellow
      case 'in_progress': return '#3b82f6'; // Blue
      case 'completed': return '#10b981';  // Green
      default: return '#6b7280';            // Gray
    }
  };

  const getMilestoneStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentProject.status) {
      setIsStatusModalVisible(false);
      Alert.alert('Info', 'No change made to status');
      return;
    }
    try {
      const response = await api.put(`/projects/${currentProject.id}`, {
        status: selectedStatus,
        statusOnly: true
      });
      setCurrentProject({ ...currentProject, status: selectedStatus, updated_at: response.data.updated_at });
      setIsStatusModalVisible(false);
      Alert.alert('Success', 'Project status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update project status');
      console.error('Update status error:', error);
    }
  };

  if (!currentProject) {
    return (
      <View style={styles.centerContainer}>
        <Text>Project not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>{currentProject.name}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(currentProject.status) }]}>
            <Text style={styles.badgeText}>{getStatusText(currentProject.status)}</Text>
          </View>
        </View>

        {currentProject.plan_image_url ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: currentProject.plan_image_url }} style={styles.image} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{currentProject.description || 'No description provided'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.row}><Text style={styles.label}>Budget</Text><Text style={styles.value}>₹{currentProject.budget}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Your Role</Text><Text style={styles.value}>{getProjectRole(currentProject)}</Text></View>
          {/* <View style={styles.row}><Text style={styles.label}>Client</Text><Text style={styles.value}>{currentProject.created_by_name}</Text></View> */}
          <View style={styles.row}><Text style={styles.label}>Start Date</Text><Text style={styles.value}>{formatDate(currentProject.start_date)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>End Date</Text><Text style={styles.value}>{formatDate(currentProject.end_date)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Created</Text><Text style={styles.value}>{formatDate(currentProject.created_at)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Updated</Text><Text style={styles.value}>{formatDate(currentProject.updated_at)}</Text></View>
        </View>

        {currentUser?.sub_user_type === 'civil_engineer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personnel</Text>
            <View style={styles.row}><Text style={styles.label}>Client</Text><Text style={styles.value}>{currentProject.created_by_name || 'Not assigned'}</Text></View>
            {projectWorkers?.length === 0 ? null : projectWorkers?.filter(worker => worker.sub_user_type !== 'civil_engineer')?.map((worker, index) => (
              <View style={styles.row} key={index}>
                <Text style={styles.label}>{worker.sub_user_type}</Text>
                <Text style={styles.value}>{worker.username || 'Not assigned'}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Status</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(currentProject.status) }]} />
            <Text style={styles.statusDescription}>
              {currentProject.status === 'planning' && 'Project is in planning phase'}
              {currentProject.status === 'in_progress' && 'Project is currently in progress'}
              {currentProject.status === 'completed' && 'Project has been completed'}
              {currentProject.status === 'cancelled' && 'Project has been cancelled'}
            </Text>
          </View>
        </View>

        {currentUser?.sub_user_type === 'civil_engineer' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Management</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.managementButton}
                onPress={() => navigation.navigate('ProjectMilestones', { project: currentProject })}
              >
                <Text style={styles.managementButtonText}>Set Milestones</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.managementButton}
                onPress={() => navigation.navigate('ProjectMaterials', { project: currentProject })}
              >
                <Text style={styles.managementButtonText}>Get Materials</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.managementButton} onPress={() => navigation.navigate('HireWorkers', { projectId: currentProject.id, projectName: currentProject.name })}>
                <Text style={styles.managementButtonText}>Add workers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.managementButton} onPress={() => {
                setSelectedStatus(currentProject.status);
                setIsStatusModalVisible(true);
              }}>
                <Text style={styles.managementButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <View style={styles.timelineContainer}>
              {milestones.length === 0 ? (
                <Text style={styles.emptyMilestonesText}>No milestones set for this project</Text>
              ) : (
                milestones.map((milestone, index) => (
                  <View key={milestone.id} style={styles.timelineItem}>
                    <View style={styles.timelineItemContent}>
                      <View style={styles.timelineLeft}>
                        <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                        <Text style={styles.milestoneDate}>
                          {formatDate(milestone.target_date)}
                        </Text>
                        {milestone.completion_date && (
                          <Text style={styles.milestoneCompletedDate}>
                            Completed: {formatDate(milestone.completion_date)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.timelineCenter}>
                        <View style={[styles.timelineCircle, { backgroundColor: getMilestoneColor(milestone.status) }]} />
                        {index < milestones.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={[styles.milestoneStatus, { color: getMilestoneColor(milestone.status) }]}>
                          {getMilestoneStatusText(milestone.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <Modal visible={isStatusModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Project Status</Text>
            <View style={styles.statusOptions}>
              {['planning', 'in_progress', 'completed', 'cancelled'].map(status => (
                <TouchableOpacity key={status} style={[styles.statusOption, selectedStatus === status && styles.selectedStatusOption, { backgroundColor: getStatusColor(status) + '20' }]} onPress={() => setSelectedStatus(status)}>
                  <View style={styles.statusOptionLeft}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                    <Text style={[styles.statusOptionText, selectedStatus === status && styles.selectedStatusOptionText]}>{getStatusText(status)}</Text>
                  </View>
                  {selectedStatus === status && <Text style={styles.selectedMark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsStatusModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.updateButton, selectedStatus === currentProject.status && styles.disabledUpdateButton]} onPress={handleUpdateStatus}>
                <Text style={styles.updateButtonText}>{selectedStatus === currentProject.status ? 'No Change' : 'Update'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  headerBlock: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  imageWrap: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    color: '#6b7280',
  },
  value: {
    color: '#111827',
    fontWeight: '600',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  managementButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  managementButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    marginBottom: 16,
  },
  timelineItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    flex: 1,
    paddingRight: 16,
    alignItems: 'flex-end',
  },
  timelineCenter: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 16,
    left: 9,
    width: 2,
    height: 48,
    backgroundColor: '#e5e7eb',
    zIndex: -1,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 16,
    alignItems: 'flex-start',
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  milestoneDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  milestoneCompletedDate: {
    fontSize: 13,
    color: '#10b981',
    fontStyle: 'italic',
  },
  milestoneStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyMilestonesText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingTop: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOptions: {
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  selectedStatusOption: {
    borderColor: '#3b82f6',
  },
  statusOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  selectedStatusOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  selectedMark: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  disabledUpdateButton: {
    backgroundColor: '#9ca3af',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
