import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { IceCreamContext } from "../state/IceCreamProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import IceCreamProps from "../interfaces/IceCream";
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { iceCream } from "ionicons/icons";

const log = getLogger('IceCreamEdit');

interface IceCreamEditProps extends RouteComponentProps<{
    id?: string;
}> { }

const IceCreamEdit: React.FC<IceCreamEditProps> = ({ history, match }) => {
    const { items, saving, savingError, saveItem } = useContext(IceCreamContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icecream, setIceCream] = useState<IceCreamProps>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const item = items?.find(it => it.id === routeId);
        setIceCream(item);
        if (item) {
            setName(item.name);
            if (item.description) {
                setDescription(item.description);
            }
        }
    }, [match.params.id, items]);
    const handleSave = useCallback(() => {
        const editedIceCream = iceCream ? { ...icecream, name, description } : { name, description };
        saveItem && saveItem(editedIceCream).then(() => history.goBack());
    }, [icecream, saveItem, name, description, history]);
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
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item!'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default IceCreamEdit;