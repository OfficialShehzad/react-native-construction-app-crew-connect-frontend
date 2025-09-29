import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/axios';

export default function ProjectForm({ route, navigation }) {
  const { mode = 'create', project = null, onSaved } = route.params || {};

  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    budget: project?.budget ? String(project.budget) : '',
    plan_image_url: project?.plan_image_url || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    status: project?.status || 'planning',
  });

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const isEdit = mode === 'edit';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need gallery permissions to select images');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setForm({ ...form, plan_image_url: result.assets[0].uri });
    }
  };

  const save = async () => {
    if (!form.name || !form.budget) {
      Alert.alert('Validation', 'Name and budget are required');
      return;
    }
    try {
      const body = new FormData();
      body.append('name', form.name);
      body.append('description', form.description);
      body.append('budget', form.budget);
      body.append('start_date', form.start_date);
      body.append('end_date', form.end_date);
      if (isEdit) body.append('status', form.status || 'planning');
      if (form.plan_image_url && form.plan_image_url.startsWith('file://')) {
        const imageUri = form.plan_image_url;
        const filename = imageUri.split('/').pop() || 'plan_image.jpg';
        body.append('plan_image', { uri: imageUri, type: 'image/jpeg', name: filename });
      }

      const resp = isEdit
        ? await api.put(`/projects/${project.id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/projects', body, { headers: { 'Content-Type': 'multipart/form-data' } });

      const saved = resp.data;
      if (onSaved) onSaved(saved);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save project');
    }
  };

  const onStartChange = (_e, date) => {
    setShowStart(false);
    if (date) setForm({ ...form, start_date: date.toISOString().split('T')[0] });
  };
  const onEndChange = (_e, date) => {
    setShowEnd(false);
    if (date) setForm({ ...form, end_date: date.toISOString().split('T')[0] });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{isEdit ? 'Edit Project' : 'Create Project'}</Text>

      <TextInput style={styles.input} placeholder="Project Name *" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline />
      <TextInput style={styles.input} placeholder="Budget (₹) *" value={form.budget} keyboardType="numeric" onChangeText={(t) => setForm({ ...form, budget: t })} />

      <View style={styles.block}>
        <Text style={styles.label}>Plan Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {form.plan_image_url ? (
            <Image source={{ uri: form.plan_image_url }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Select from Gallery</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStart(true)}>
          <Text style={styles.dateText}>{form.start_date || 'Select Start Date'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEnd(true)}>
          <Text style={styles.dateText}>{form.end_date || 'Select End Date'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={save}>
          <Text style={styles.btnText}>{isEdit ? 'Update' : 'Create'}</Text>
        </TouchableOpacity>
      </View>

      {showStart && (
        <DateTimePicker value={form.start_date ? new Date(form.start_date) : new Date()} mode="date" display="default" onChange={onStartChange} />
      )}
      {showEnd && (
        <DateTimePicker value={form.end_date ? new Date(form.end_date) : new Date()} mode="date" display="default" onChange={onEndChange} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  block: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  imagePicker: {
    height: 140,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    color: '#6b7280',
  },
  dateBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  dateText: {
    color: '#111827',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#1e40af',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  statusChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  statusChipText: {
    color: '#374151',
  },
  statusChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});


