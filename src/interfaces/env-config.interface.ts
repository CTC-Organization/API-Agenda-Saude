export interface IEnvInterface {
    getAppPort(): number;

    getNodeEnv(): string;

    getDatabase(): string;

    getJwtPrivateKey(): string;

    getJwtPublicKey(): string;

    getJwtAccessTokenExpiresIn(): string;
    getGoogleDriveFolderId(): string;
    getGoogleCloudClientEmail(): string;
    getGoogleCredentialsJson(): string;
}
