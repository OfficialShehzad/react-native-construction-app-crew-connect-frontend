import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import api from '../api/axios';

export default function UserDetails({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/auth/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/auth/users/${userId}`);
              Alert.alert('Success', 'User deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting user:', error);
              const message = error.response?.data?.error || 'Failed to delete user';
              Alert.alert('Error', message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>User Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{user.id}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user.username}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>User Type:</Text>
          <Text style={styles.value}>{user.user_type}</Text>
        </View>

        {user.sub_user_type && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Sub Type:</Text>
            <Text style={styles.value}>{user.sub_user_type}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Available:</Text>
          <Text style={styles.value}>{user.is_available ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>{new Date(user.created_at).toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteUser}>
          <Text style={styles.deleteButtonText}>Delete User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
