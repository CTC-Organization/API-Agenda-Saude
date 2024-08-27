export interface IEnvInterface {
    getAppPort(): number;

    getNodeEnv(): string;

    getDatabase(): string;

    getMongodbUri(): string;

    getJwtPrivateKey(): string;

    getJwtPublicKey(): string;

    getJwtAccessTokenExpiresIn(): string;

    getGoggleCloudBucketName(): string;

    getGoogleCloudCredentials(): string;

    getGoggleMapsApiKey(): string;
}
