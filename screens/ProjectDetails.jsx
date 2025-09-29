import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, ScrollView } from 'react-native';
import api from '../api/axios';

export default function ProjectDetails({ route, navigation }) {
  const { project } = route.params || {};
  const [currentProject, setCurrentProject] = useState(project);

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
        <View style={styles.row}><Text style={styles.label}>Engineer</Text><Text style={styles.value}>{currentProject.civil_engineer_name || 'Not assigned'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Created</Text><Text style={styles.value}>{formatDate(currentProject.created_at)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Updated</Text><Text style={styles.value}>{formatDate(currentProject.updated_at)}</Text></View>
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
});


