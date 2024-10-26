import React, { useContext, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonLoading, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { add, logOut } from 'ionicons/icons';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { IceCreamContext } from '../state/IceCreamProvider';
import IceCream from './IceCream';
import { AuthContext } from '../auth/AuthProvider';
const log = getLogger('IceCreamsList');

const IceCreamsList: React.FC<RouteComponentProps> = ({ history }) => {
    const { logout } = useContext(AuthContext);
    const { items, fetching, fetchingError } = useContext(IceCreamContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your favourite icecream app!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                {items && (
                    <IonList>
                        {items.map(({ _id, name, description }) => (
                            <IceCream key={_id} _id={_id} name={name} onEdit={id => history.push(`/icecream/${id}`)} description={description} />
                        ))}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items!'}</div>
                )}
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={logout}>
                        <IonIcon icon={logOut} />
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/icecream')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default IceCreamsList;
