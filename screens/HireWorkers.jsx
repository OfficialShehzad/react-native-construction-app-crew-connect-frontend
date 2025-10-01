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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../api/axios';
import { Ionicons } from '@expo/vector-icons';

export default function HireWorkers({ route, navigation }) {
  const { projectId, projectName } = route.params || {};
  const [workers, setWorkers] = useState([]);
  const [workerRequests, setWorkerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkers();
    fetchWorkerRequests();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects/available-workers');
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
      Alert.alert('Error', 'Failed to fetch available workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerRequests = async () => {
    try {
      const response = await api.get('/workers/worker_requests');
      console.log('work requests : ', response.data);
      setWorkerRequests(response.data);
    } catch (error) {
      console.error('Error fetching worker requests:', error);
    }
  }

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchWorkers();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) {
      Alert.alert('Error', 'Please enter a message for the worker');
      return;
    }

    try {
      setSendingRequest(true);
      const response = await api.post(`/projects/${projectId}/request-worker`, {
        worker_id: selectedWorker.id,
        message: requestMessage.trim(),
      });

      Alert.alert(
        'Success',
        'Request sent successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setRequestModalVisible(false);
              setRequestMessage('');
              setSelectedWorker(null);
              // Refresh the workers list to show updated status
              fetchWorkers();
              fetchWorkerRequests();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending request:', error);
      if (error.response?.data?.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to send request');
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const openRequestModal = (worker) => {
    setSelectedWorker(worker);
    setRequestModalVisible(true);
  };

  const renderWorker = ({ item }) => {
    const projectWorkerRequests = workerRequests.filter(req => req.project_id === projectId);
    const isRequestSent = projectWorkerRequests.some(req => req.worker_id === item.id);
    return(
    <View style={styles.engineerCard}>
      <View style={styles.engineerLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.username || '?').slice(0,1).toUpperCase()}</Text>
        </View>
        <View style={styles.engineerInfo}>
          <Text style={styles.engineerName}>{item.username}</Text>
          <Text style={styles.engineerEmail}>{item.email}</Text>
          <Text style={styles.engineerEmail}>{item.sub_user_type}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={{...styles.requestButton, ...(isRequestSent && { backgroundColor: '#999' })}}
        onPress={() => {
          if (isRequestSent) return;
          openRequestModal(item);
        }}
      >
        <Text style={styles.requestButtonText}>{isRequestSent ? 'Request Sent' : 'Send Request'}</Text>
      </TouchableOpacity>
    </View>
  )};

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading workers...</Text>
      </View>
    );
  }

  const filteredWorkers = workers.filter((w) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (w.username && w.username.toLowerCase().includes(q)) ||
      (w.email && w.email.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.projectInfo}>
        <Text style={styles.projectInfoTitle}>Hire a worker for your project!</Text>
        <Text style={styles.projectInfoSubtitle}>
          Project: {projectName || 'Unknown Project'}
        </Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filteredWorkers}
        renderItem={renderWorker}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workers available</Text>
            <Text style={styles.emptySubtext}>There are currently no workers available for hire</Text>
            <TouchableOpacity style={[styles.modalButton, styles.retryButton]} onPress={fetchWorkers}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Request Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={requestModalVisible}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Request</Text>

            {selectedWorker && (
              <View style={styles.selectedEngineerInfo}>
                <Text style={styles.selectedEngineerName}>{selectedWorker.username}</Text>
                <Text style={styles.selectedEngineerEmail}>{selectedWorker.email}</Text>
              </View>
            )}

            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Message to Worker</Text>
              <TextInput
                style={[styles.messageInput, styles.textArea]}
                placeholder="Write a message explaining your project requirements..."
                multiline
                numberOfLines={4}
                value={requestMessage}
                onChangeText={setRequestMessage}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {requestMessage.length}/500 characters
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setRequestModalVisible(false);
                  setRequestMessage('');
                  setSelectedWorker(null);
                }}
                disabled={sendingRequest}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendRequest}
                disabled={sendingRequest}
              >
                {sendingRequest ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Request</Text>
                )}
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
  projectInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  projectInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectInfoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
  },
  listContainer: {
    padding: 20,
  },
  engineerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engineerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 18,
  },
  engineerInfo: {
    flex: 1,
  },
  engineerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  engineerEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  requestButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  retryButton: {
    marginTop: 16,
    backgroundColor: '#1e40af',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedEngineerInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedEngineerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  selectedEngineerEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  messageSection: {
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  textArea: {
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  sendButton: {
    backgroundColor: '#10b981',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
