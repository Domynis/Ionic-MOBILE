import React, { useCallback, useContext, useEffect } from "react";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import PropTypes, { string } from "prop-types";
import { createIceCream, getIceCreams, newWebSocket, updateIceCream } from "./iceCreamApi";
import { AuthContext } from "../auth/AuthProvider";
import { useToast } from "./toastProvider";

const log = getLogger('IceCreamProvider');

type SaveItemFn = (token: string, item: IceCreamProps) => Promise<any>;

export interface IceCreamsState {
    items?: IceCreamProps[];
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    savingError?: Error | null;
    saveItem?: SaveItemFn;
    editing: boolean;
    setEditing?: (editing: boolean) => void;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: IceCreamsState = {
    fetching: false,
    saving: false,
    editing: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const SET_EDITING = 'SET_EDITING';

const reducer: (state: IceCreamsState, action: ActionProps) => IceCreamsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, items: payload.items, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload, fetching: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED:
                log('SAVE_ITEM_SUCCEEDED ' + JSON.stringify(payload.item));
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it._id === item.id);
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
    const { items, fetching, fetchingError, saving, savingError, editing } = state;
    const { showToast } = useToast();

    const setEditing = useCallback((isEditing: boolean) => {
        dispatch({ type: 'SET_EDITING', payload: { editing: isEditing } });
    }, []);

    //TODO: handle token in provider

    useEffect(getIceCreamsEffect, [editing, token]);
    useEffect(wsEffect, [editing, token]);

    const saveItem = useCallback<SaveItemFn>(saveIceCreamCallback, []);
    const value = { items, fetching, fetchingError, saving, savingError, saveItem, editing, setEditing };
    log('returns');
    return (
        <IceCreamContext.Provider value={value}>
            {children}
        </IceCreamContext.Provider>
    );

    function getIceCreamsEffect() {
        if (editing) {
            return;
        }
        let canceled = false;
        if (token) {
            fetchIceCreams();
        }
        return () => {
            canceled = true;
        }

        async function fetchIceCreams() {
            try {
                log('fetchIceCreams started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                log('fetchIceCreams with token: ' + token);
                const iceCreams = await getIceCreams(token);
                log('fetchIceCreams succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: iceCreams } });
                }
            } catch (error) {
                log('fetchIceCreams failed');
                // if(!canceled)
                dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
            }
        }
    }

    async function saveIceCreamCallback(token: string, iceCream: IceCreamProps) {
        try {
            log('saveIceCream started');
            dispatch({ type: SAVE_ITEM_STARTED });
            const savedIceCream = await (iceCream._id ? updateIceCream(token, iceCream) : createIceCream(token, iceCream));
            log('saveIceCream succeeded');
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedIceCream } });
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
                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
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