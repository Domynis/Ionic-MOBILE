import React, { useContext, useEffect, useRef, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonLoading, IonFab, IonFabButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import { add, logOut } from 'ionicons/icons';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { IceCreamContext } from '../state/IceCreamProvider';
import IceCream from './IceCream';
import { AuthContext } from '../auth/AuthProvider';
import { useNetwork } from '../state/useNetwork';
const log = getLogger('IceCreamsList');

const IceCreamsList: React.FC<RouteComponentProps> = ({ history }) => {
    const { logout } = useContext(AuthContext);
    const { items, fetching, hasNextPage, fetchingError, editing, fetchIceCreams, fetchedPages } = useContext(IceCreamContext);
    const { token } = useContext(AuthContext);

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [showToast, setShowToast] = useState(false);
    const { networkStatus } = useNetwork();

    // track pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const fetchInProgressRef = useRef(false);

    useEffect(getIceCreamsEffect, []);

    const loadMoreData = async (event: CustomEvent<void>) => {
        if (fetchIceCreams) {
            log('loadMoreData - page', page);
            const nextPage = page + 1;
            if (!fetchedPages.includes(nextPage)) {
                await fetchIceCreams(nextPage, pageSize, false);
            }

            setPage(nextPage);
            if (!hasNextPage) {
                setDisableInfiniteScroll(true);
            }

            (event.target as HTMLIonInfiniteScrollElement).complete();
        }
    };



    function getIceCreamsEffect() {
        // TODO: FIX DOUBLE FETCHING IN THE START
        if (editing || !fetchIceCreams || !token || fetching || fetchedPages.includes(page)) {
            return;
        }

        let canceled = false;
        if (!fetchInProgressRef.current) {
            log('getIceCreamEffect - fetchedPages', fetchedPages);
            log('getIceCreamEffect - Page to fetch', page);
            fetchInProgressRef.current = true;
            if (!fetchedPages.includes(page) && !fetching) {
                log('getIceCreamsEffect - fetching items');
                fetchIceCreams(page, pageSize, canceled).finally(() => {
                    fetchInProgressRef.current = false;
                });
            }
        }

        return () => {
            canceled = true;
        }
    }

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your favourite icecream app!</IonTitle>
                    <IonTitle slot="end">Network: {networkStatus.connected ? 'Online' : 'Offline'}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                {items && (
                    <IonList>
                        {items.map(({ _id, name, description, price, tasty }) => (
                            <IceCream key={_id} _id={_id} name={name} onEdit={id => history.push(`/icecream/${id}`)} description={description} price={price} tasty={tasty} />
                        ))}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items!'}</div>
                )}
                <IonInfiniteScroll threshold="1px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => loadMoreData(e)}>
                    <IonInfiniteScrollContent loadingText="Loading more data..."> </IonInfiniteScrollContent>
                </IonInfiniteScroll>
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
