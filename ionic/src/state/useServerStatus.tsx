import { useState, useEffect } from 'react';
import { ping } from './pingApi';

export const useServerStatus = (interval = 5000) => {
    const [isServerAvailable, setIsServerAvailable] = useState(true);

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await ping();
                if (response === 'pong') {
                    setIsServerAvailable(true);
                } else {
                    setIsServerAvailable(false);
                }
            } catch (error) {
                // console.warn('Ping failed:', error);
                setIsServerAvailable(false);
            }
        };

        const intervalId = setInterval(checkServerStatus, interval);

        // Run the check immediately on mount
        checkServerStatus();

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, [interval]);

    return isServerAvailable;
};
