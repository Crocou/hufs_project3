import React, { useEffect, useState } from "react";
import { Text, Modal, Spinner, HStack, Heading, Flex, Box, Image, useToast } from "native-base";
import { Dimensions, FlatList, TouchableWithoutFeedback } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { deleteIntake } from "../service/apiService";
import { RFValue } from 'react-native-responsive-fontsize';
import perfect from '../assets/perfect.png';
import good from '../assets/good.png';
import soso from '../assets/soso.png';
import bad from '../assets/bad.png';
import warning from '../assets/warning.png';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const IntakeModal = ({ isVisible, onClose, intakes, onItemDeleted }) => {
  return (
    <Modal isOpen={isVisible} onClose={onClose} size="lg">
      <Modal.Content width={windowWidth * 0.9} height={windowHeight * 0.48} maxWidth="400px" >
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>섭취한 음료 목록</Modal.Header>
        <Modal.Body p="0">
          <SavedIntakeDrinks intakes={intakes} onItemDeleted={onItemDeleted} />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

const nutritionMapping = {
  sugar: "당류",
  caffeine: "카페인",
  d_name: ""

};

const SavedInfoItem = ({ data, deleteIntakeItem, deleting }) => {
  const formatValue = (value) =>
    value % 1 === 0 ? Math.floor(value) : value;

  const gradeImages = {
    'A': perfect,
    'B': good,
    'C': soso,
    'D': bad,
    'F': warning
  };
  const gradeImage = gradeImages[data.grade]

  return (
    <TouchableWithoutFeedback>
      <Box {...styles.box}>
        <Flex direction="row" width="100%">
          <Flex width="100%" flexDirection="column">
            <Flex direction="row" justifyContent="space-between">
              <Text style={styles.text1}>{formatValue(data["manuf"])}</Text>
              <Flex width="10%" justifyContent="flex-start" alignItems="center">
                <AntDesign
                  name="delete"
                  size={20}
                  color="lightgray"
                  onPress={() => !deleting && deleteIntakeItem({ id: data.d_id, date: data.date, time: data.time })}
                />
              </Flex>
            </Flex>
            <Flex {...styles.flexStart} mt={1}>
              <Text style={styles.text1}>{formatValue(data["d_name"])}</Text>
            </Flex>
            <Flex direction="row" justifyContent="space-between">
              <Flex direction="row">
                <Text style={styles.text2}>{nutritionMapping["sugar"]}: </Text>
                <Text style={styles.text2}>{formatValue(data["sugar"])}g</Text>
              </Flex>
              <Flex direction="row">
                <Text style={styles.text2}>{nutritionMapping["caffeine"]}: </Text>
                <Text style={styles.text2}>{formatValue(data["caffeine"])}mg</Text>
              </Flex>
              <Flex>
                {gradeImage && (
                  <Image source={gradeImage} style={styles.gradeImage} accessibilityLabel={data.grade} alt="Grade Image" />
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </TouchableWithoutFeedback>
  );
};

const SavedIntakeDrinks = ({ intakes, onItemDeleted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setSavedData(mapIntakeData(intakes));
  }, [intakes]);

  const deleteIntakeItem = async (intake) => {
    setDeleting(true);
    setIsLoading(true);
  
    try {
      await deleteIntake({
        date: intake.date,
        drink: intake.id,
        time: intake.time
      });
      toast.show({ title: "섭취 목록 변경 완료", duration: 1000, placement: "bottom" });
      setSavedData(currentData => currentData.filter(item => item.time !== intake.time));
      onItemDeleted(); 
    } catch (error) {
      console.error("음료 삭제 실패", error);
    }
  
    setIsLoading(false);
    setDeleting(false);
  };

  const mapIntakeData = (intakeData) => {
    return intakeData.map((item) => {
      const date = new Date(item.date);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return {
        ...item,
        date: formattedDate
      };
    });
  };

  return (
    <Flex
      direction="column"
      p={4}
      width="100%"
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      {isLoading && (
        <HStack space={2} justifyContent="center" mb="5">
          <Spinner accessibilityLabel="Loading drinks" color="muted.300" />
          <Heading color="muted.300" fontSize="sm">
            삭제 중
          </Heading>
        </HStack>
      )}
      <FlatList
        data={savedData}
        renderItem={({ item }) => (
          <SavedInfoItem
            data={item}
            deleteIntakeItem={deleteIntakeItem}
            deleting={deleting}
          />
        )}
        keyExtractor={(item) => item.time.toString()}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        onStartShouldSetResponderCapture={() => true}
      />
    </Flex>
  );
};

const styles = {
  box: {
    mb: 3,
    p: 3,
    borderRadius: "20%",
    borderWidth: "0.5px",
    borderColor: "lightgray",
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  flexStart: {
    direction: "row",
    width: "100%",
    alignItems: "flex-start",
  },
  flexRow: {
    direction: "row",
    width: "100%",
  },
  text1: {
    fontSize: RFValue(10, 580),
    fontWeight: "bold"
  },
  text2: {
    fontSize: RFValue(9, 580),
    color: "#848484"
  },
  gradeImage: {
    width: 47,
    height: 21,
    alignItems: "center",
    justifyContent: "center"
  },
};

export default IntakeModal;
