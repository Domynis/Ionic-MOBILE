import React, { createContext, useCallback, useContext, useState } from 'react';
import { IonToast } from '@ionic/react';

import './toastProvider.css';

type ToastContextType = {
    showToast: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastDuration, setToastDuration] = useState<number>(2000);

    const showToast = useCallback((message: string, duration = 2000) => {
        setToastMessage(message);
        setToastDuration(duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <IonToast
                isOpen={!!toastMessage}
                message={toastMessage ?? ""}
                duration={toastDuration}
                className='custom-toast'
                onDidDismiss={() => setToastMessage(null)}
            />
        </ToastContext.Provider>
    );
};
