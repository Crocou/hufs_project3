import React from 'react';
import { Buffer } from 'buffer';
global.Buffer = Buffer; // Buffer를 global 객체에 추가
import { Button, View, Text, Alert } from 'react-native';
import jwtDecode from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { sendUidToDatabase, getToken } from '../service/apiService';

function base64UrlEncode(str) {
    const base64 = Buffer.from(str).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // 정규식을 사용하여 모든 인스턴스를 대체합니다.
}

function generateDummyJwtToken(payload) {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // 주의: 여기서는 실제 서명을 생성하지 않습니다. 이는 보안상 큰 문제가 있습니다.
    return `${encodedHeader}.${encodedPayload}.`; // 템플릿 리터럴을 사용하여 문자열을 구성합니다.
}

export function HomeScreen() {
    // 카카오 API로부터 가져온 사용자 ID를 임의로 설정합니다.
    const kakaoUserId = '123456789';

    const generateJwtToken = async () => {
        // 사용자 ID를 바탕으로 더미 JWT 토큰을 생성합니다.
        // 이 예제는 테스트 목적으로만 사용해야 합니다.
        const tokenPayload = {
            u_id: kakaoUserId,
            // 필요한 추가 데이터를 여기에 추가할 수 있습니다.
        };

        const token = generateDummyJwtToken(tokenPayload);

        // SecureStore에 생성된 더미 JWT 토큰을 저장합니다.
        await SecureStore.setItemAsync('jwtToken', token);

        console.log('Generated Dummy JWT Token:', token);
    };

    const sendUserId = async () => {
        try {
            const token = await getToken();
            const decodedToken = jwtDecode(token);
            const u_id = decodedToken.u_id;

            const response = await sendUidToDatabase(u_id);
            if (response.success) { // response 객체의 형태와 여기서 사용한 필드를 확인하여 적절히 수정해야 합니다.
                Alert.alert('Success', 'u_id가 성공적으로 전송되었습니다.');
            } else {
                Alert.alert('Error', 'u_id 전송에 실패하였습니다.');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Home Screen</Text>
            <Button
                title="Dummy JWT 생성하기"
                onPress={generateJwtToken}
            />
            <Button
                title="u_id 전송하기"
                onPress={sendUserId}
            />
        </View>
    );
}
