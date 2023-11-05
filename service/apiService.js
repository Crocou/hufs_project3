import axios from 'axios';
import { getJWT } from './authService';

const BASE_URL = 'http://172.30.1.11:4000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 공통 함수: API 요청을 보낼 때 헤더를 설정
async function sendRequestWithJWT(endpoint, method, data = null) {
  try {
    const token = await getJWT();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Bearer 접두사 추가
    };

    const config = {
      method,
      url: endpoint,
      headers,
    };

    if (data) {
      config.data = data;
    }

    const response = await apiClient(config);
    //console.log(`Sending ${method} request to ${endpoint} with data:`, data, 'and headers:', headers);
    return response.data;
  } catch (error) {
    console.error(`요청 실패 - 엔드포인트: ${endpoint}, 메서드: ${method}`);
    if (error.response) {
      // 서버에 의해 응답이 반환된 경우
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
      console.error('응답 헤더:', error.response.headers);
    } else if (error.request) {
      // 요청이 이루어졌지만 응답을 받지 못한 경우
      console.error('요청 실패:', error.request);
    } else {
      // 요청 생성 중에 문제가 발생한 경우
      console.error('Error', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
};

// 음료 목록 가져오기
export const getDrinkData = () => {
  return sendRequestWithJWT('/drink', 'get');
};

// 특정 음료의 데이터 가져오기
export const getDrinkDataById = (d_id) => {
  return sendRequestWithJWT(`/drink/${d_id}`, 'get');
};

// 커스텀 음료 등록
export const addCustomDrink = (drinkData) => {
  return sendRequestWithJWT('/customDrink', 'post', drinkData);
};

// 커스텀 음료 삭제
export const deleteCustomDrink = (d_id) => {
  return sendRequestWithJWT(`/customDrink/${d_id}`, 'delete');
};

// 사용자 프로필 서버에 보내기
export const updateUser = (userData) => {
  return sendRequestWithJWT('/user', 'put', userData);
};

// 즐겨찾기 가져오기
export const getFav = () => {
  return sendRequestWithJWT(`/favorite`, 'get');
};

// 즐겨찾기 추가
export const addFav = (drinkId) => {
  const favoriteData = { drink: drinkId };
  return sendRequestWithJWT('/favorite', 'post', favoriteData);
};

// 즐겨찾기 제거
export const removeFav = (drinkId) => {
  const favoriteData = { drink: drinkId };
  return sendRequestWithJWT('/favorite', 'delete', favoriteData);
};

// 음료 섭취 추가
export const addIntake = (intakeData) => {
  return sendRequestWithJWT('/intake', 'post', intakeData);
};

// 당일 음료 섭취 데이터 가져오기
export const getTodayIntake = () => {
  return sendRequestWithJWT('/intake/today', 'get');
};

// 주간 음료 섭취 데이터 가져오기
export const getWeekIntake = () => {
  return sendRequestWithJWT('/intake/week', 'get');
};
