import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { getJWT } from '../service/authService';
import { jwtDecode } from 'jwt-decode';
import { getUserProfile } from '../service/apiService';
import { View, Box, VStack, Text, Button, Image, Divider } from 'native-base';
import ProfileEditModal from '../components/ProfileEditModal';

function renderUserProfile(profileData) {
    return Object.entries(profileData).map(([key, value]) => {
        if (key === 'u_id') {
            return null; // 사용자 ID는 표시하지 않음
        }
        if (key === 'u_name') {
            return (<Text key={key} fontSize="md">
                {`이름: ${value}`}
            </Text>
            )
        }
        if (key === 'height') {
            return (
                <Text key={key} fontSize="md">
                    {`키: ${value} cm`}
                </Text>
            );
        }
        if (key === 'weight') {
            return (
                <Text key={key} fontSize="md">
                    {`몸무게: ${value} kg`}
                </Text>
            );
        }
        if (key === 'age') {
            return (
                <Text key={key} fontSize="md">
                    {`나이: ${value} 세`}
                </Text>
            );
        }
        if (key === 'sex') {
            let gender = value === 'male' ? '남성' : '여성';
            return (
                <Text key={key} fontSize="md">
                    {`성별: ${gender}`}
                </Text>
            );
        }
        if (key === 'activity_level') {
            let activityLevel;
            switch (value) {
                case 'low':
                    activityLevel = '적음';
                    break;
                case 'medium':
                    activityLevel = '보통';
                    break;
                case 'high':
                    activityLevel = '많음';
                    break;
                default:
                    activityLevel = value; // 기본값 설정
            }
            return (
                <Text key={key} fontSize="md">
                    {`활동량: ${activityLevel}`}
                </Text>
            );
        }
        return (
            <Text key={key} fontSize="md">
                {`당 제한: ${value} g`}
            </Text>
        );
    });
}

export function ProfileScreen() {
    const [profileData, setProfileData] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);


    useEffect(() => {
        // JWT에서 userId 추출
        const fetchUserData = async () => {
            try {
                const token = await getJWT();
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken.userId[0].u_id;
                    console.log("Extracted userId from JWT:", userId);

                    const data = await getUserProfile(userId);
                    setProfileData(data);
                }
            } catch (error) {
                console.error("프로필 정보를 불러오는 데 실패했습니다:", error);
            }
        };

        fetchUserData();
    }, []);

    // 로그아웃과 회원 탈퇴 기능을 구현하는 함수
    const handleLogout = () => {
        // 로그아웃 처리
    };

    const handleWithdrawal = () => {
        // 회원 탈퇴 처리
    };

    return (
        <Box flex={1} safeArea bg="white">

            {/* 프로필 수정 버튼 */}
            <Button onPress={openModal}>프로필 수정</Button>

            {/* 모달 컴포넌트 */}
            <ProfileEditModal
                isVisible={isModalVisible}
                onClose={closeModal}
                profileData={profileData}
                setProfileData={setProfileData}
            />

            {/* 프로필 정보 */}
            <View justifyContent="center" alignItems="center">
                <Box
                    bg="white"
                    p={10}
                    width="80%"
                    rounded="md"
                    borderColor="coolGray.200"
                    borderWidth="1"
                    alignItems="center"
                    justifyContent="center"
                >
                    <VStack space={4}>
                        {renderUserProfile(profileData)}
                    </VStack>
                </Box>
            </View>

            {/* 로그아웃 및 탈퇴 버튼 */}
            <View flex={1} justifyContent="flex-end" alignItems="center" mb={4}>
                <Button colorScheme="indigo" onPress={handleLogout}>
                    로그아웃
                </Button>
                <Button mt={2} colorScheme="secondary" onPress={handleWithdrawal}>
                    탈퇴하기
                </Button>
            </View>
        </Box>
    );
};

const styles = StyleSheet.create({
    Header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%'
    },
    HeaderText: {
        justifyContent: 'flex-end'
    },
});