import * as SecureStore from 'expo-secure-store';

//kakowebview에서 사용
export async function saveJWT(token) {
    try {
        await SecureStore.setItemAsync('userToken', token);
    } catch (error) {
        console.error('토큰 저장 실패', error);
    }
}

export async function getJWT() {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        return token;
    } catch (error) {
        console.error('토큰 불러오기 실패', error);
        return null;
    }
}

export async function deleteJWT() {
    try {
        await SecureStore.deleteItemAsync('userToken');
    } catch (error) {
        console.error('토큰 삭제 실패', error);
    }
}

