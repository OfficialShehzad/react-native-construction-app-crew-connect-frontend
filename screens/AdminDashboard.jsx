import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, projectsRes, materialsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/projects'),
        api.get('/materials')
      ]);

      const users = usersRes.data || [];
      const projects = projectsRes.data || [];
      const materials = materialsRes.data || [];

      // Calculate statistics
      const stats = {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.user_type === 'admin').length,
        totalRegularUsers: users.filter(u => u.user_type === 'user').length,
        totalWorkers: users.filter(u => u.user_type === 'worker').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        cancelledProjects: projects.filter(p => p.status === 'cancelled').length,
        planningProjects: projects.filter(p => p.status === 'planning').length,
        totalMaterials: materials.length,
        totalStockValue: materials.reduce((sum, m) => sum + (m.stock_quantity * m.price_per_unit), 0),
        lowStockMaterials: materials.filter(m => m.stock_quantity < 20).length,
      };

      setDashboardData({
        stats,
        recentProjects: projects.slice(0, 5), // Show last 5 projects
        lowStockMaterials: materials.filter(m => m.stock_quantity < 20).slice(0, 5), // Show materials with low stock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty data on error
      setDashboardData({
        stats: {
          totalUsers: 0,
          totalAdmins: 0,
          totalRegularUsers: 0,
          totalWorkers: 0,
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          cancelledProjects: 0,
          planningProjects: 0,
          totalMaterials: 0,
          totalStockValue: 0,
          lowStockMaterials: 0,
        },
        recentProjects: [],
        lowStockMaterials: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'in_progress': return '#3b82f6';
      case 'planning': return '#f59e0b';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'play-circle';
      case 'planning': return 'clipboard-outline';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderStatCard = (number, label, icon, trend = null) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={20} color="#1e40af" />
        {trend && (
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderBarChart = (data, total, title) => {
    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.chartContainer}>
          {Object.entries(data).map(([key, value]) => {
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const color = getStatusColor(key);

            return (
              <View key={key} style={styles.chartBar}>
                <View style={styles.barLabel}>
                  <Text style={styles.barText}>{label}</Text>
                  <Text style={styles.barValue}>{value}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  const { stats, recentProjects, lowStockMaterials } = dashboardData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your construction management system</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.flexRow}>
          {renderStatCard(stats.totalUsers, 'Total Users', 'people')}
          {renderStatCard(stats.activeProjects, 'Active Projects', 'business')}
          {renderStatCard(stats.totalMaterials, 'Materials', 'cube-sharp')}
        </View>
        {renderStatCard(formatCurrency(stats.totalStockValue), 'Stock Value', 'cash')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Status</Text>
        <View style={styles.chartsContainer}>
          {renderBarChart(
            {
              planning: stats.planningProjects,
              in_progress: stats.activeProjects,
              completed: stats.completedProjects,
              cancelled: stats.cancelledProjects,
            },
            stats.totalProjects,
            `Project Distribution (${stats.totalProjects} total)`
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Distribution</Text>
        <View style={styles.chartsContainer}>
          {renderBarChart(
            {
              // admin: stats.totalAdmins,
              user: stats.totalRegularUsers,
              worker: stats.totalWorkers,
            },
            stats.totalUsers,
            `User Types (${stats.totalUsers} total)`
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Projects</Text>
        {recentProjects.length > 0 ? (
          <View style={styles.listContainer}>
            {recentProjects.map((project) => (
              <View key={project.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name={getStatusIcon(project.status)} size={20} color={getStatusColor(project.status)} />
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{project.name}</Text>
                    <Text style={styles.listItemSubtitle}>Status: {project.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.listItemDate}>
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No projects found</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Low Stock Alert</Text>
        {lowStockMaterials.length > 0 ? (
          <View style={styles.listContainer}>
            {lowStockMaterials.map((material) => (
              <View key={material.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="warning" size={20} color="#f59e0b" />
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{material.name}</Text>
                    <Text style={styles.listItemSubtitle}>
                      Stock: {material.stock_quantity} {material.unit}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.listItemValue, styles.warningText]}>
                  {formatCurrency(material.price_per_unit)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>All materials are well stocked</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 12,
  },
  flexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 8,
  },
  statHeader: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  trendBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ee8c0e',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trendText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartSection: {
    paddingVertical: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    paddingHorizontal: 8,
  },
  chartBar: {
    marginBottom: 12,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  barValue: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  barContainer: {
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  listItemText: {
    marginLeft: 12,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listItemDate: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  warningText: {
    color: '#f59e0b',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
