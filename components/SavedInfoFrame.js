import React from "react";
import { StyleSheet, Dimensions } from 'react-native';
import { Text, Modal, Flex, Button, View, Image } from 'native-base';
import { addIntake } from "../service/apiService";
import { RFValue } from 'react-native-responsive-fontsize';
import perfect from '../assets/perfect.png';
import good from '../assets/good.png';
import soso from '../assets/soso.png';
import bad from '../assets/bad.png';
import warning from '../assets/warning.png';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SavedInfoFrame = ({ visible, onClose, drinkInfo }) => {
  if (!drinkInfo) return null;

  const gradeImages = {
    'A': perfect,
    'B': good,
    'C': soso,
    'D': bad,
    'F': warning
  }; 
  const gradeImage = gradeImages[drinkInfo.grade];

  const handleAddIntake = async () => {
    try {
      const currentDate = new Date();
      const formattedDateTime = `${currentDate.toISOString().split('T')[0]}`;
      const intakeData = {
        date: formattedDateTime,
        drink: drinkInfo.id,
        time: currentDate.getHours() * 100 + currentDate.getMinutes()
      };
      await addIntake(intakeData);
      console.log("Intake data added successfully.");
      onClose(); // 모달을 닫습니다.
    } catch (error) {
      console.error("Error adding intake data:", error);
    }
  };

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <Modal.Content style={styles.modalStyle} maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Body>
          <Flex direction="column" space={4}>
            <Flex direction="row" justifyContent="space-between">
              <Flex direction="column">
                <Text color="#848484" fontSize={RFValue(12)} fontWeight="400" lineHeight="20px" marginTop="15">제조사</Text>
                <Text style={styles.infoText}>{drinkInfo.manufacturer}</Text>
              </Flex>
            </Flex>

            <Text color="#848484" fontSize={RFValue(12)} fontWeight="400" lineHeight="20px" marginTop="2">이름</Text>
            <Flex direction="row" justifyContent="space-between">
              <Text style={styles.infoText}>{drinkInfo.drinkName}</Text>
              {gradeImage && (
                <Image source={gradeImage} style={styles.gradeImage} accessibilityLabel={drinkInfo.grade} alt="Grade Image"/>
              )}
            </Flex>

            <View style={styles.container}>
              <View>
                <Text color="#B9BCBE" fontSize={RFValue(12)} fontWeight="400" lineHeight="30px" marginTop="15">제품 영양 정보</Text>
              </View>
              <View>
                <Text fontSize={RFValue(12)} fontWeight="400" lineHeight="30px" marginTop="15">{parseInt(drinkInfo.size)}ml</Text>
              </View>
            </View>

            <View style={styles.container}>
              <View>
                <Text style={styles.labelText}>1회 제공량(kcal) </Text>
                <Text style={styles.labelText}>단백질(g) </Text>
                <Text style={styles.labelText}>지방(g) </Text>
              </View>
              <View>
                <Text textAlign="right" marginTop="3" fontSize={RFValue(12)}>{parseInt(drinkInfo.kcal)}</Text>
                <Text textAlign="right" marginTop="3" fontSize={RFValue(12)}>{parseInt(drinkInfo.protein)}</Text>
                <Text textAlign="right" marginTop="3" fontSize={RFValue(12)}>{parseInt(drinkInfo.fat)}</Text>
              </View>
              <View>
                <Text style={styles.labelText}>당류(g)</Text>
                <Text style={styles.labelText}>카페인(mg)</Text>
                <Text style={styles.labelText}>나트륨(mg)</Text>
              </View>
              <View>
                <Text textAlign="right" marginTop="3" fontSize={RFValue(12)}>{parseInt(drinkInfo.sugar)}</Text>
                <Text textAlign="right" marginTop="3" fontSize={RFValue(12)}>{parseInt(drinkInfo.caffeine)}</Text>
                <Text textAlign="right" marginTop="3" fontSize={RFValue(12)}>{parseInt(drinkInfo.natrium)}</Text>
              </View>
            </View>
          </Flex>
        </Modal.Body>
        <Modal.Footer justifyContent="center" alignItems="center" borderTopWidth={0}>
          <Button
            width="60%"
            borderRadius="30"
            bg='#9747FF'
            color='white'
            onPress={handleAddIntake} >
            추가하기
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalStyle: {
    width: windowWidth * 0.9,
    height: windowHeight * 0.48,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  containerOne: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between"
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center"
  },
  gradeImage: {
    width: 47,
    height: 21,
    alignItems: "center",
    justifyContent: "center"
  },
  labelText: {
    color: "#848484",
    fontSize: RFValue(12),
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 15
  },
  infoText: {
    fontSize: RFValue(14),
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 1
  }
});

export default SavedInfoFrame;