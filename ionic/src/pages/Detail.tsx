import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import axios from 'axios';
import IceCream from '../interfaces/IceCream';


const Detail: React.FC = () => {
    const [iceCream, setIceCream] = React.useState<IceCream>({ id: 0, name: '', description: '' });
    const [loading, setLoading] = React.useState(true);
    const { id } = useParams<{ id: string }>();  // Get the id from the URL params

    useEffect(() => {
        axios.get('http://localhost:3000/api/icecreams/' + id)
            .then(response => {
                setIceCream(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading ice creams', error);
                setLoading(false);
            });
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle> Detail </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {iceCream ? (
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>{iceCream.name}</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>{iceCream.description}</IonCardContent>
                    </IonCard>
                ) : (
                    <p>Item not found.</p>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Detail;
