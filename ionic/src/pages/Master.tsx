import React, { useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import IceCream from '../interfaces/IceCream';
import NotificationComponent from '../components/Notification';

const Master: React.FC = () => {
    const [iceCreams, setIceCreams] = React.useState<IceCream[]>([]);
    const [loading, setLoading] = React.useState(true);
    const history = useHistory();

    useEffect(() => {
        axios.get('http://localhost:3000/api/icecreams')
            .then(response => {
                setIceCreams(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading ice creams', error);
                setLoading(false);
            });
    }, []);

    const handleItemClick = (id: number) => {
        history.push(`/detail/${id}`);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Master</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {loading ? (<IonSpinner></IonSpinner>) : (
                    <IonList>
                        {iceCreams.map(item => (
                            <IonItem button key={item.id} onClick={() => handleItemClick(item.id)}>
                                <IonLabel>{item.name}</IonLabel>
                            </IonItem>
                        ))}
                    </IonList>)}
                    <NotificationComponent />
            </IonContent>
        </IonPage>
    );
};

export default Master;
