import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Notification from '../interfaces/Notification';
import './Notification.css';

const SOCKET_SERVER_URL = "http://localhost:3000";

const NotificationComponent: React.FC = () => {
    const [notification, setNotification] = useState<Notification[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_SERVER_URL);

        socket.on('notification', (notification) => {
            setNotification((prevNotifications) => [...prevNotifications, notification]);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="notification-container">
            <h2>Notifications</h2>
            <ul>
                {notification.map((notification) => (
                    <li key={notification.id}>
                        <p>{notification.message}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationComponent;