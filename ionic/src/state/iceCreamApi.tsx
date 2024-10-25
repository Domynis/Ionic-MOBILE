import axios from "axios";
import { baseUrl, config, getLogger, iceCreamsUrl, withLogs } from "../core";
import IceCreamProps from "../interfaces/IceCream";

const log = getLogger('IceCreamApi');

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