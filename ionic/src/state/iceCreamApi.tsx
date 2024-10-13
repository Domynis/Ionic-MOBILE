import axios from "axios";
import { getLogger } from "../core";
import IceCreamProps from "../interfaces/IceCream";

const log = getLogger('IceCreamApi');

const baseUrl = 'localhost:3000';
const iceCreamsUrl = `http://${baseUrl}/icecreams`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(response => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(response.data);
        })
        .catch(error => {
            log(`${fnName} - failed`);
            return Promise.reject(error);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json',
    },
};

export const getIceCreams: () => Promise<IceCreamProps[]> = () => {
    return withLogs(axios.get(iceCreamsUrl, config), 'getIceCreams');
};

export const createIceCream: (item: IceCreamProps) => Promise<IceCreamProps[]> = item => {
    return withLogs(axios.post(iceCreamsUrl, item, config), 'createIceCream');
};

export const updateIceCream: (item: IceCreamProps) => Promise<IceCreamProps[]> = item => {
    return withLogs(axios.put(`${iceCreamsUrl}/${item.id}`, item, config), 'updateIceCream');
};

interface MessageData {
    event: string;
    payload: {
        item: IceCreamProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('ws open');
    };
    ws.onclose = () => {
        log('ws closed');
    };
    ws.onerror = error => {
        log('ws error', error);
    }
    ws.onmessage = (msg) => {
        log('ws message');
        onMessage(JSON.parse(msg.data));
    };
    return () => {
        ws.close();
    };
}