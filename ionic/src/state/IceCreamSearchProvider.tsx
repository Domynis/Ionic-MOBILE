import React, { useCallback, useContext, useEffect, useReducer } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { getLogger } from "../core";
import { getIceCreams } from "./iceCreamApi";
import IceCreamProps from "../interfaces/IceCream";

const log = getLogger('IceCreamSearchProvider');

interface IceCreamSearchState {
    items?: IceCreamProps[];
    fetching: boolean;
    fetchingError?: Error | null;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: IceCreamSearchState = {
    fetching: false,
    items: []
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const RESET_FILTER = 'RESET_FILTER';

const reducer: (state: IceCreamSearchState, action: ActionProps) => IceCreamSearchState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                log('fetchSearchIceCreams items', payload.items);
                return { ...state, items: payload.items, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case RESET_FILTER: 
                return { ...state, items: [], fetching: false };
            default:
                return state;
        }
    };

export const IceCreamSearchContext = React.createContext<IceCreamSearchState>(initialState);

interface IceCreamSearchProviderProps {
    children: React.ReactNode;
    filter?: string; // Optional filter passed down to the provider
    tastyFilter?: boolean; // Optional tasty filter passed down to the provider
}

export const IceCreamSearchProvider: React.FC<IceCreamSearchProviderProps> = ({ children, filter, tastyFilter }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError } = state;

    const fetchIceCreams = useCallback(async () => {
        if (!token) return;
        try {
            dispatch({ type: FETCH_ITEMS_STARTED });
            log('fetchSearchIceCreams started');
            const items = await getIceCreams(token);  // Fetch all items without pagination
            const filteredItems = items.filter(item =>
                (!filter || item.name.toLowerCase().includes(filter.toLowerCase())) &&
                (tastyFilter === undefined || item.tasty === tastyFilter)
            );
            dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: filteredItems } });
        } catch (error) {
            log('fetchSearchIceCreams failed');
            dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
        }
    }, [token, filter, tastyFilter]);

    useEffect(() => {
        fetchIceCreams();
    }, [fetchIceCreams, filter, tastyFilter]);

    const value = { items, fetching, fetchingError };
    log('returns');
    return (
        <IceCreamSearchContext.Provider value={value}>
            {children}
        </IceCreamSearchContext.Provider>
    );
};
