import React, { useState, useEffect } from 'react';
import { Text, Modal, Button, Input, VStack, HStack, FormControl } from 'native-base';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Dimensions } from "react-native";
import { updateUser } from '../service/apiService';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function ProfileEditModal({ isVisible, onClose, profileData, setProfileData }) {
    const [editedProfile, setEditedProfile] = useState(profileData);
    const [selectedGender, setSelectedGender] = useState(profileData.sex);
    const [selectedActivityLevel, setSelectedActivityLevel] = useState(profileData.activity_level);

    useEffect(() => {
        setEditedProfile(profileData); // profileData가 변경될 때마다 editedProfile를 업데이트
        setSelectedGender(profileData.sex); // profileData가 변경될 때마다 성별 업데이트
        setSelectedActivityLevel(profileData.activity_level); // profileData가 변경될 때마다 활동량 업데이트
    }, [profileData]);

    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
        setEditedProfile({ ...editedProfile, sex: gender });
    };

    const handleActivityLevelSelect = (level) => {
        setSelectedActivityLevel(level);
        setEditedProfile({ ...editedProfile, activity_level: level });
    };

    const handleSave = async () => {
        try {
            // editedProfile에 변경되지 않은 기존 profileData 값들을 합칩니다.
            const updatedProfile = { ...profileData, ...editedProfile };
            await updateUser(updatedProfile); // 프로필 업데이트 API 호출
            setProfileData(updatedProfile); // 상태 업데이트
            onClose(); // 모달 닫기
        } catch (error) {
            console.error("프로필 업데이트 실패:", error);
        }
    };
    

    const handleClose = () => {
        setEditedProfile({});
        onClose();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Modal isOpen={isVisible} onClose={handleClose}>
                <Modal.Content maxWidth="400px" width={windowWidth * 0.9} height={windowHeight * 0.6}>
                    <Modal.CloseButton />
                    <Modal.Header borderBottomWidth={0}>프로필 수정</Modal.Header>
                    <Modal.Body justifyContent="center" alignItems="center">

                        <VStack space={6} justifyContent="center" alignItems="center">
                            <FormControl>
                                <FormControl.Label justifyContent="center" alignItems="center">키</FormControl.Label>
                                <Input
                                    width="50%"
                                    placeholder={profileData.height ? profileData.height.toString() : '입력하세요'}
                                    value={editedProfile.height ? editedProfile.height.toString() : ''}
                                    keyboardType="numeric"
                                    onChangeText={(text) => setEditedProfile(prevProfile => ({ ...prevProfile, height: text }))}
                                    textAlign="center"
                                />
                            </FormControl>

                            <FormControl>
                                <FormControl.Label justifyContent="center" alignItems="center">몸무게</FormControl.Label>
                                <Input
                                    width="50%"
                                    placeholder={profileData.weight ? profileData.weight.toString() : '입력하세요'}
                                    value={editedProfile.weight ? editedProfile.weight.toString() : ''}
                                    keyboardType="numeric"
                                    onChangeText={(text) => setEditedProfile(prevProfile => ({ ...prevProfile, weight: text }))}
                                    textAlign="center"
                                />
                            </FormControl>

                            <FormControl>
                                <FormControl.Label justifyContent="center" alignItems="center">나이</FormControl.Label>
                                <Input
                                    width="50%"
                                    placeholder={profileData.age ? profileData.age.toString() : '입력하세요'}
                                    value={editedProfile.age ? editedProfile.age.toString() : ''}                            
                                    keyboardType="numeric"
                                    onChangeText={(text) => setEditedProfile(prevProfile => ({ ...prevProfile, age: text }))}
                                    textAlign="center"
                                />
                            </FormControl>

                            <FormControl>
                                <FormControl.Label justifyContent="center" alignItems="center">당 제한</FormControl.Label>
                                <Input
                                    width="50%"
                                    placeholder={profileData.u_sugar_gram ? profileData.u_sugar_gram.toString() : '입력하세요'}
                                    value={editedProfile.u_sugar_gram ? editedProfile.u_sugar_gram.toString() : ''}                            
                                    keyboardType="numeric"
                                    onChangeText={(text) => setEditedProfile(prevProfile => ({ ...prevProfile, u_sugar_gram: text }))}
                                    textAlign="center"
                                />
                            </FormControl>

                            <FormControl>
                                <FormControl.Label justifyContent="center" alignItems="center">성별</FormControl.Label>
                                <HStack space={2} justifyContent="center" alignItems="center">
                                    <Button
                                        variant={selectedGender === 'male' ? 'solid' : 'outline'}
                                        outlineColor="#9747FF"
                                        colorScheme={selectedGender === 'male' ? 'purple' : 'white'}
                                        onPress={() => handleGenderSelect('male')}
                                        _text={{ color: selectedGender === 'male' ? 'white' : 'lightgray' }}
                                        borderRadius="30"
                                        paddingLeft="5"
                                        paddingRight="5"
                                    >
                                        남성
                                    </Button>
                                    <Button
                                        variant={selectedGender === 'female' ? 'solid' : 'outline'}
                                        outlineColor="#9747FF"
                                        colorScheme={selectedGender === 'female' ? 'purple' : 'white'}
                                        onPress={() => handleGenderSelect('female')}
                                        _text={{ color: selectedGender === 'female' ? 'white' : 'lightgray' }}
                                        borderRadius="30"
                                        paddingLeft="5"
                                        paddingRight="5"
                                    >
                                        여성
                                    </Button>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormControl.Label justifyContent="center" alignItems="center">활동량</FormControl.Label>
                                <HStack space={2}>
                                    {['low', 'medium', 'high'].map((level) => {
                                        const isSelected = selectedActivityLevel === level;
                                        return (
                                            <Button
                                                key={level}
                                                variant={isSelected ? 'solid' : 'outline'}
                                                colorScheme={isSelected ? 'purple' : 'white'}
                                                borderColor={isSelected ? 'purple' : 'lightgray'}
                                                onPress={() => handleActivityLevelSelect(level)}
                                                _text={{ color: isSelected ? 'white' : 'lightgray' }}
                                                borderRadius="30"
                                                paddingLeft="5"
                                                paddingRight="5"
                                            >
                                                {level === 'low' ? '낮음' : level === 'medium' ? '보통' : '높음'}
                                            </Button>
                                        );
                                    })}
                                </HStack>
                            </FormControl>
                        </VStack>
                    </Modal.Body>

                    <Modal.Footer justifyContent="center" alignItems="center" borderTopWidth={0}>
                        <Button
                            width="60%"
                            borderRadius="30"
                            bg='purple.600'
                            color='white'
                            onPress={handleSave}
                        >
                            저장하기
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </TouchableWithoutFeedback>
    );
}
