import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { IceCreamContext } from "../state/IceCreamProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import IceCreamProps from "../interfaces/IceCream";
import { IonActionSheet, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonImg, IonInput, IonLoading, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { AuthContext } from "../auth/AuthProvider";
import { takePhoto, MyPhoto, getWebviewPathFromFilesystem, getImageBlobUrl, getWebviewPath } from "../utils/photoUtils";
import { uploadIceCreamPhoto } from "../state/iceCreamApi";

const log = getLogger('IceCreamEdit');

interface IceCreamEditProps extends RouteComponentProps<{
    id?: string;
}> { }

const IceCreamEdit: React.FC<IceCreamEditProps> = ({ history, match }) => {
    const { token } = useContext(AuthContext);
    const { items, saving, savingError, saveItem, setEditing } = useContext(IceCreamContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [tasty, setTasty] = useState(false);
    const [icecream, setIceCream] = useState<IceCreamProps>();
    const [photo, setPhoto] = useState<MyPhoto>();
    const [showActionSheet, setShowActionSheet] = useState(false);


    // useEffect(() => {
    //     setEditing && setEditing(true);
    //     return () => {
    //         setEditing && setEditing(false);
    //     };
    // }, [setEditing]);

    useEffect(() => {
        const fetchData = async () => {
            log('useEffect');
            const routeId = match.params.id || '';
            const item = items?.find(it => it._id === routeId);
            setIceCream(item);

            if (item) {
                setName(item.name);
                if (item.description) {
                    setDescription(item.description);
                }
                if (item.price) {
                    setPrice(item.price);
                }
                if (item.tasty) {
                    setTasty(item.tasty);
                }
                if (item.photoUrl) {
                    log('useEffect - photoUrl', item.photoUrl);
                    // const webviewPath = !item.photoUrl.includes("http") ? await getWebviewPathFromFilesystem(item.photoUrl, "jpeg") :
                    //     await getImageBlobUrl(item.photoUrl, token);
                    
                    const webviewPath = await getWebviewPath(item.photoUrl, item.photoUrlBE, token);
                    setPhoto({
                        filepath: item.photoUrl,
                        webviewPath: webviewPath,
                    });
                }
            }
        };

        fetchData();
    }, [match.params.id, items]);

    const handleTakePhoto = async () => {
        const newPhoto = await takePhoto(icecream?._id);
        if (newPhoto) {
            setPhoto(newPhoto);
        }
    };

    const handleSave = useCallback(() => {
        if (name === "") {
            alert("Name is required");
            return;
        };
        const photoUrl = photo?.filepath;
        const editedIceCream = { ...icecream, name, description, price, tasty, photoUrl };
        log('handleSave', editedIceCream);
        saveItem && saveItem(token, editedIceCream).then(() => {
            history.goBack();
        });
    }, [icecream, saveItem, name, description, price, tasty, photo, history]);

    const handleUpload = useCallback(async () => {
        if (photo && icecream) {
            log('handleUpload', photo);
            try {
                const response = await uploadIceCreamPhoto(token, icecream, photo);
                log('handleUpload - response', response);

                if (response && response.photoUrl) {
                    setPhoto({
                        filepath: response.photoUrl,
                        webviewPath: await getImageBlobUrl(response.photoUrl, token),
                    });
                } else {
                    alert('Failed to upload photo');
                }
            } catch (error) {
                log('handleUpload - error', error);
                alert('Failed to upload photo');
            }
        }
    }, [icecream, photo]);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>Save</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonText>Name:</IonText>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                <IonText>Description:</IonText>
                <IonInput value={description} onIonChange={e => setDescription(e.detail.value || '')} />
                <IonText>Price:</IonText>
                <IonInput type="number" min={0} placeholder="000" value={price} onIonChange={e => setPrice(Number(e.detail.value || "0"))} />
                <IonText>Tasty:</IonText>
                <IonCheckbox checked={tasty} onIonChange={e => setTasty(e.detail.checked)} />
                <IonButton onClick={handleTakePhoto}>Take photo</IonButton>
                {photo && (
                    <>
                        <div onClick={() => setShowActionSheet(true)}>
                            <IonImg src={photo.webviewPath} alt="icecream" style={{ width: 400, height: 400 }} />
                        </div>
                        <IonActionSheet
                            isOpen={showActionSheet}
                            onDidDismiss={() => setShowActionSheet(false)}
                            buttons={[
                                {
                                    text: 'Upload',
                                    role: 'selected',
                                    icon: 'cloud-upload-outline',
                                    handler: handleUpload
                                }
                            ]}
                        />
                    </>
                )}
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item!'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default IceCreamEdit;