import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { IceCreamContext } from "../state/IceCreamProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import IceCreamProps from "../interfaces/IceCream";
import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { iceCream } from "ionicons/icons";
import { AuthContext } from "../auth/AuthProvider";

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

    // useEffect(() => {
    //     setEditing && setEditing(true);
    //     return () => {
    //         setEditing && setEditing(false);
    //     };
    // }, [setEditing]);

    useEffect(() => {
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
        }
    }, [match.params.id, items]);
    const handleSave = useCallback(() => {
        if (name === "") {
            alert("Name is required");
            return;
        };
        const editedIceCream = { ...icecream, name, description, price, tasty };
        log('handleSave', editedIceCream);
        saveItem && saveItem(token, editedIceCream).then(() => {
            history.goBack();
        });
    }, [icecream, saveItem, name, description, price, tasty, history]);
    log('render');
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
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item!'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default IceCreamEdit;