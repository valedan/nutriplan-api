/*eslint-disable*/
export = Client;
declare class Client {
  constructor(apiKey: any, baseUrl: any);
  apiKey: string;
  clientName: string;
  clientVersion: string;
  baseUrl: string;
  get(path: string, params: any): Promise<any>;
  post(path: string, params: any): Promise<any>;
  put(path: string, params: any): Promise<any>;
  patch(path: string, params: any): Promise<any>;
  delete(path: string, params: any): Promise<any>;
  _jsonRequest(method: any, path: string, params: any): Promise<any>;
  _wrap(options: any): Promise<any>;
}
