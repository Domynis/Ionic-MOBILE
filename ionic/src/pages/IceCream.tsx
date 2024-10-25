import { memo } from "react";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import { IonItem, IonLabel } from "@ionic/react";

const log = getLogger('IceCream');

interface IceCreamPropsExt extends IceCreamProps {
    onEdit: (id?: string) => void;
}

const IceCream: React.FC<IceCreamPropsExt> = ({ id, name, description, onEdit }) => {
    log('render');
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{description}</IonLabel>
        </IonItem>
    );
};

export default memo(IceCream);