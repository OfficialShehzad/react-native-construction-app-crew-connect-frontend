import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, ScrollView } from 'react-native';
import api from '../api/axios';

export default function WorkerProjectDetails({ route, navigation }) {
  const { project } = route.params || {};
  const [currentProject, setCurrentProject] = useState(project);

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
        <View style={styles.row}><Text style={styles.label}>Client</Text><Text style={styles.value}>{currentProject.created_by_name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Start Date</Text><Text style={styles.value}>{formatDate(currentProject.start_date)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>End Date</Text><Text style={styles.value}>{formatDate(currentProject.end_date)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Created</Text><Text style={styles.value}>{formatDate(currentProject.created_at)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Updated</Text><Text style={styles.value}>{formatDate(currentProject.updated_at)}</Text></View>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Management</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.managementButton}
            onPress={() => navigation.navigate('ProjectMilestones', { project: currentProject })}
          >
            <Text style={styles.managementButtonText}>Set Milestones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.managementButton}>
            <Text style={styles.managementButtonText}>Get Materials</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.managementButton}>
            <Text style={styles.managementButtonText}>Add workers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.managementButton}>
            <Text style={styles.managementButtonText}>Update Status</Text>
          </TouchableOpacity>
        </View>
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
});
