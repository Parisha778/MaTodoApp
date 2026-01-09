import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, Keyboard, Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [image, setImage] = useState(null);

  // Charger les données au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      const savedTasks = await AsyncStorage.getItem('@tasks');
      const savedImage = await AsyncStorage.getItem('@profile_pic');
      if (savedTasks) setTaskList(JSON.parse(savedTasks));
      if (savedImage) setImage(savedImage);
    };
    loadInitialData();
  }, []);

  // Sauvegarder les tâches
  const saveTasks = async (tasks) => {
    await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
  };

  // Fonction pour choisir une photo
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await AsyncStorage.setItem('@profile_pic', uri);
    }
  };

  const handleAddTask = () => {
    if (task.trim().length > 0) {
      const newList = [...taskList, { id: Date.now().toString(), text: task, completed: false }];
      setTaskList(newList);
      saveTasks(newList);
      setTask('');
      Keyboard.dismiss();
    }
  };

  const deleteTask = (id) => {
    const newList = taskList.filter(item => item.id !== id);
    setTaskList(newList);
    saveTasks(newList);
  };

  const toggleComplete = (id) => {
    const newList = taskList.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setTaskList(newList);
    saveTasks(newList);
  };

  // Couleurs dynamiques
  const themeContainer = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const themeText = isDarkMode ? styles.darkText : styles.lightText;
  const themeCard = isDarkMode ? styles.darkCard : styles.lightCard;

  return (
    <View style={[styles.container, themeContainer]}>
      
      {/* HEADER AVEC PHOTO ET MODE SOMBRE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.placeholderPic]}>
              <Text style={{fontSize: 10}}>Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.themeToggle}>
          <Text style={{ fontSize: 30 }}>{isDarkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, themeCard]}>
            <TouchableOpacity style={styles.taskTextContainer} onPress={() => toggleComplete(item.id)}>
              <Text style={[styles.taskText, themeText, item.completed && styles.completedText]}>
                {item.completed ? "✅ " : "○ "} {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputWrapper}>
        <TextInput 
          style={[styles.input, themeCard, themeText]} 
          placeholder={'Nouvelle tâche...'} 
          placeholderTextColor={isDarkMode ? "#999" : "#666"}
          value={task} 
          onChangeText={setTask} 
        />
        <TouchableOpacity onPress={handleAddTask}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#F5F5F5' },
  darkContainer: { backgroundColor: '#121212' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  placeholderPic: {
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  themeToggle: { padding: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: {
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  lightCard: { backgroundColor: '#FFF' },
  darkCard: { backgroundColor: '#1E1E1E' },
  taskTextContainer: { flex: 1 },
  taskText: { fontSize: 16 },
  lightText: { color: '#333' },
  darkText: { color: '#FFF' },
  completedText: { textDecorationLine: 'line-through', color: '#AAA' },
  deleteButton: { fontSize: 22, color: '#FF3B30', paddingLeft: 10 },
  inputWrapper: {
    position: 'absolute', bottom: 30, width: '100%',
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'
  },
  input: {
    paddingVertical: 15, paddingHorizontal: 20,
    borderRadius: 30, width: '75%', borderWidth: 1, borderColor: '#C0C0C0'
  },
  addWrapper: {
    width: 55, height: 55, backgroundColor: '#007AFF',
    borderRadius: 30, justifyContent: 'center', alignItems: 'center'
  },
  addText: { fontSize: 30, color: '#FFF' },
});