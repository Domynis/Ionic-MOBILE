import React, { useContext, useEffect, useRef, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonLoading, IonFab, IonFabButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonModal, IonButton, createAnimation } from '@ionic/react';
import { add, logOut, map } from 'ionicons/icons';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { IceCreamContext } from '../state/IceCreamProvider';
import IceCream from './IceCream';
import { AuthContext } from '../auth/AuthProvider';
import { useNetwork } from '../state/useNetwork';
import MyMap from '../components/MyMap';
import { useMyLocation } from '../state/useMyLocation';
import { enterAnimation, leaveAnimation } from '../utils/modalAnimations';
// import { useServerStatus } from '../state/useServerStatus';
const log = getLogger('IceCreamsList');

const IceCreamsList: React.FC<RouteComponentProps> = ({ history }) => {
    const { logout } = useContext(AuthContext);
    const { items, fetching, hasNextPage, fetchingError, editing, fetchIceCreams, fetchedPages } = useContext(IceCreamContext);
    const { token } = useContext(AuthContext);

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [showToast, setShowToast] = useState(false);
    const { networkStatus } = useNetwork();
    const isServerAvailable = true;

    // track pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const fetchInProgressRef = useRef(false);

    const [showMapModal, setShowMapModal] = useState(false);

    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}
    useEffect(getIceCreamsEffect, [token]);

    const titleRef = useRef<HTMLIonTitleElement>(null);
    const networkTitleRef = useRef<HTMLIonTitleElement>(null);

    useEffect(() => {
        if (titleRef.current) {
            const animation = createAnimation()
                .addElement(titleRef.current)
                .duration(1000)
                .fromTo('opacity', '0', '1')
                .fromTo('transform', 'translateX(150px)', 'translateX(0px)')
                .fromTo('color', 'red', 'white')
                .easing('ease-out');

            animation.play();
        }
    }, [titleRef.current]);

    useEffect(() => {
        if (networkTitleRef.current) {
            const animation = createAnimation()
                .addElement(networkTitleRef.current)
                .duration(1000)
                .fromTo('opacity', '0', '1')
                .fromTo('transform', 'translateX(-150px)', 'translateX(0px)')
                .fromTo('color', 'cyan', 'white')
                .easing('ease-out');

            animation.play();
        }
    }, [networkTitleRef.current]);

    const loadMoreData = async (event: CustomEvent<void>) => {
        if (fetchIceCreams && !fetchInProgressRef.current && isServerAvailable) {
            log('loadMoreData - page', page);
            log('loadMoreData - isServerAvailable', isServerAvailable);
            fetchInProgressRef.current = true;
            const nextPage = page + 1;
            if (!fetchedPages.includes(nextPage)) {
                await fetchIceCreams(nextPage, pageSize, false).finally(() => {
                    fetchInProgressRef.current = false;
                });
            }

            setPage(nextPage);
            if (!hasNextPage) {
                setDisableInfiniteScroll(true);
            }

            (event.target as HTMLIonInfiniteScrollElement).complete();
        }
    };



    function getIceCreamsEffect() {
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

    const handleOpenMap = () => {
        setShowMapModal(true);
    };

    const handleCloseMap = () => {
        setShowMapModal(false);
    };

    const markers = items?.map(({ _id, name, coordinates }) => {
        if (coordinates) {
            return {
                lat: coordinates?.lat,
                lng: coordinates?.lng,
                name: name,
            }
        }
        return undefined;
    }).filter(marker => marker !== undefined);


    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle ref={titleRef}>Your favourite icecream app!</IonTitle>
                    <IonTitle ref={networkTitleRef} slot="end">Network: {networkStatus.connected ? 'Online' : 'Offline'}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {/* <IonLoading isOpen={fetching} message="Fetching items" /> */}
                {items && (
                    <IonList>
                        {items.map(({ _id, name, description, price, tasty, photoUrl, photoUrlBE, coordinates }) => (
                            <IceCream key={_id} _id={_id} name={name} photoUrl={photoUrl} photoUrlBE={photoUrlBE} coordinates={coordinates} onEdit={id => history.push(`/icecream/${id}`)} description={description} price={price} tasty={tasty} />
                        ))}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items!'}</div>
                )}
                {/* TODO: Fix loading correctly after returning Online. */}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => loadMoreData(e)}>
                    {isServerAvailable && (<IonInfiniteScrollContent loadingText="Loading more data..."> </IonInfiniteScrollContent>)}
                </IonInfiniteScroll>
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={logout}>
                        <IonIcon icon={logOut} />
                    </IonFabButton>
                </IonFab>
                {<IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={handleOpenMap}>
                        <IonIcon icon={map} />
                    </IonFabButton>
                </IonFab>}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/icecream')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
                <IonModal isOpen={showMapModal} onDidDismiss={handleCloseMap} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Map of Ice Cream Locations</IonTitle>
                            <IonButton slot="end" onClick={handleCloseMap}>Close</IonButton>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <MyMap markers={markers} readonly={true} onMapClick={undefined} />
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default IceCreamsList;
