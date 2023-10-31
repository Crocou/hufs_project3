import { Text, Flex, Button, Modal, FormControl, Input } from "native-base";
import { useState } from "react";
import { AntDesign } from '@expo/vector-icons';
import { addCustomDrink } from '../service/apiService'

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

export const FormButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [manufacturer, setManufacturer] = useState("");
  const [drinkName, setDrinkName] = useState("");
  const [size, setSize] = useState("");
  const [kcal, setKcal] = useState("");
  const [sugar, setSugar] = useState("");
  const [caffeine, setCaffeine] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [natruim, setNatruim] = useState("");

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

  const handleModalClose = () => {
    resetFields();
    setWarningVisible(false);
    setShowModal(false);
  };

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
        // 필요한 경우 다른 필드도 추가할 수 있습니다.
      };
  
      try {
        await addCustomDrink(drinkData);  // 데이터베이스에 음료 정보를 등록
        console.log("음료 정보가 성공적으로 등록되었습니다.");
      } catch (error) {
        console.error("음료 정보 등록 중 오류가 발생했습니다.", error);
      }
  
      setShowModal(false);
      resetFields();
      setWarningVisible(false);
    } else {
      setWarningVisible(true);
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
        <Modal.Content maxWidth="400px">
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
