import { Car } from "../../model/Car.ts";
import { useCars } from "../../hooks/useCars.ts";
import { Button } from "../ui/Button.tsx";
import { Card } from "../ui/Card.tsx";
import { CardContent } from "../ui/CardContent.tsx";

function CarOverview() {
    const { data: cars = [], isLoading } = useCars();

    // If loading, show a loading message
    if (isLoading) {
        return <div className="text-center text-brand-black">Loading cars...</div>;
    }

    // Ensure `cars` is always an array (in case it's a single object)
    const safeCars = Array.isArray(cars) ? cars : [cars];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white min-h-screen">
            {safeCars.map((car: Car) => (
                <Card
                    key={car.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                    <img
                        src={car.image[0]}
                        alt={car.name}
                        className="w-full h-48 object-cover rounded-t-2xl"
                    />
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-brand-black">{car.name}</h3>
                        <p className="text-sm text-gray-500 opacity-70 mb-2">
                            {new Date(car.buildyear).getFullYear()}
                        </p>
                        <Button>
                            View Details
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default CarOverview;
