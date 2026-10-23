import { type ConnectTokenParams } from './token.js';
export interface ConnectAuthorizationOptions {
    vercelToken?: string;
    callbackUrl?: string;
    webhook?: string;
    deviceCode?: boolean;
    expiresInMs?: number;
    /** OAuth prompt value to pass to the connector's authorization server. */
    prompt?: string;
    /**
     * Region to send the request to, e.g. `sfo1`. Defaults to the
     * `VERCEL_REGION` environment variable; override it to target a
     * different region.
     */
    region?: string;
}
export interface ConnectAuthorizationResponse {
    request: string;
    verifier: string;
    url: string;
    deviceCode?: string;
    expiresAt?: number;
    /**
     * Connector (client) being authorized, matching the `connector`
     * object on the Vercel Connect token response. Present once the
     * Vercel API supports returning it.
     */
    connector?: {
        /** Client id. */
        id: string;
        /** Client uid. */
        uid: string;
        /** Client type, eg. `oauth`, `salesforce`. */
        type: string;
        /** Resolved service id when known, eg. `salesforce`. */
        service?: string;
        /**
         * Curated display name of the resolved service, eg. `Salesforce`,
         * present when the service is known to Vercel Connect. Suited for
         * end-user surfaces like "Sign in with {serviceName}".
         */
        serviceName?: string;
        /** The connector's own (operator-given) name. */
        name: string;
    };
}
export declare function startAuthorization(connector: string, params: ConnectTokenParams, options?: ConnectAuthorizationOptions): Promise<ConnectAuthorizationResponse>;
