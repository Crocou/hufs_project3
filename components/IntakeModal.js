import React from 'react';
import { Modal, Button, VStack, Center, NativeBaseProvider } from 'native-base';
import { Dimensions } from "react-native";
import SavedIntakeDrinks from './SavedIntakeDrinks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const IntakeModal = ({ isVisible, onClose, onDelete }) => {
  return (
    <Modal isOpen={isVisible} onClose={onClose} size="lg">
        <Modal.Content width={windowWidth * 0.9} height={windowHeight * 0.48} maxWidth="400px" >
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>섭취한 음료 목록</Modal.Header>
        <Modal.Body p="0">
          <SavedIntakeDrinks onDelete={onDelete} />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default IntakeModal;
