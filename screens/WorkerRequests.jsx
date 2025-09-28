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

export default function WorkerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workers/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleRespondToRequest = async (requestId, status) => {
    try {
      setResponding(true);
      const response = await api.put(`/workers/requests/${requestId}/respond`, {
        status: status,
      });

      Alert.alert(
        'Success',
        `Request ${status} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDetailModalVisible(false);
              setSelectedRequest(null);
              fetchRequests(); // Refresh the list
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error responding to request:', error);
      if (error.response?.data?.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to respond to request');
      }
    } finally {
      setResponding(false);
    }
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRequest = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => openDetailModal(item)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.projectName}>{item.project_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.requestedBy}>
        Requested by: {item.requested_by_name}
      </Text>

      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.project_description || 'No description provided'}
      </Text>

      <View style={styles.requestDetails}>
        <Text style={styles.budgetText}>Budget: ₹{item.budget}</Text>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.pendingActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRespondToRequest(item.id, 'accepted')}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRespondToRequest(item.id, 'rejected')}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Project Requests</Text>
        <Text style={styles.headerSubtitle}>
          {requests.filter(r => r.status === 'pending').length} pending requests
        </Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>
              You'll see project requests from users here
            </Text>
          </View>
        }
      />

      {/* Request Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <ScrollView style={styles.detailScroll}>
              {selectedRequest && (
                <>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>{selectedRequest.project_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(selectedRequest.status)}</Text>
                    </View>
                  </View>

                  {/* Project Plan Image */}
                  {selectedRequest.plan_image_url && (
                    <View style={styles.detailImageContainer}>
                      <Text style={styles.imageLabel}>Project Plan</Text>
                      <Image 
                        source={{ uri: selectedRequest.plan_image_url }} 
                        style={styles.detailImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Project Details</Text>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Description:</Text>
                      <Text style={styles.detailInfoValue}>
                        {selectedRequest.project_description || 'No description provided'}
                      </Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Budget:</Text>
                      <Text style={styles.detailInfoValue}>₹{selectedRequest.budget}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Requested by:</Text>
                      <Text style={styles.detailInfoValue}>{selectedRequest.requested_by_name}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Requested on:</Text>
                      <Text style={styles.detailInfoValue}>{formatDate(selectedRequest.created_at)}</Text>
                    </View>
                    {selectedRequest.responded_at && (
                      <View style={styles.detailInfo}>
                        <Text style={styles.detailInfoLabel}>Responded on:</Text>
                        <Text style={styles.detailInfoValue}>{formatDate(selectedRequest.responded_at)}</Text>
                      </View>
                    )}
                  </View>

                  {selectedRequest.message && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Message from Client</Text>
                      <Text style={styles.messageText}>{selectedRequest.message}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.detailActions}>
              {selectedRequest?.status === 'pending' ? (
                <>
                  <TouchableOpacity
                    style={[styles.detailButton, styles.acceptButton]}
                    onPress={() => handleRespondToRequest(selectedRequest.id, 'accepted')}
                    disabled={responding}
                  >
                    {responding ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.detailButtonText}>Accept Request</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailButton, styles.rejectButton]}
                    onPress={() => handleRespondToRequest(selectedRequest.id, 'rejected')}
                    disabled={responding}
                  >
                    <Text style={styles.detailButtonText}>Reject Request</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.detailButton, styles.closeButton]}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={styles.detailButtonText}>Close</Text>
                </TouchableOpacity>
              )}
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
  listContainer: {
    padding: 20,
  },
  requestCard: {
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
  requestHeader: {
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
  requestedBy: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
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
  // New image styles
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
  messageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
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
