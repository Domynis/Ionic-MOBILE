import axios from "axios";
import { authConfig, authConfigMultiPart, baseUrl, config, getLogger, iceCreamsUrl, withLogs } from "../core";
import IceCreamProps from "../interfaces/IceCream";
import { useNetwork } from "./useNetwork";
import { Preferences } from '@capacitor/preferences';
import { MyPhoto } from "../utils/photoUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";

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

export const getIceCreamsPaginated: (token: string, page: number, pageSize: number) => Promise<{ items: IceCreamProps, hasNextPage: boolean }> = (token, page, pageSize) => {
    return withLogs(axios.get(`${iceCreamsUrl}/list?page=${page}&pageSize=${pageSize}`, authConfig(token)), 'getIceCreamsPaginated');
}

export const uploadIceCreamPhoto: (token: string, item: IceCreamProps, photo: MyPhoto) => Promise<any> = async (token, item, photo) => {
    let blob;

    try {
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data // Adjust based on how the file is saved
        });

        // Convert base64 to a Blob
        if (typeof (readFile.data) === 'string') {
            const byteCharacters = atob(readFile.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: "image/jpeg" }); // Adjust MIME type if needed
        } else {
            blob = new Blob([readFile.data], { type: "image/jpeg" }); // Adjust MIME type if needed
        }
    } catch (error) {
        console.error("Error reading file from filesystem:", error);
        throw error;
    }

    const formData = new FormData();
    formData.append('file', blob, photo.filepath);
    log('uploadIceCreamPhoto formData', formData);

    formData.forEach((value, key) => {
        console.log(`${key}:`, value);
    });

    return withLogs(axios.post(`${iceCreamsUrl}/upload-photo/${item._id}`, formData, authConfigMultiPart(token)), 'uploadIceCreamPhoto');
}

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