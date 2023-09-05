import axios, { AxiosError } from 'axios';
import { LoadDBPayload } from './models';

export interface ClientConfig {
  protocol?: string;
  host?: string;
  port?: number;
}

class EpsillaDB {
  private protocol: string;
  private host: string;
  private port: number;
  private db: string | null;
  private baseurl: string;
  private headers: any;

  constructor({ protocol = 'http', host = 'localhost', port = 8888 }: ClientConfig = {}) {
    this.protocol = protocol;
    this.host = host;
    this.port = port;
    this.db = null;
    this.baseurl = `${this.protocol}://${this.host}:${this.port}`;
    this.headers = { 'Content-type': 'application/json' };
  }

  useDB(dbName: string) {
    this.db = dbName;
  }

  async loadDB(dbPath: string, dbName: string, vectorScale?: number, walEnabled?: boolean) {
    try {
      const payload: LoadDBPayload = {
        name: dbName,
        path: dbPath
      };
      if (vectorScale) {
        payload.vectorScale = vectorScale;
      }
      if (walEnabled) {
        payload.walEnabled = walEnabled;
      }
      const response = await axios.post(`${this.baseurl}/api/load`, payload, { headers: this.headers });

      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async unloadDB(dbName: string) {
    try {
      const response = await axios.post(`${this.baseurl}/api/${dbName}/unload`, { headers: this.headers });
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async createTable(tableName: string, fields: any[]) {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.post(`${this.baseurl}/api/${this.db}/schema/tables`,
        {
          name: tableName,
          fields
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async listTables() {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.get(`${this.baseurl}/api/${this.db}/schema/tables/show`);
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async insert(tableName: string, data: any[]) {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.post(`${this.baseurl}/api/${this.db}/data/insert`,
        {
          table: tableName,
          data
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async deleteByPrimaryKeys(tableName: string, primaryKeys: string[]) {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.post(`${this.baseurl}/api/${this.db}/data/delete`,
        {
          table: tableName,
          primaryKeys
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async query(
    tableName: string,
    queryField: string,
    queryVector: number[],
    limit: number,
    responseField: string[] = [],
    withDistance = false
  ) {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.post(`${this.baseurl}/api/${this.db}/data/query`,
        {
          table: tableName,
          queryField,
          queryVector,
          response: responseField,
          limit,
          withDistance
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async get(tableName: string, responseField: string[] = []) {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.post(`${this.baseurl}/api/${this.db}/data/get`,
        {
          table: tableName,
          response: responseField
        },
        { headers: this.headers }
      );
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async dropTable(tableName: string) {
    if (!this.db) {
      console.error('[ERROR] Please use_db() first!');
      return new Error('[ERROR] Please use_db() first!');
    }
    try {
      const response = await axios.delete(`${this.baseurl}/api/${this.db}/schema/tables/${tableName}`, { headers: this.headers });
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }

  async dropDB(dbName: string) {
    try {
      const response = await axios.delete(`${this.baseurl}/api/${dbName}/drop/`, { headers: this.headers });
      return response.data;
    } catch (err) {
      return (err as AxiosError).response?.data;
    }
  }
}

export default EpsillaDB