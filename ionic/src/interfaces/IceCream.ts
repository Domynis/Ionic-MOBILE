interface IceCreamProps {
    _id?: string;
    name: string;
    description?: string;
    price?: number;
    tasty?: boolean;
    photoUrl?: string;
    photoUrlBE?: string;
    coordinates?: { lat: number, lng: number } | null;
}
export default IceCreamProps;
