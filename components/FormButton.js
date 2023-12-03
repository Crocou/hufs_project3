import { Text, Flex, Button, Modal, FormControl, Input, useToast } from "native-base";
import React, { useReducer, useState, useEffect } from 'react';
import { Dimensions } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import useDrinks from '../hooks/useDrinks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const initialState = {
  manufacturer: "",
  drinkName: "",
  size: "",
  kcal: "",
  sugar: "",
  caffeine: "",
  protein: "",
  fat: "",
  natruim: ""
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_FIELDS':
      return initialState;
    default:
      throw new Error();
  }
}

// 영양 정보 입력 필드 컴포넌트
const NutritionInfoInput = ({ label, field, state, dispatch }) => (
  <Flex direction="row" align="center" width="45%">
    <Text fontSize="10px" flex={2}>
      {label}
    </Text>
    <Input
      backgroundColor="#EEF1F4"
      borderColor="#EEF1F4"
      flex={1.7}
      value={state[field]}
      onChangeText={(text) => dispatch({ type: 'SET_FIELD', field, value: text })}
      keyboardType="decimal-pad"
    />
  </Flex>
);

// 폼 버튼 및 모달 관리 컴포넌트
export const FormButton = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false); // 모달 보이기/숨기기
  const [warningVisible, setWarningVisible] = useState(false); // 경고 메시지 표시
  const { addDrink } = useDrinks(); // useDrinks 대신 useDrinksContext 사용
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [isInputFilled, setIsInputFilled] = useState(false);

  // 입력 필드들이 모두 채워졌는지 확인
  const inputFilled = () => {
    return Object.values(state).every(value => value);
  };

  useEffect(() => {
    setIsInputFilled(inputFilled()); // 상태가 변경될 때마다 inputFilled 함수를 호출하여 결과를 저장
  }, [state]); // state 객체가 변경될 때마다 useEffect를 실행


  // 입력 필드 초기화
  const resetFields = () => {
    dispatch({ type: 'RESET_FIELDS' });
  };

  const handleModalClose = () => {
    resetFields();
    setWarningVisible(false);
    setShowModal(false);
  };

  // 제출 처리 함수
  const handleSubmit = async () => {
    if (inputFilled()) {
      const drinkData = {
        d_name: state.drinkName,
        manuf: state.manufacturer,
        size: parseFloat(state.size),
        kcal: parseFloat(state.kcal),
        sugar: parseFloat(state.sugar),
        caffeine: parseFloat(state.caffeine),
        protein: parseFloat(state.protein),
        fat: parseFloat(state.fat),
        natrium: parseFloat(state.natruim),
      };
  
      // 데이터베이스에 음료 정보를 등록
      try {
        await addDrink(drinkData); 
        console.log("음료 정보가 성공적으로 등록되었습니다.");
        toast.show({ title: "음료 추가 완료" });
      } catch (error) {
        console.error("음료 정보 등록 중 오류가 발생했습니다.", error);
      }
  
      setShowModal(false); // 모달 닫기
      resetFields(); // 필드 초기화
      setWarningVisible(false); // 경고 메시지 숨기기
    } else {
      setWarningVisible(true); // 필드가 하나라도 비어있으면 경고 메시지 표시
    }
  };

  return (
    <>
      <Button
        backgroundColor="white"
        onPress={() => setShowModal(true)}>
        <AntDesign name="form" size={24} color="#9747FF" />
      </Button>

      <Modal isOpen={showModal} onClose={handleModalClose}>
        <Modal.Content width={windowWidth * 0.9} height={windowHeight * 0.48} maxWidth="400px" >
          <Modal.CloseButton onPress={handleModalClose} />
          <Modal.Body>
            <FormControl>
              <FormControl.Label>제조사명</FormControl.Label>
              <Input
                placeholder="내가 생성"
                value={state.manufacturer}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'manufacturer', value: text })}
                backgroundColor="#EEF1F4"
                borderColor="#EEF1F4"
              />
            </FormControl>
            <FormControl mt="3">
              <FormControl.Label>음료명</FormControl.Label>
              <Input
                value={state.drinkName}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'drinkName', value: text })}
                backgroundColor="#EEF1F4"
                borderColor="#EEF1F4"
              />
            </FormControl>
            <FormControl mt="5">
              <FormControl.Label>제품 영양 정보</FormControl.Label>
              <Flex justifyContent="space-between" flexDirection="row">
                <NutritionInfoInput label="용량(ml)" field="size" state={state} dispatch={dispatch} />
                <NutritionInfoInput label="열량(kcal)" field="kcal" state={state} dispatch={dispatch} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="당류(g)" field="sugar" state={state} dispatch={dispatch} />
                <NutritionInfoInput label="카페인(mg)" field="caffeine" state={state} dispatch={dispatch} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="단백질(g)" field="protein" state={state} dispatch={dispatch} />
                <NutritionInfoInput label="지방(g)" field="fat" state={state} dispatch={dispatch} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="나트륨(mg)" field="natruim" state={state} dispatch={dispatch} />
              </Flex>
            </FormControl>
          </Modal.Body>

          <Modal.Footer justifyContent="center" alignItems="center" borderTopWidth={0}>
            {warningVisible && (
              <Text color="red.500" fontSize="xs" mb={2}>모든 항목을 입력하세요</Text>
            )}
            <Button
              width="60%"
              borderRadius="30"
              bg={isInputFilled ? '#9747FF' : 'lightgray'} // isInputFilled 상태에 따라 배경색 결정
              color='white'
              onPress={isInputFilled ? handleSubmit : null} // isInputFilled 상태에 따라 동작 결정
              disabled={!isInputFilled} // isInputFilled 상태에 따라 활성화/비활성화 결정
            >
              저장하기
            </Button>
          </Modal.Footer>

        </Modal.Content>
      </Modal>
    </>
  );
};
