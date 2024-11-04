import { memo } from "react";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import { IonItem, IonLabel } from "@ionic/react";

const log = getLogger('IceCream');

interface IceCreamPropsExt extends IceCreamProps {
    onEdit: (id?: string) => void;
}

const IceCream: React.FC<IceCreamPropsExt> = ({ _id: id, name, description, price, tasty, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{description}</IonLabel>
            <IonLabel>{price}</IonLabel>
            <IonLabel>{tasty ? "Tasty!" : "Not Tasty!"}</IonLabel>
        </IonItem>
    );
};

export default memo(IceCream);