import { Text, Flex, Button, Modal, FormControl, Input, useToast } from "native-base";
import { useState } from "react";
import { Dimensions } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { addCustomDrink } from '../service/apiService'
import useDrinks from '../hooks/useDrinks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// 영양 정보 입력 필드 컴포넌트
const NutritionInfoInput = ({ label, value, onChangeText }) => (
  <Flex direction="row" align="center" width="45%">
    <Text fontSize="10px" flex={2}>
      {label}
    </Text>
    <Input
      backgroundColor="#EEF1F4"
      borderColor="#EEF1F4"
      flex={1.7}
      value={value}
      onChangeText={onChangeText}
      keyboardType="decimal-pad"
    />
  </Flex>
);

// 폼 버튼 및 모달 관리 컴포넌트
export const FormButton = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false); // 모달 보이기/숨기기
  const [warningVisible, setWarningVisible] = useState(false); // 경고 메시지 표시
  const { addDrink } = useDrinks();

  // 입력 필드들의 상태
  const [manufacturer, setManufacturer] = useState("");
  const [drinkName, setDrinkName] = useState("");
  const [size, setSize] = useState("");
  const [kcal, setKcal] = useState("");
  const [sugar, setSugar] = useState("");
  const [caffeine, setCaffeine] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [natruim, setNatruim] = useState("");

  // 입력 필드들이 모두 채워졌는지 확인하는 함수
  const inputFilled = () => {
    return (
      manufacturer &&
      drinkName &&
      size &&
      kcal &&
      sugar &&
      caffeine &&
      protein &&
      fat &&
      natruim
    );
  };

  // 입력 필드들이 모두 채워졌는지 확인하는 함수
  const resetFields = () => {
    setManufacturer("");
    setDrinkName("");
    setSize("");
    setKcal("");
    setSugar("");
    setCaffeine("");
    setProtein("");
    setFat("");
    setNatruim("");
  };

  // 입력 필드들이 모두 채워졌는지 확인하는 함수
  const handleModalClose = () => {
    resetFields();
    setWarningVisible(false);
    setShowModal(false);
  };

  // 제출 처리 함수
  const handleSubmit = async () => {
    if (inputFilled()) {
      const drinkData = {
        d_name: drinkName,
        manuf: manufacturer,
        size: parseFloat(size),
        kcal: parseFloat(kcal),
        sugar: parseFloat(sugar),
        caffeine: parseFloat(caffeine),
        protein: parseFloat(protein),
        fat: parseFloat(fat),
        natrium: parseFloat(natruim),
      };
  
      // 데이터베이스에 음료 정보를 등록
      try {
        await addCustomDrink(drinkData);
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
                value={manufacturer}
                onChangeText={setManufacturer}
                backgroundColor="#EEF1F4"
                borderColor="#EEF1F4"
              />
            </FormControl>
            <FormControl mt="3">
              <FormControl.Label>음료명</FormControl.Label>
              <Input
                value={drinkName}
                onChangeText={setDrinkName}
                backgroundColor="#EEF1F4"
                borderColor="#EEF1F4"
              />
            </FormControl>
            <FormControl mt="5">
              <FormControl.Label>제품 영양 정보</FormControl.Label>
              <Flex justifyContent="space-between" flexDirection="row">
                <NutritionInfoInput label="용량(ml)" value={size} onChangeText={setSize} />
                <NutritionInfoInput label="열량(kcal)" value={kcal} onChangeText={setKcal} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="당류(g)" value={sugar} onChangeText={setSugar} />
                <NutritionInfoInput label="카페인(mg)" value={caffeine} onChangeText={setCaffeine} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="단백질(g)" value={protein} onChangeText={setProtein} />
                <NutritionInfoInput label="지방(g)" value={fat} onChangeText={setFat} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="나트륨(mg)" value={natruim} onChangeText={setNatruim} />
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
              bg={inputFilled() ? '#9747FF' : 'lightgray'}
              color='white'
              onPress={inputFilled() ? handleSubmit : null}
              disabled={!inputFilled()}
            >
              저장하기
            </Button>

          </Modal.Footer>

        </Modal.Content>
      </Modal>
    </>
  );
};
