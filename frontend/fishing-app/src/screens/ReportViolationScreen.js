
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ReportViolationScreen() {
    const [violationType, setViolationType] = useState('');
    const [description, setDescription] = useState('');
    const [evidence, setEvidence] = useState([]); 
    const [location, setLocation] = useState(null);

    // Take photo evidence
    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Need camera permission to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.8,
            aspect: [4, 3],
        });

        if (!result.canceled) {
            setEvidence(prev => [...prev, result.assets[0].uri]); 
        }
    };

    // Remove a photo
    const removePhoto = (indexToRemove) => {
        setEvidence(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Get current location
    const getCurrentLocation = async () => {
        Alert.alert('Location', 'Current location will be captured');
        setLocation({ latitude: 6.9271, longitude: 79.8612 });
    };

    // Submit report
    const submitReport = async () => {
        if (!violationType || !description) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            Alert.alert('Success', `Report submitted with ${evidence.length} photos!`);
            // Reset form
            setViolationType('');
            setDescription('');
            setEvidence([]);
            setLocation(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit report');
        }
    };

    return (
        <ScrollView className="flex-1 bg-darkBlue p-4">
            <Text className="text-2xl font-bold text-white text-center mb-6">
                🚨 Report Illegal Fishing
            </Text>

            {/* Violation Type */}
            <View className="mb-4">
                <Text className="text-white text-lg mb-2">Violation Type *</Text>
                <TextInput
                    className="bg-lightPeach rounded-2xl p-4 text-darkBlue"
                    placeholder="e.g., Fishing in restricted zone, illegal nets"
                    value={violationType}
                    onChangeText={setViolationType}
                />
            </View>

            {/* Description */}
            <View className="mb-4">
                <Text className="text-white text-lg mb-2">Description *</Text>
                <TextInput
                    className="bg-lightPeach rounded-2xl p-4 text-darkBlue h-32"
                    placeholder="Describe what you witnessed..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
            </View>

            {/* Evidence Photos - UPDATED SECTION */}
            <View className="mb-4">
                <Text className="text-white text-lg mb-2">
                    Evidence Photos {evidence.length > 0 ? `(${evidence.length})` : ''}
                </Text>
                
                {/* Display taken photos as thumbnails */}
                {evidence.length > 0 && (
                    <View className="flex-row flex-wrap mb-4">
                        {evidence.map((photoUri, index) => (
                            <View key={index} className="relative mr-2 mb-2">
                                <Image 
                                    source={{ uri: photoUri }} 
                                    className="w-20 h-20 rounded-lg"
                                />
                                {/* Remove button */}
                                <TouchableOpacity 
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                                    onPress={() => removePhoto(index)}
                                >
                                    <Text className="text-white font-bold">×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                
                <TouchableOpacity 
                    className="bg-seaGreen rounded-2xl p-4 items-center"
                    onPress={takePhoto}
                >
                    <Text className="text-white text-lg">
                        📷 {evidence.length > 0 ? 'Add Another Photo' : 'Take Photo Evidence'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Location */}
            <View className="mb-6">
                <Text className="text-white text-lg mb-2">Location</Text>
                <TouchableOpacity 
                    className="bg-lightGreen rounded-2xl p-4 items-center"
                    onPress={getCurrentLocation}
                >
                    <Text className="text-darkBlue text-lg">
                        📍 Capture Current Location
                    </Text>
                </TouchableOpacity>
                {location && (
                    <Text className="text-lightGreen mt-2">
                        Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Text>
                )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
                className="bg-red-600 rounded-2xl p-4 items-center"
                onPress={submitReport}
            >
                <Text className="text-white text-xl font-bold">
                    Submit Report {evidence.length > 0 ? `(${evidence.length} photos)` : ''}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}