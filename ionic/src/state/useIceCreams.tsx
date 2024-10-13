import { useCallback, useEffect, useReducer } from "react";
import { getLogger } from "../core";
import { getIceCreams } from "./iceCreamApi";

const log = getLogger('useIceCreams');

export interface IceCreamState {
    items?: IceCreamProps[];
    fetching: boolean;
    fetchingError?: Error;
}

export interface IceCreamProps extends IceCreamState {
    addItem: () => void,
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: IceCreamState = {
    items: undefined,
    fetching: false,
    fetchingError: undefined,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';

const reducer: (state: IceCreamState, action: ActionProps) => IceCreamState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true};
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, items: payload.items, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            default:
                return state;
        }
    };

export const useIceCreams: () => IceCreamProps = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError } = state;
    const addItem = useCallback(() => {
        log('addItem...');
    }, []);
    useEffect(getIceCreamsEffect, [dispatch]);
    log(`returns - fetching - ${fetching}, items = ${JSON.stringify(items)}`);
    return {
        items,
        fetching,
        fetchingError,
        addItem,
    };

    function getIceCreamsEffect() {
        let canceled = false;
        fetchIceCreams();
        return () => {
            canceled = true;
        }

        async function fetchIceCreams() {
            try {
                log('fetchIceCreams started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const items = await getIceCreams();
                if (canceled) {
                    return;
                }
                log('fetchIceCreams succeeded');
                dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
            } catch (error) {
                if (canceled) {
                    return;
                }
                log('fetchIceCreams failed');
                dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
            }
        }
    }
};