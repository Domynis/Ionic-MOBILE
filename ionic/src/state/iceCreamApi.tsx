import axios from "axios";
import { authConfig, baseUrl, config, getLogger, iceCreamsUrl, withLogs } from "../core";
import IceCreamProps from "../interfaces/IceCream";

const log = getLogger('IceCreamApi');

export const getIceCreams: (token: string) => Promise<IceCreamProps[]> = (token) => {
    return withLogs(axios.get(iceCreamsUrl, authConfig(token)), 'getIceCreams');
};

export const createIceCream: (token: string, item: IceCreamProps) => Promise<IceCreamProps[]> = (token, item) => {
    return withLogs(axios.post(iceCreamsUrl, item, authConfig(token)), 'createIceCream');
};

export const updateIceCream: (token: string, item: IceCreamProps) => Promise<IceCreamProps[]> = (token, item) => {
    return withLogs(axios.put(`${iceCreamsUrl}/${item._id}`, item, authConfig(token)), 'updateIceCream');
};

interface MessageData {
    event: string;
    payload: IceCreamProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('ws open');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
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