import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Auth/AuthStyle';

const { width, height } = Dimensions.get('window');

export default function InsertQuestionScreen({ navigation }) {
    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [category, setCategory] = useState('');
    const db = getFirestore();
    const [loading, setLoading] = useState(false);

    // Sample categories for the dropdown
    const categories = [
        'General Knowledge',
        'Science',
        'History',
        'Mathematics',
        'Literature',
        'Technology',
        'Geography',
        'Sports',
        'Movies',
        'Current Affairs',
        'Tech Titans',
        'World Mastery',
        'Elite Mind'
    ];

    const handleCorrectAnswerChange = (value) => {
        setCorrectAnswer(value);
    };

    const handlePickerPlaceholderPress = () => {
        Snackbar.show({
            text: 'Please fill all options before selecting a correct answer',
            duration: Snackbar.LENGTH_LONG,
            backgroundColor: '#fe6c6a',
            textColor: '#fff',
            action: {
                text: 'OK',
                textColor: '#fff',
                onPress: () => console.log('OK pressed'),
            },
        });
    };

    const handleSubmit = async () => {
        if (!question || !option1 || !option2 || !option3 || !option4 || !correctAnswer || !category) {
            Snackbar.show({
                text: 'Please fill in all fields',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#fe6c6a',
                textColor: '#fff',
                action: {
                    text: 'OK',
                    textColor: '#fff',
                    onPress: () => console.log('OK pressed'),
                },
            });
            return;
        }

        if (![option1, option2, option3, option4].includes(correctAnswer)) {
            Snackbar.show({
                text: 'Correct answer must be one of the provided options',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#fe6c6a',
                textColor: '#fff',
                action: {
                    text: 'OK',
                    textColor: '#fff',
                    onPress: () => console.log('OK pressed'),
                },
            });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'questions'), {
                question,
                options: [option1, option2, option3, option4],
                correctAnswer,
                category,
                createdAt: serverTimestamp(),
            });
            Snackbar.show({
                text: 'Question added successfully!',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#10B981',
                textColor: '#fff',
                action: {
                    text: 'OK',
                    textColor: '#fff',
                    onPress: () => console.log('OK pressed'),
                },
            });
            // Clear form
            setQuestion('');
            setOption1('');
            setOption2('');
            setOption3('');
            setOption4('');
            setCorrectAnswer('');
            setCategory('');
            navigation.goBack();
        } catch (error) {
            Snackbar.show({
                text: error.message,
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#fe6c6a',
                textColor: '#fff',
                action: {
                    text: 'Retry',
                    textColor: '#fff',
                    onPress: () => console.log('Retry pressed'),
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const areAllOptionsFilled = option1.trim() && option2.trim() && option3.trim() && option4.trim();

    return (
        <LinearGradient
            colors={['#6B48FF', '#D1C9FF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingTop: '17%', paddingHorizontal: width * 0.06, paddingBottom: 10 }}>
                    <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
                    <Text style={styles.title}>Add New Question</Text>
                    <Text style={styles.subtitle}>Create a quiz question for the app</Text>

                    <View style={styles.inputContainer}>
                        <Icon name="question-mark" size={24} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Enter question"
                            value={question}
                            onChangeText={setQuestion}
                            style={[styles.input]}
                            placeholderTextColor="#9CA3AF"
                            multiline
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="format-list-numbered" size={24} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Option 1"
                            value={option1}
                            onChangeText={setOption1}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="format-list-numbered" size={24} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Option 2"
                            value={option2}
                            onChangeText={setOption2}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="format-list-numbered" size={24} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Option 3"
                            value={option3}
                            onChangeText={setOption3}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="format-list-numbered" size={24} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Option 4"
                            value={option4}
                            onChangeText={setOption4}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={[styles.inputContainer, localStyles.pickerContainer]}>
                        <Icon name="check-circle" size={24} color="#6B7280" style={styles.inputIcon} />

                        <View style={{ flex: 1, position: "relative", justifyContent: "center" }}>
                            {/* Custom visible label and arrow */}
                            <TouchableOpacity
                                onPress={() => { handlePickerPlaceholderPress() }}
                                activeOpacity={1}
                                style={[
                                    localStyles.picker,
                                    localStyles.placeholder,
                                    {
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingRight: 30, // space for arrow
                                    },
                                ]}
                            >
                                <Text style={[localStyles.pickerItem, { color: correctAnswer ? "#1F2937" : '#9CA3Af' }]}>
                                    {correctAnswer || "Select Correct Answer"}
                                </Text>

                                {/* Manual arrow icon */}
                                <Icon
                                    name="arrow-drop-down"
                                    size={25}
                                    color="#6B7280"
                                    style={{ position: "absolute", right: 10 }}
                                />
                            </TouchableOpacity>

                            {/* Hidden native Picker */}
                            {areAllOptionsFilled && (
                                <Picker
                                    selectedValue={correctAnswer}
                                    onValueChange={handleCorrectAnswerChange}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        opacity: 0,
                                    }}
                                    itemStyle={localStyles.pickerItem}
                                >
                                    <Picker.Item label="Select Correct Answer" value="" />
                                    {option1 && <Picker.Item label={option1} value={option1} />}
                                    {option2 && <Picker.Item label={option2} value={option2} />}
                                    {option3 && <Picker.Item label={option3} value={option3} />}
                                    {option4 && <Picker.Item label={option4} value={option4} />}
                                </Picker>
                            )}
                        </View>
                    </View>

                    <View style={[styles.inputContainer, localStyles.pickerContainer]}>
                        <Icon name="category" size={24} color="#6B7280" style={styles.inputIcon} />

                        <View style={{ flex: 1, position: "relative", justifyContent: "center" }}>
                            {/* Custom Text and Arrow */}
                            <TouchableOpacity
                                activeOpacity={1}
                                style={[
                                    localStyles.picker,
                                    localStyles.placeholder,
                                    {
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingRight: 30,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        localStyles.pickerItem,
                                        { color: category ? "#1F2937" : "#9CA3AF" }, // Change color if value exists
                                    ]}
                                >
                                    {category || "Select Category"}
                                </Text>

                                {/* Custom Arrow */}
                                <Icon
                                    name="arrow-drop-down"
                                    size={25}
                                    color="#6B7280"
                                    style={{ position: "absolute", right: 10 }}
                                />
                            </TouchableOpacity>

                            {/* Transparent Picker */}
                            <Picker
                                selectedValue={category}
                                onValueChange={(value) => setCategory(value)}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    opacity: 0,
                                }}
                                itemStyle={localStyles.pickerItem}
                            >
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((cat, index) => (
                                    <Picker.Item key={index} label={cat} value={cat} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <LinearGradient
                        style={{ marginBottom: 16, borderRadius: 12 }}
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit} style={styles.button}>
                            <View style={styles.buttonGradient}>
                                {loading ? (
                                    <ActivityIndicator size={25} color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Add Question</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </LinearGradient>

                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
                        <Text style={styles.link}>
                            Back to <Text style={styles.linkBold}>Admin Dashboard</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// Local styles for Picker components
const localStyles = {
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Light gray to differentiate from TextInput
        borderRadius: 12,
        // borderWidth: 1.5,
        // borderColor: '#6B48FF', // Matches app gradient
        marginBottom: height * 0.02,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingRight: width * 0.03, // Ensure space without manual icon
    },
    picker: {
        flex: 1,
        // height: height * 0.06,
        color: '#1F2937', // Fixed color for Picker
        paddingVertical: 17,

    },
    pickerItem: {
        fontSize: 16,
        color: '#1F2937',
        // fontWeight: '500',
    },
    placeholder: {
        justifyContent: 'center',
        paddingLeft: width * 0.03,
    },
};