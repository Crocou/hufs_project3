import React, { useState } from 'react';
import { Text, Flex, Button, Modal, FormControl, Input, useToast } from "native-base";
import { AntDesign } from '@expo/vector-icons';
import useDrinks from '../hooks/useDrinks';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// 영양 정보 입력 필드 컴포넌트
const NutritionInfoInput = React.memo(({ label, field, formData, setFormData }) => (
  <Flex direction="row" align="center" width="45%">
    <Text fontSize="10px" flex={2}>
      {label}
    </Text>
    <Input
      backgroundColor="#EEF1F4"
      borderColor="#EEF1F4"
      flex={1.7}
      value={formData[field]}
      onChangeText={(text) => {
        setFormData(prevState => {
          const updatedFormData = { ...prevState, [field]: text };
          console.log("Updated formData:", updatedFormData);
          return updatedFormData;
        });
      }}
        keyboardType="decimal-pad"
    />
  </Flex>
));

// 폼 버튼 및 모달 관리 컴포넌트
export const FormButton = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const { addDrink } = useDrinks();

  // 모든 필드에 대한 상태를 하나의 객체로 관리
  const [formData, setFormData] = useState({
    manufacturer: "",
    drinkName: "",
    size: "",
    kcal: "",
    sugar: "",
    caffeine: "",
    protein: "",
    fat: "",
    natrium: ""
  });

  // 입력 필드들이 모두 채워졌는지 확인하는 함수
  const checkIfInputFilled = () => {
    const isFilled = Object.values(formData).every(value => value);
    return isFilled;
  };

  // 입력 필드 초기화
  const resetFields = () => {
    setFormData({
      manufacturer: "",
      drinkName: "",
      size: "",
      kcal: "",
      sugar: "",
      caffeine: "",
      protein: "",
      fat: "",
      natrium: ""
    });
  };

  const handleModalClose = () => {
    resetFields();
    setWarningVisible(false);
    setShowModal(false);
  };

  // 제출 처리 함수
  const handleSubmit = async () => {
    if (checkIfInputFilled()) {
      const drinkData = {
        d_name: formData.drinkName,
        manuf: formData.manufacturer,
        size: parseFloat(formData.size),
        kcal: parseFloat(formData.kcal),
        sugar: parseFloat(formData.sugar),
        caffeine: parseFloat(formData.caffeine),
        protein: parseFloat(formData.protein),
        fat: parseFloat(formData.fat),
        natrium: parseFloat(formData.natrium),
      };

      try {
        await addDrink(drinkData);
        console.log("음료 정보가 성공적으로 등록되었습니다.");
        toast.show({ title: "음료 생성 완료", duration: 1000, placement: "bottom" });
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
        <Modal.Content width={windowWidth * 0.9} height={windowHeight * 0.48} maxWidth="400px" >
          <Modal.CloseButton onPress={handleModalClose}/>
          <Modal.Body mt="5">
            <FormControl>
              <FormControl.Label>제조사명</FormControl.Label>
              <Input
                placeholder="내가 생성"
                value={formData.manufacturer}
                onChangeText={(text) => setFormData(prevState => ({ ...prevState, manufacturer: text }))}
                backgroundColor="#EEF1F4"
                borderColor="#EEF1F4"
              />
              <FormControl.Label mt="3">음료명</FormControl.Label>
              <Input
                value={formData.drinkName}
                onChangeText={(text) => setFormData(prevState => ({ ...prevState, drinkName: text }))}
                backgroundColor="#EEF1F4"
                borderColor="#EEF1F4"
              />
            </FormControl>
            <FormControl mt="3">
              <FormControl.Label>제품 영양 정보</FormControl.Label>
              <Flex justifyContent="space-between" flexDirection="row">
                <NutritionInfoInput label="용량(ml)" field="size" formData={formData} setFormData={setFormData} />
                <NutritionInfoInput label="열량(kcal)" field="kcal" formData={formData} setFormData={setFormData} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="당류(g)" field="sugar" formData={formData} setFormData={setFormData} />
                <NutritionInfoInput label="카페인(mg)" field="caffeine" formData={formData} setFormData={setFormData} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="단백질(g)" field="protein" formData={formData} setFormData={setFormData} />
                <NutritionInfoInput label="지방(g)" field="fat" formData={formData} setFormData={setFormData} />
              </Flex>
              <Flex justifyContent="space-between" flexDirection="row" mt={2}>
                <NutritionInfoInput label="나트륨(mg)" field="natrium" formData={formData} setFormData={setFormData} />
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
              bg={checkIfInputFilled() ? '#9747FF' : 'lightgray'}
              color='white'
              onPress={checkIfInputFilled() ? handleSubmit : null}
              disabled={!checkIfInputFilled()}
            >
              저장하기
            </Button>
          </Modal.Footer>

        </Modal.Content>
      </Modal>
    </>
  );
};
