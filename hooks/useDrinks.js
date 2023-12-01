import { useState, useEffect } from 'react';
import { getDrinkData, addCustomDrink } from '../service/apiService';

const useDrinks = () => {
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDrinkData();
        console.log("useDrinks에서 음료 데이터 로딩:", data); // 콘솔에 데이터 출력
        setDrinks(data);
      } catch (error) {
        console.error("Error fetching drinks in useDrinks:", error);
      }
    };

    fetchData();
  }, []);

  const addDrink = async (drinkData) => {
    try {
      await addCustomDrink(drinkData);
      setDrinks([...drinks, drinkData]); // 상태 업데이트
    } catch (error) {
      console.error("Error adding drink:", error);
    }
  };

  return { drinks, addDrink };
};

export default useDrinks;
