import type { ConnectTokenParams } from './token.js';
export type ConnectInstallationParams = Omit<ConnectTokenParams, 'subject'>;
export interface ConnectInstallationOptions {
    vercelToken?: string;
    returnUrl?: string;
    webhook?: string;
    tenantId?: string;
    deviceCode?: boolean;
    expiresInMs?: number;
    /**
     * Region to send the request to, e.g. `sfo1`. Defaults to the
     * `VERCEL_REGION` environment variable; override it to target a
     * different region.
     */
    region?: string;
}
export interface ConnectInstallationResponse {
    request: string;
    verifier: string;
    url: string;
    deviceCode?: string;
    expiresAt: number;
    connector: {
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
/**
 * Create an operator installation request for an app-scoped connector.
 *
 * @experimental This API is feature-gated while experimental. Contact Vercel
 * to enable access before using it.
 */
export declare function experimental_startInstallation(connector: string, params?: ConnectInstallationParams, options?: ConnectInstallationOptions): Promise<ConnectInstallationResponse>;
