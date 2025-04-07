import axios from 'axios';
import {Car} from "../model/Car.ts";

const BASE_URL = 'https://api.jsonbin.io/v3/b/67ef1aac8960c979a57de15e'; // Replace with your actual JSONBin bin URL
const HEADERS = {
    'X-Master-Key': '$2a$10$qXNp3t/0G3SjGwyMqzO4f.omwzzJw2UfAsOhsmJHKrgU1L3hUOaUe',
    'Content-Type': 'application/json',
};

export const getAllCars = async () => {
    const res = await axios.get(BASE_URL, { headers: HEADERS });
    console.log('🚗 Raw data from API:', res.data.record);

    return res.data.record;
};

export const getCarById = async (id: number) => {
    const res = await axios.get(BASE_URL, { headers: HEADERS });
    const cars = res.data.record;
    return cars.find((car: Car) => car.id === id);
};
