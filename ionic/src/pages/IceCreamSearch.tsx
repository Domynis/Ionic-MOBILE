import { useContext, useState } from "react";
import { IceCreamSearchContext, IceCreamSearchProvider } from "../state/IceCreamSearchProvider";
import { IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from "@ionic/react";
import IceCreamProps from "../interfaces/IceCream";
import IceCream from "./IceCream";
interface IceCreamSearchProps {
    filter: string;
    onFilterChange: (e: CustomEvent) => void;
}

const IceCreamSearch: React.FC<IceCreamSearchProps> = ({ filter, onFilterChange }) => {
    const { items, fetching, fetchingError } = useContext(IceCreamSearchContext);

    return (
        <IonPage>
            {/* <IonHeader>
                    <IonToolbar>
                        <IonTitle>Your favourite icecream app!</IonTitle>
                    </IonToolbar>
                </IonHeader> */}
            <IonContent>
                <IonSearchbar
                    value={filter}
                    onIonInput={onFilterChange}
                    placeholder="Search ice creams"
                    debounce={300} // Adds a delay to reduce API calls
                />

                {fetching && <IonSpinner name="crescent" />}
                {fetchingError && <p>Error: {fetchingError.message}</p>}

                {items && (
                    <IonList>
                        {items.map(({ _id, name, description, price, tasty }) => (
                            <IceCream key={_id} _id={_id} name={name} onEdit={() => { }} description={description} price={price} tasty={tasty} />
                        ))}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
}

const IceCreamSearchWithProvider: React.FC = () => {
    const [filter, setFilter] = useState('');

    const handleFilterChange = (e: CustomEvent) => {
        setFilter(e.detail.value || "");
    };

    return (
        <IceCreamSearchProvider filter={filter}>
            <IceCreamSearch filter={filter} onFilterChange={handleFilterChange} />
        </IceCreamSearchProvider>
    );
};

export default IceCreamSearchWithProvider;