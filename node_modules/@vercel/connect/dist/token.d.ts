import type { ConnectAuthorizationDetail } from './authorization-details.js';
export type ConnectSubjectType = 'app' | 'user' | 'jwt-bearer' | 'token';
export type ConnectTokenSubject = ConnectAppTokenSubject | ConnectUserTokenSubject | ConnectJwtBearerTokenSubject | ConnectTokenExchangeSubject;
export interface ConnectAppTokenSubject {
    type: 'app';
}
export interface ConnectUserTokenSubject {
    type: 'user';
    id: string;
    issuer?: string;
    /**
     * When specified, `id` and `issuer` identify the user in the namespace of
     * this IDP connector. The connector must be configured as an IDP.
     * The XAA/ID-JAG protocol is used to resolve the target access token when
     * configured by the target connector.
     *
     * @experimental Subject to change.
     */
    experimental_idp?: string;
}
export interface ConnectJwtBearerTokenSubject {
    type: 'jwt-bearer';
    sub: string;
    /** Defaults to the connector's OAuth client id. */
    iss?: string;
    /** Defaults to the connector's OAuth token endpoint. */
    aud?: string;
    additionalClaims?: Record<string, unknown>;
}
export interface ConnectTokenExchangeSubject {
    /** Inferred as `'token'` when omitted. */
    type?: 'token';
    token: string;
}
export interface ConnectTokenParams {
    subject: ConnectTokenSubject;
    installationId?: string;
    audience?: string[];
    /**
     * Access scopes to request. Defaults to `['*']`, which requests the default
     * scopes for the specified subject type.
     */
    scopes?: string[];
    resources?: string[];
    authorizationDetails?: ConnectAuthorizationDetail[];
    /**
     * Buffer time in milliseconds before token expiration to consider it invalid.
     * If the token expires within this buffer, it will be refreshed.
     * Defaults to 30 seconds.
     */
    validityBufferMs?: number;
}
export interface ConnectTokenResponse {
    token: string;
    /**
     * Per-issuance identifier for the token (`stk_…`), stable for its lifetime;
     * use it to correlate the token with its usage in Vercel observability data.
     */
    tokenId?: string;
    /** Token expiration timestamp in milliseconds since epoch. */
    expiresAt: number;
    connector: {
        /** Opaque Vercel Connect connector id. */
        id: string;
        /** Human-readable Vercel Connect connector UID. */
        uid: string;
        /** Vercel Connect connector type identifier. */
        type: string;
    };
    name?: string;
    installationId?: string;
    tenantId?: string;
    externalSubject?: string;
    /** Driver-specific metadata stored during OAuth */
    metadata?: Record<string, unknown>;
    /** Allow-listed claims propagated from the upstream OAuth token. */
    claims?: Record<string, unknown>;
}
export type ConnectVendorErrorPayload = Record<string, unknown>;
export interface ConnectErrorOptions {
    code?: string;
    status?: number;
    statusText?: string;
    vendor?: ConnectVendorErrorPayload;
}
export declare class ConnectError extends Error {
    readonly code?: string;
    readonly status?: number;
    readonly statusText?: string;
    readonly vendor?: ConnectVendorErrorPayload;
    constructor(message: string, options?: ConnectErrorOptions);
}
export declare class NoValidTokenError extends ConnectError {
    constructor(message: string, options?: ConnectErrorOptions);
}
export declare class UserAuthorizationRequiredError extends ConnectError {
    constructor(message: string, options?: ConnectErrorOptions);
}
export declare class ConnectorInstallationRequiredError extends ConnectError {
    constructor(message: string, options?: ConnectErrorOptions);
}
export interface ConnectOptions {
    vercelToken?: string;
    /**
     * Bypass the in-process token cache and re-fetch from Vercel Connect.
     *
     * The cache normally serves any token that is not within
     * {@link ConnectTokenParams.validityBufferMs} of expiry. That means a
     * grant the user revoked server-side keeps being handed back from the
     * local cache until it expires. Set `forceRefresh` when the caller
     * needs Connect to re-validate the grant on this call — a revoked grant
     * then surfaces as `no_token` / `user_authorization_required` instead of
     * a stale bearer.
     */
    forceRefresh?: boolean;
    /**
     * Region to send the request to, e.g. `sfo1`. Defaults to the
     * `VERCEL_REGION` environment variable; override it to target a
     * different region.
     */
    region?: string;
}
export declare function getToken(connector: string, params: ConnectTokenParams, options?: ConnectOptions): Promise<string>;
export declare function getTokenResponse(connector: string, params: ConnectTokenParams, options?: ConnectOptions): Promise<ConnectTokenResponse>;
export declare function revokeToken(connector: string, params: {
    subject: ConnectTokenSubject;
    installationId?: string;
}, options?: ConnectOptions): Promise<void>;
/**
 * Remove a single cached token entry for `(connector, params)` from the
 * in-process cache.
 *
 * Targeted counterpart to {@link revokeToken}'s `cache.clear()`: it drops
 * exactly the entry {@link getTokenResponse} would serve for these
 * arguments, leaving every other connector/principal untouched. Use it
 * when a credential is known to be bad (the resource server rejected the
 * bearer with a `401`) so the next {@link getTokenResponse} re-fetches
 * instead of re-serving the rejected token — without paying for a Connect
 * round trip on every call the way {@link ConnectOptions.forceRefresh}
 * does.
 *
 * The cache key is derived from `connector` plus every field of `params`,
 * so pass the same `params` used for the original {@link getTokenResponse}
 * call. No-op when no matching entry exists.
 */
export declare function deleteTokenCacheEntry(connector: string, params: ConnectTokenParams): void;
export declare function createConnectErrorFromResponse(response: Response, fallbackMessage: string): Promise<ConnectError>;
