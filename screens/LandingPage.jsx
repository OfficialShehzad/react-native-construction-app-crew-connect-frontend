// screens/LandingPage.jsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LandingPage({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="construct" size={24} color="#1e40af" />
            <Text style={styles.logoText}>CrewConnect</Text>
          </View>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Connect. Build. Succeed.</Text>
          <Text style={styles.heroSubtitle}>
            The ultimate platform for construction professionals to connect, collaborate, and complete projects efficiently.
          </Text>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose CrewConnect?</Text>
        <Text style={styles.sectionSubtitle}>
          Everything you need to manage construction projects in one place
        </Text>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="people" size={32} color="#1e40af" />
            </View>
            <Text style={styles.featureTitle}>Hire Skilled Workers</Text>
            <Text style={styles.featureDescription}>
              Connect with certified civil engineers and skilled construction workers
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="clipboard" size={32} color="#1e40af" />
            </View>
            <Text style={styles.featureTitle}>Project Management</Text>
            <Text style={styles.featureDescription}>
              Track milestones, manage budgets, and monitor project progress
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="cube" size={32} color="#1e40af" />
            </View>
            <Text style={styles.featureTitle}>Material Management</Text>
            <Text style={styles.featureDescription}>
              Order and track construction materials directly from the platform
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="chatbubbles" size={32} color="#1e40af" />
            </View>
            <Text style={styles.featureTitle}>Real-time Communication</Text>
            <Text style={styles.featureDescription}>
              Stay connected with your team through instant messaging and updates
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="analytics" size={32} color="#1e40af" />
            </View>
            <Text style={styles.featureTitle}>Progress Tracking</Text>
            <Text style={styles.featureDescription}>
              Monitor project milestones and track completion status
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="document-text" size={32} color="#1e40af" />
            </View>
            <Text style={styles.featureTitle}>Document Management</Text>
            <Text style={styles.featureDescription}>
              Store and share project documents, plans, and reports
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Active Projects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Skilled Workers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Transform Your Construction Business?</Text>
        <Text style={styles.ctaDescription}>
          Join thousands of construction professionals who trust CrewConnect for their projects
        </Text>
        
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.ctaButtonText}>Start Your Free Trial</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.ctaButtonIcon} />
        </TouchableOpacity>
        
        <Text style={styles.ctaNote}>No credit card required • Free forever</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: "#ffffff",
  },
  
  // Navigation Bar
  navbar: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  navbarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  loginButtonText: {
    color: "#1e40af",
    fontWeight: "600",
    fontSize: 14,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#f8fafc",
  },
  heroContent: {
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    lineHeight: 28,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#1e40af",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1e40af",
    flex: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1e40af",
    fontWeight: "600",
    fontSize: 16,
  },
  heroImageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    width: "100%",
    height: 300,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 28,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: "#f8fafc",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#dbeafe",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },

  // Stats Section
  statsSection: {
    backgroundColor: "#1e40af",
    paddingVertical: 60,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: "#dbeafe",
    textAlign: "center",
  },

  // CTA Section
  ctaSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  ctaDescription: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
  },
  ctaButton: {
    backgroundColor: "#1e40af",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    marginRight: 8,
  },
  ctaButtonIcon: {
    marginLeft: 4,
  },
  ctaNote: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
