import { useQuery } from '@tanstack/react-query';
import {getAllCars, getCarById} from "../services/carService.ts";

export const useCars = () => {
    return useQuery({
        queryKey: ['cars'],
        queryFn: getAllCars,
    });
};

export const useCar = (id: number) => {
    return useQuery({
        queryKey: ['car', id],
        queryFn: () => getCarById(id),
        enabled: !!id,
    });
};
