import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, ScrollView } from 'react-native';
import api from '../api/axios';

export default function ProjectDetails({ route, navigation }) {
  const { project } = route.params || {};
  const [currentProject, setCurrentProject] = useState(project);
  const [milestones, setMilestones] = useState([]);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [projectWorkers, setProjectWorkers] = useState([]);

  useEffect(() => {
    if (currentProject?.id) {
      fetchMilestones();
      fetchProjectMaterials();
      fetchProjectWorkers();
    }
  }, [currentProject?.id])

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

  const fetchProjectMaterials = async () => {
    try {
      const response = await api.get(`/materials/project/${currentProject.id}`);
      console.log('project materials : ', response.data);
      setProjectMaterials(response.data);
    } catch (error) {
      console.error('Error fetching project materials:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('ProjectForm', { mode: 'edit', project: currentProject, onSaved: handleEdited })}>
          <Text style={styles.headerAction}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentProject]);

  const handleEdited = (updated) => {
    setCurrentProject(updated);
    navigation.setParams({ project: updated });
  };

  const confirmDelete = () => {
    Alert.alert('Delete Project', 'Are you sure you want to delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteProject },
    ]);
  };

  const deleteProject = async () => {
    try {
      await api.delete(`/projects/${currentProject.id}`);
      Alert.alert('Success', 'Project deleted');
      navigation.goBack();
      if (route.params && route.params.onDeleted) {
        route.params.onDeleted(currentProject.id);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to delete project');
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
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

  const calculateTotalMaterialsCost = () => {
    return projectMaterials.reduce((total, material) => total + material.total_cost, 0);
  };

  if (!currentProject) {
    return (
      <View style={styles.centerContainer}>
        <Text>Project not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{currentProject.name}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(currentProject.status) }]}>
          <Text style={styles.badgeText}>{currentProject.status}</Text>
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
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.row}><Text style={styles.label}>Budget</Text><Text style={styles.value}>₹{currentProject.budget}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Start</Text><Text style={styles.value}>{formatDate(currentProject.start_date)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>End</Text><Text style={styles.value}>{formatDate(currentProject.end_date)}</Text></View>
        {/* <View style={styles.row}><Text style={styles.label}>Engineer</Text><Text style={styles.value}>{currentProject.civil_engineer_name || 'Not assigned'}</Text></View> */}
        <View style={styles.row}><Text style={styles.label}>Created</Text><Text style={styles.value}>{formatDate(currentProject.created_at)}</Text></View>
        {/* <View style={styles.row}><Text style={styles.label}>Updated</Text><Text style={styles.value}>{formatDate(currentProject.updated_at)}</Text></View> */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workers</Text>
        <View style={styles.row}><Text style={styles.label}>Engineer</Text><Text style={styles.value}>{currentProject.civil_engineer_name || 'Not assigned'}</Text></View>
        {projectWorkers?.length === 0 ? null : projectWorkers?.filter(worker => worker.sub_user_type !== 'civil_engineer')?.map((worker, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.label}>{worker.sub_user_type}</Text>
            <Text style={styles.value}>{worker.username || 'Not assigned'}</Text>
          </View>
        ))}
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Materials</Text>
        {projectMaterials.length === 0 ? (
          <Text style={styles.emptyMilestonesText}>No materials have been added to this project yet</Text>
        ) : (
          <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Material</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Ordered By</Text>
            </View>
            {/* Table Rows */}
            {projectMaterials.map((material) => (
              <View key={material.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {material.name}
                  {material.description && (
                    <Text style={styles.materialDescriptionSmall}> ({material.category})</Text>
                  )}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{material.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>₹{material.price_per_unit}</Text>
                <Text style={[styles.tableCell, { flex: 1, fontWeight: '600' }]}>₹{material.total_cost.toLocaleString()}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {material.ordered_by_name}
                  {'\n'}
                  <Text style={styles.tableCellSmall}>
                    {formatDate(material.ordered_at)}
                  </Text>
                </Text>
              </View>
            ))}
            {/* Total Row */}
            <View style={styles.tableTotalRow}>
              <Text style={[styles.tableTotalText, { flex: 5 }]}>Total Material Cost:</Text>
              <Text style={[styles.tableTotalText, { flex: 2, color: '#1e40af', fontSize: 16 }]}>
                ₹{calculateTotalMaterialsCost().toLocaleString()}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.footerActions}>
        <TouchableOpacity style={[styles.footerBtn, styles.editBtn]} onPress={() => navigation.navigate('ProjectForm', { mode: 'edit', project: currentProject, onSaved: handleEdited })}>
          <Text style={styles.footerBtnText}>Edit</Text>
        </TouchableOpacity>
        {currentProject.status === 'planning' && (
          <TouchableOpacity style={[styles.footerBtn, styles.hireBtn]} onPress={() => navigation.navigate('HireEngineer', { projectId: currentProject.id, projectName: currentProject.name })}>
            <Text style={styles.footerBtnText}>Hire Worker</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.footerBtn, styles.deleteBtn]} onPress={confirmDelete}>
          <Text style={styles.footerBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  headerAction: {
    color: '#fff',
    marginRight: 12,
    fontWeight: '600',
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
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#1e40af',
  },
  hireBtn: {
    backgroundColor: '#10b981',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  footerBtnText: {
    color: '#fff',
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'scroll'
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
  materialDescriptionSmall: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  tableCellSmall: {
    fontSize: 11,
    color: '#6b7280',
  },
  tableTotalRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    borderRadius: 8,
    marginTop: 8,
  },
  tableTotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
  },
});
