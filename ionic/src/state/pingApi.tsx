import axios from "axios";
import { baseUrl, getLogger, withLogs } from "../core";

const log = getLogger('IceCreamApi');
const pingUrl = `http://${baseUrl}/api/ping`;

export const ping: () => Promise<string> = () => {
    return withLogs(axios.get(pingUrl), 'Ping Api');
};