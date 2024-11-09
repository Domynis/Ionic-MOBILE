import { memo, useEffect, useState } from "react";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import { IonImg, IonItem, IonLabel } from "@ionic/react";
import { getWebviewPathFromFilesystem } from "../utils/photoUtils";

const log = getLogger('IceCream');

interface IceCreamPropsExt extends IceCreamProps {
    onEdit: (id?: string) => void;
}

const IceCream: React.FC<IceCreamPropsExt> = ({ _id: id, name, description, price, tasty, photoUrl, onEdit }) => {
    
    const [photoWebviewPath, setPhotoWebviewPath] = useState<string>("https://via.placeholder.com/150");
    
    useEffect(() => {
        const fetchData = async () => {
            if (photoUrl) {
                const webviewPath = await getWebviewPathFromFilesystem(photoUrl, "jpeg");
                setPhotoWebviewPath(webviewPath ?? "https://via.placeholder.com/150");
            }
        };
        fetchData();
    }, [photoUrl]);
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{description}</IonLabel>
            <IonLabel>{price}</IonLabel>
            <IonLabel>{tasty ? "Tasty!" : "Not Tasty!"}</IonLabel>
            <IonImg src={photoWebviewPath} style={{ width: 150, height: 150 }} />
        </IonItem>
    );
};

export default memo(IceCream);