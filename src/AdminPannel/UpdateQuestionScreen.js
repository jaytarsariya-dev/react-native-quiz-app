import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Auth/AuthStyle';

const { width, height } = Dimensions.get('window');

export default function UpdateQuestionScreen({ navigation, route }) {
    const { questionData } = route.params;
    const [question, setQuestion] = useState(questionData.question || '');
    const [option1, setOption1] = useState(questionData.options[0] || '');
    const [option2, setOption2] = useState(questionData.options[1] || '');
    const [option3, setOption3] = useState(questionData.options[2] || '');
    const [option4, setOption4] = useState(questionData.options[3] || '');
    const [correctAnswer, setCorrectAnswer] = useState(questionData.correctAnswer || '');
    const [category, setCategory] = useState(questionData.category || '');
    const [loading, setLoading] = useState(false);

    const db = getFirestore();

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

    const showSnackbar = (message, type = 'success') => {
        Snackbar.show({
            text: message,
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor: type === 'success' ? '#10B981' : '#fe6c6a',
            textColor: '#fff',
            fontWeight: '500',
            action: {
                text: 'OK',
                textColor: '#fff',
                onPress: () => { },
            },
        });
    };

    const handlePickerPlaceholderPress = () => {
        showSnackbar('Please fill all options before selecting a correct answer', 'error');
    };

    const handleUpdate = async () => {
        if (!question || !option1 || !option2 || !option3 || !option4 || !correctAnswer || !category) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        if (![option1, option2, option3, option4].includes(correctAnswer)) {
            showSnackbar('Correct answer must be one of the provided options', 'error');
            return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, 'questions', questionData.id), {
                question,
                options: [option1, option2, option3, option4],
                correctAnswer,
                category,
            });

            showSnackbar('Question updated successfully!', 'success');
            navigation.replace('QuestionListScreen');
        } catch (error) {
            showSnackbar('Failed to update question: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const areAllOptionsFilled = option1.trim() && option2.trim() && option3.trim() && option4.trim();

    return (
        <LinearGradient colors={['#6B48FF', '#D1C9FF']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop: '17%',
                        paddingHorizontal: width * 0.06,
                        paddingBottom: 10,
                    }}
                >
                    <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
                    <Text style={styles.title}>Update Question</Text>
                    <Text style={styles.subtitle}>Edit the quiz question</Text>

                    <View style={styles.inputContainer}>
                        <Icon name="question-mark" size={24} color="#6B7280" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Enter question"
                            value={question}
                            onChangeText={setQuestion}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                            multiline
                        />
                    </View>

                    {[option1, option2, option3, option4].map((opt, index) => (
                        <View style={styles.inputContainer} key={index}>
                            <Icon name="format-list-numbered" size={24} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                placeholder={`Option ${index + 1}`}
                                value={index === 0 ? option1 : index === 1 ? option2 : index === 2 ? option3 : option4}
                                onChangeText={(text) => {
                                    if (index === 0) setOption1(text);
                                    else if (index === 1) setOption2(text);
                                    else if (index === 2) setOption3(text);
                                    else setOption4(text);
                                }}
                                style={styles.input}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    ))}

                    <View style={[styles.inputContainer, localStyles.pickerContainer]}>
                        <Icon name="check-circle" size={24} color="#6B7280" style={styles.inputIcon} />
                        <View style={{ flex: 1, position: "relative", justifyContent: "center" }}>
                            <TouchableOpacity
                                onPress={() => { if (!areAllOptionsFilled) handlePickerPlaceholderPress(); }}
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
                                <Text style={[localStyles.pickerItem, { color: correctAnswer ? "#1F2937" : '#9CA3AF' }]}>
                                    {correctAnswer || "Select Correct Answer"}
                                </Text>
                                <Icon
                                    name="arrow-drop-down"
                                    size={25}
                                    color="#6B7280"
                                    style={{ position: "absolute", right: 10 }}
                                />
                            </TouchableOpacity>
                            {areAllOptionsFilled && (
                                <Picker
                                    selectedValue={correctAnswer}
                                    onValueChange={setCorrectAnswer}
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
                                        { color: category ? "#1F2937" : "#9CA3AF" },
                                    ]}
                                >
                                    {category || "Select Category"}
                                </Text>
                                <Icon
                                    name="arrow-drop-down"
                                    size={25}
                                    color="#6B7280"
                                    style={{ position: "absolute", right: 10 }}
                                />
                            </TouchableOpacity>
                            <Picker
                                selectedValue={category}
                                onValueChange={setCategory}
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
                        <TouchableOpacity activeOpacity={0.8} onPress={handleUpdate} style={styles.button}>
                            <View style={styles.buttonGradient}>
                                {loading ? (
                                    <ActivityIndicator size={25} color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Update Question</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </LinearGradient>

                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.replace('QuestionListScreen')}>
                        <Text style={styles.link}>
                            Back to <Text style={styles.linkBold}>Admin Dashboard</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const localStyles = {
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        // borderWidth: 1.5,
        // borderColor: '#6B48FF',
        marginBottom: height * 0.02,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingRight: width * 0.03,
    },
    picker: {
        flex: 1,
        // height: height * 0.06,
        paddingVertical: 17,
        color: '#1F2937',
    },
    pickerItem: {
        fontSize: 16,
        color: '#1F2937',
    },
    placeholder: {
        justifyContent: 'center',
        paddingLeft: width * 0.03,
    },
};