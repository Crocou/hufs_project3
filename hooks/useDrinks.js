import { useState, useEffect } from 'react';
import { getDrinkData, addCustomDrink } from '../service/apiService';

const useDrinks = () => {
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDrinkData();
        setDrinks(data);
      } catch (error) {
        console.error("Error fetching drinks:", error);
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
