import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import { getUserProfile } from '../service/apiService';
import { AlertDialog, View, Box, VStack, Text, Button, Image, Divider } from 'native-base';
import ProfileEditModal from '../components/ProfileEditModal';
import { getJWT, deleteJWT } from '../service/authService';
import { useNavigation } from '@react-navigation/native';

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
    const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false);
    const [isWithdrawalAlertVisible, setIsWithdrawalAlertVisible] = useState(false);
    const cancelRef = useRef(null);
    const navigation = useNavigation();

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

    // 로그아웃 확인 다이얼로그를 엽니다.
    const openLogoutAlert = () => setIsLogoutAlertVisible(true);

    // 로그아웃 확인 다이얼로그를 닫습니다.
    const closeLogoutAlert = () => setIsLogoutAlertVisible(false);

    // 로그아웃을 구현하는 함수
    const handleLogout = async () => {
        try {
            const token = await getJWT()
            console.log('현재 JWT 토큰:', token);

            // 카카오 로그아웃 API 요청
            const response = await fetch('https://kapi.kakao.com/v1/user/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = await response.json(); // 응답을 JSON 형태로 변환
            console.log('카카오 로그아웃 응답:', data);

            // 로컬 스토리지에서 JWT 토큰 삭제
            await deleteJWT();
            closeLogoutAlert();

            // 초기 화면으로 이동
            navigation.navigate('Kakao');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    // 회원 탈퇴 확인 다이얼로그를 엽니다.
    const openWithdrawalAlert = () => setIsWithdrawalAlertVisible(true);

    // 회원 탈퇴 확인 다이얼로그를 닫습니다.
    const closeWithdrawalAlert = () => setIsWithdrawalAlertVisible(false);

    // 회원 탈퇴 처리 함수
    const handleWithdrawal = () => {
        openWithdrawalAlert();
    };

    // 실제 회원 탈퇴 로직
    const confirmWithdrawal = () => {
        // 여기에 회원 탈퇴 처리 로직을 구현합니다.
        closeWithdrawalAlert();
    };

    return (
        <Box flex={1} safeArea bg="white" >

            <View alignItems="flex-end" width="95%">
                <Text onPress={openModal} color="light.300">
                    프로필 수정
                </Text>
            </View>

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
                    width="90%"
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

            {/* 로그아웃 확인 AlertDialog */}
            <AlertDialog
                leastDestructiveRef={cancelRef}
                isOpen={isLogoutAlertVisible}
                onClose={closeLogoutAlert}
            >
                <AlertDialog.Content>
                    <AlertDialog.CloseButton />
                    <AlertDialog.Header borderBottomWidth={0}>로그아웃</AlertDialog.Header>
                    <AlertDialog.Body justifyContent="center" alignItems="center">
                        로그아웃하시겠습니까?
                    </AlertDialog.Body>
                    <AlertDialog.Footer justifyContent="center" alignItems="center" borderTopWidth={0}>
                        <Button
                            bg="transparent"
                            borderRadius="full"
                            borderWidth="1"
                            borderColor="red.600"
                            variant="unstyled"
                            colorScheme="coolGray"
                            onPress={closeLogoutAlert}
                            ref={cancelRef}
                            width="70"
                        >
                            취소
                        </Button>
                        <Button borderRadius="20" colorScheme="danger" onPress={handleLogout} ml={3}>
                            로그아웃
                        </Button>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog>

            {/* 회원 탈퇴 확인 AlertDialog */}
            <AlertDialog
                leastDestructiveRef={cancelRef}
                isOpen={isWithdrawalAlertVisible}
                onClose={closeWithdrawalAlert}
            >
                <AlertDialog.Content>
                    <AlertDialog.CloseButton />
                    <AlertDialog.Header borderBottomWidth={0}>회원 탈퇴</AlertDialog.Header>
                    <AlertDialog.Body justifyContent="center" alignItems="center">
                        <Text>정말로 탈퇴하시겠습니까? </Text>
                        <Text>이 작업은 되돌릴 수 없습니다.</Text>
                    </AlertDialog.Body>
                    <AlertDialog.Footer justifyContent="center" alignItems="center" borderTopWidth={0}>
                        <Button
                            bg="transparent"
                            borderRadius="full"
                            borderWidth="1"
                            borderColor="coolGray.400"
                            variant="unstyled"
                            colorScheme="coolGray"
                            onPress={closeWithdrawalAlert}
                            ref={cancelRef}
                            width="70"
                        >
                            취소
                        </Button>
                        <Button borderRadius="20" colorScheme="danger" onPress={confirmWithdrawal} ml={3}>
                            탈퇴하기
                        </Button>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog>

            {/* 로그아웃 및 탈퇴 버튼 */}
            <View flex={1} justifyContent="flex-end" alignItems="center" mb={4}>
                <Button
                    mb="3"
                    width="200"
                    bg="purple.600"
                    borderRadius="full"
                    borderWidth="0"
                    borderColor="transparent"
                    _text={{
                        color: 'white',
                        fontWeight: 'medium',
                    }}
                    onPress={openLogoutAlert}
                >
                    로그아웃
                </Button>

                <Button
                    width="200"
                    bg="transparent"
                    borderRadius="full"
                    borderWidth="1"
                    borderColor="purple.600"
                    _text={{
                        color: 'purple.600',
                        fontWeight: 'medium',
                    }}

                    onPress={handleWithdrawal}
                >
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