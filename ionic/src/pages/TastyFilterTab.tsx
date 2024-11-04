import { useState, useContext } from "react";
import { IceCreamSearchContext, IceCreamSearchProvider } from "../state/IceCreamSearchProvider";
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonToggle, IonSpinner, IonTitle, IonToolbar } from "@ionic/react";
import IceCream from "./IceCream";
interface TastyFilterTabProps {
    tastyFilter: boolean | undefined;
    onTastyFilterChange: (e: CustomEvent) => void;
}

const TastyFilterTab: React.FC<TastyFilterTabProps> = ({ tastyFilter, onTastyFilterChange }) => {
    const { items, fetching, fetchingError } = useContext(IceCreamSearchContext);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Filter by Tasty</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel>Tasty</IonLabel>
                    <IonToggle onIonChange={onTastyFilterChange} checked={tastyFilter === true} />
                </IonItem>

                {fetching && <IonSpinner name="crescent" />}
                {fetchingError && <p>Error: {fetchingError.message}</p>}

                {items && (
                    <IonList>
                        {items.map((iceCream) => (
                            <IceCream key={iceCream._id} {...iceCream} onEdit={() => { }} />
                        ))}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
};

const TastyFilterTabWithProvider: React.FC = () => {
    const [tastyFilter, setTastyFilter] = useState<boolean | undefined>(undefined);

    const handleTastyToggle = (e: CustomEvent) => {
        setTastyFilter(e.detail.checked ? true : false); // true for tasty, false for untasty
    };

    return (
        <IceCreamSearchProvider tastyFilter={tastyFilter}>
            <TastyFilterTab tastyFilter={tastyFilter} onTastyFilterChange={handleTastyToggle} />
        </IceCreamSearchProvider>
    );
};

export default TastyFilterTabWithProvider;
