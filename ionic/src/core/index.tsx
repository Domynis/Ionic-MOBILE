export const getLogger: (tag: string) => (...args: any) => void =
  tag => (...args) => console.log(tag, ...args);

export const baseUrl = 'localhost:3000';
export const iceCreamsUrl = `http://${baseUrl}/icecreams`;

const log = getLogger('api');
interface ResponseProps<T> {
  data: T;
}

export function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
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

export const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const authConfig = (token? : string) => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});
