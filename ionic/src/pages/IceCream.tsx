import { memo, useContext, useEffect, useState } from "react";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import { IonImg, IonItem, IonLabel } from "@ionic/react";
import { getImageBlobUrl, getWebviewPathFromFilesystem } from "../utils/photoUtils";
import { AuthContext } from "../auth/AuthProvider";

const log = getLogger('IceCream');

interface IceCreamPropsExt extends IceCreamProps {
    onEdit: (id?: string) => void;
}

const IceCream: React.FC<IceCreamPropsExt> = ({ _id: id, name, description, price, tasty, photoUrl, photoUrlBE, onEdit }) => {

    const [photoWebviewPath, setPhotoWebviewPath] = useState<string>("https://via.placeholder.com/150");
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            log('useEffect - photoUrl', photoUrl);
            if (photoUrl) {
                let webviewPath = !photoUrl.includes("http") ? await getWebviewPathFromFilesystem(photoUrl, "jpeg")
                    : await getImageBlobUrl(photoUrl, token);
                if(webviewPath === undefined && photoUrlBE) {
                    webviewPath = await getImageBlobUrl(photoUrlBE, token);
                }
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