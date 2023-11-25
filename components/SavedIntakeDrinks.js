import React, { useEffect, useState } from "react";
import { Spinner, HStack, Heading, Text, Flex, Box, Image, useToast } from "native-base";
import { FlatList, TouchableWithoutFeedback } from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { getTodayIntake, deleteIntake } from "../service/apiService";
import { RFValue } from 'react-native-responsive-fontsize';
import perfect from '../assets/perfect.png';
import good from '../assets/good.png';
import soso from '../assets/soso.png';
import bad from '../assets/bad.png';
import warning from '../assets/warning.png';

// 영양소 이름과 한국어 매핑 정보
const nutritionMapping = {
    sugar: "당류",
    caffeine: "카페인",
};

// 개별 저장 정보 항목 컴포넌트
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

    // UI 구성 및 이벤트 핸들링
    return (
        <TouchableWithoutFeedback>
            <Box {...styles.box}>
                <Flex direction="row" width="100%">
                    {/* 텍스트 영역 */}
                    <Flex width="100%" flexDirection="column">
                        <Flex direction="row" justifyContent="space-between">
                            <Text style={styles.text1}>{data.manufacturer}</Text> {/* 제조사명 */}
                            <Flex width="10%" justifyContent="flex-start" alignItems="center">
                                <AntDesign
                                    name="delete"
                                    size={20}
                                    color="lightgray"
                                    onPress={() => !deleting && deleteIntakeItem({ id: data.id, date: data.date, time: data.time })} title="삭제"
                                />
                            </Flex>
                        </Flex>
                        <Flex {...styles.flexStart} mt={1}>
                            <Text style={styles.text1}>{data.drinkName}</Text> {/* 음료명 */}
                        </Flex>
                        <Flex direction="row" justifyContent="space-between">
                            <Flex direction="row">
                                <Text style={styles.text2}>{nutritionMapping["sugar"]}: </Text> {/* 당류: */}
                                <Text style={styles.text2}>{formatValue(data["sugar"])}g</Text> {/* Updated this line */}
                            </Flex>
                            <Flex direction="row">
                                <Text style={styles.text2}>{nutritionMapping["caffeine"]}: </Text> {/* 카페인: */}
                                <Text style={styles.text2}>{formatValue(data["caffeine"])}mg</Text> {/* Updated this line */}
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

// 저장된 음료 정보 전체 목록을 관리하는 컴포넌트
const SavedIntakeDrinks = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [savedData, setSavedData] = useState([]);
    const isFocused = useIsFocused();
    const [deleting, setDeleting] = useState(false);
    const toast = useToast();

    // 음료 데이터를 가져오는 함수
    const fetchData = async () => {
        try {
            const responseData = await getTodayIntake();
            const mappedData = responseData.map((item) => {
                const date = new Date(item.date);
                date.setDate(date.getDate() + 1);
                const formattedDate = date.toISOString().split('T')[0];

                return {
                    drinkName: item.d_name,
                    manufacturer: item.manuf,
                    sugar: item.sugar,
                    caffeine: item.caffeine,
                    id: item.d_id,
                    size: item.size,
                    kcal: item.kcal,
                    protein: item.protein,
                    natrium: item.natrium,
                    fat: item.fat,
                    grade: item.grade,
                    source: item.source,
                    time: item.time,
                    date: formattedDate
                };
            });
            console.log("mappedData: ", mappedData)
            setSavedData(mappedData);
        } catch (error) {
            console.error("Error fetching drinks:", error);
        }
    };

    const deleteIntakeItem = async (intake) => {
        setDeleting(true);
        setIsLoading(true); // 로딩 시작
        console.log("Deleting intake item:", intake);
        try {
            await deleteIntake({
                date: intake.date,
                drink: intake.id,
                time: intake.time
            });
            toast.show({ title: "섭취 목록 변경 완료", duration: 1000, placement: "top" });
            setSavedData(currentData => currentData.filter(item => item.time !== intake.time));
        } catch (error) {
            console.error("음료 삭제 실패", error);
        }
        setIsLoading(false);
        setDeleting(false);
    };


    useEffect(() => {
        fetchData();
    }, [isFocused]);

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

export default SavedIntakeDrinks;
