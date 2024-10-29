import React, { useCallback, useContext, useEffect } from "react";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import PropTypes, { string } from "prop-types";
import { createIceCream, getIceCreams, getIceCreamsPaginated, newWebSocket, updateIceCream } from "./iceCreamApi";
import { AuthContext } from "../auth/AuthProvider";
import { useToast } from "./toastProvider";
import { Preferences } from "@capacitor/preferences";
import { useNetwork } from "./useNetwork";

const log = getLogger('IceCreamProvider');

const OFFLINE_ICECREAMS_KEY = "offline-icecreams";

type SaveItemFn = (token: string, item: IceCreamProps) => Promise<any>;
type FetchIceCreamsFn = (page: number, pageSize: number, canceled: boolean) => Promise<any>;

export interface IceCreamsState {
    items?: IceCreamProps[];
    hasNextPage: boolean;
    fetching: boolean;
    fetchingError?: Error | null;
    fetchedPages: number[];
    saving: boolean;
    savingError?: Error | null;
    saveItem?: SaveItemFn;
    editing: boolean;
    setEditing?: (editing: boolean) => void;
    syncing: boolean;
    fetchIceCreams?: FetchIceCreamsFn;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: IceCreamsState = {
    fetching: false,
    hasNextPage: false,
    fetchedPages: [],
    saving: false,
    editing: false,
    syncing: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const SET_EDITING = 'SET_EDITING';
const SYNC_ITEMS = 'SYNC_ITEMS';


const reducer: (state: IceCreamsState, action: ActionProps) => IceCreamsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                log('FETCH_ITEMS_SUCCEEDED fetchedPages now ' + [...state.fetchedPages, payload.page]);
                return { ...state, items: [...(state.items || []), ...payload.items], fetchedPages: [...state.fetchedPages, payload.page], hasNextPage: payload.hasNextPage, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload, fetching: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED:
                log('SAVE_ITEM_SUCCEEDED ' + JSON.stringify(payload.item));
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it._id === item._id);
                if (index === -1) {
                    // items.splice(0, 0, item);
                    // add new item to the end
                    items.push(item);
                } else {
                    items[index] = item;
                }
                return { ...state, items, saving: false };
            case SAVE_ITEM_FAILED:
                return { ...state, savingError: payload, saving: false };
            case SET_EDITING:
                return { ...state, editing: payload.editing };
            case SYNC_ITEMS:
                return { ...state, syncing: payload };
            default:
                return state;
        }
    };

export const IceCreamContext = React.createContext<IceCreamsState>(initialState);

interface IceCreamProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const IceCreamProvider: React.FC<IceCreamProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const { items, fetching, fetchingError, fetchedPages, hasNextPage, saving, savingError, editing, syncing } = state;
    const { showToast } = useToast();
    const { networkStatus } = useNetwork();

    const setEditing = useCallback((isEditing: boolean) => {
        dispatch({ type: 'SET_EDITING', payload: { editing: isEditing } });
    }, []);


    useEffect(wsEffect, [token]);

    useEffect(() => {
        if (networkStatus.connected && !syncing) {
            syncOfflineData();
        }
        async function syncOfflineData() {
            const { value } = await Preferences.get({ key: OFFLINE_ICECREAMS_KEY });
            if (!value) return;

            dispatch({ type: SYNC_ITEMS, payload: true });
            log('syncOfflineData started');
            const offlineItems = JSON.parse(value);
            log('syncOfflineData ', offlineItems);
            for (const item of offlineItems) {
                try {
                    log('syncOfflineData item', item);
                    await (item._id ? updateIceCream(token, item) : createIceCream(token, item));
                    // dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
                } catch (error) {
                    log('syncOfflineData failed ', error);
                    showToast('Failed to sync some items. They will remain offline.', 3000);
                    dispatch({ type: SYNC_ITEMS, payload: false });
                    return;
                }
            }

            await Preferences.remove({ key: OFFLINE_ICECREAMS_KEY });
            showToast('All offline items synced.', 3000);
            dispatch({ type: SYNC_ITEMS, payload: false });
        };
    }, [networkStatus.connected])

    const saveItem = useCallback<SaveItemFn>(saveIceCreamCallback, [networkStatus.connected, Preferences]);

    const fetchIceCreams = useCallback<FetchIceCreamsFn>(fetchIceCreamsCallBack, [state.fetchedPages]);

    const value = { items, fetching, fetchingError, fetchedPages, hasNextPage, saving, savingError, saveItem, editing, setEditing, syncing, fetchIceCreams };
    log('returns');
    return (
        <IceCreamContext.Provider value={value}>
            {children}
        </IceCreamContext.Provider>
    );

    async function fetchIceCreamsCallBack(page: number, pageSize: number = 10, canceled: boolean) {
        if(fetchedPages.includes(page)) return;
        log("FETCH ITEMS CALLED!!!! with page: " + page);
        try {
            log('fetchIceCreams started');
            dispatch({ type: FETCH_ITEMS_STARTED });
            const { items, hasNextPage } = await getIceCreamsPaginated(token, page, pageSize);
            log('fetchIceCreams succeeded');
            if (!canceled) {
                dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items, hasNextPage, page } });
            }
        } catch (error) {
            log('fetchIceCreams failed');
            // if(!canceled)
            dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
        }
    }

    async function saveIceCreamCallback(token: string, iceCream: IceCreamProps) {
        const storeOfflineItem = async (item: IceCreamProps) => {
            dispatch({ type: SAVE_ITEM_STARTED });
            const { value } = await Preferences.get({ key: OFFLINE_ICECREAMS_KEY });
            const offlineItems = value ? JSON.parse(value) : [];
            offlineItems.push(item);
            log('storeOfflineItem ', item);
            log('storeOfflineItems ', offlineItems);

            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
            await Preferences.set({ key: OFFLINE_ICECREAMS_KEY, value: JSON.stringify(offlineItems) });
        }
        try {
            log('saveIceCream started');
            dispatch({ type: SAVE_ITEM_STARTED });
            if (networkStatus.connected) {
                try {
                    log('saveIceCream online');
                    const savedIceCream = await (iceCream._id ? updateIceCream(token, iceCream) : createIceCream(token, iceCream));
                    log('saveIceCream succeeded');
                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedIceCream } });
                } catch (error) {
                    log('saveIceCream offline');
                    storeOfflineItem(iceCream);
                    showToast('Failed to save IceCream. It will be saved offline.', 3000);
                    dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
                }
            } else {
                log('saveIceCream offline');
                storeOfflineItem(iceCream);
                showToast('No internet connection. IceCream will be saved offline.', 3000);
                dispatch({ type: SAVE_ITEM_FAILED, payload: {} });

            }
        } catch (error) {
            log('saveIceCream failed');
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }



    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { event, payload: item } = message;
                if (event === 'created' || event === 'updated') {
                    log(`ws message, icecream ${event}, ${item._id}`);
                    // dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
                    showToast(`IceCream ${item.name} ${event}`, 3000);
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};