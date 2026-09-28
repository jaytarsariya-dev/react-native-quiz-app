import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { styles } from '../Auth/AuthStyle';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const auth = getAuth();

    const resetPassword = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => Alert.alert('Password reset link sent!'))
            .catch(error => Alert.alert('Error', error.message));
    };

    return (
        <LinearGradient
            colors={['#4C1D95', '#7C3AED', '#DB2777']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>

                <View style={styles.inputContainer}>
                    <Icon name="email" size={24} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity style={styles.button}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.link}>
                        Back to <Text style={styles.linkBold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </LinearGradient>
    );
}