import { useEffect, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface MyLocation {
    position?: Position | null;
    error?: Error;
}

export const useMyLocation = () => {
    const [state, setState] = useState<MyLocation>({});

    useEffect(() => {
        getCurrentLocationOnce();
    }, []);

    return state;

    async function getCurrentLocationOnce() {
        const geolocationOptions = {
            timeout: 200000,
            // maximumAge: 60000, // Reuse location if fetched within the last minute
        };

        try {
            const position = await Geolocation.getCurrentPosition(geolocationOptions);
            updateMyPosition(position);
        } catch (error) {
            updateMyPosition(null, error);
        }
    }

    function updateMyPosition(position: Position | null, error: any = undefined) {
        console.log('Location fetched:', position, error);
        setState({ position, error });
    }
};