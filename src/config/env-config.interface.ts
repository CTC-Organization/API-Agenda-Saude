export interface IEnvInterface {
    getAppPort(): number;

    getNodeEnv(): string;

    getDatabaseUrl(): string;

    getDatabase(): string;
}
