import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

const IntakeModal = ({ isVisible, onClose, intakes, onDeleteIntake }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalView}>
                {intakes.map((intake, index) => (
                    <View key={index} style={styles.intakeRow}>
                        <Text>
                            {`음료 ID: ${intake.drink}, 섭취 시간: ${intake.time}`}
                        </Text>
                        <Button title="삭제" onPress={() => onDeleteIntake(intake)} />
                    </View>
                ))}
                <Button title="닫기" onPress={onClose} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    intakeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    }
});

export default IntakeModal;
