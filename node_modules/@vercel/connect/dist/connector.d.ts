import { type ConnectOptions } from './token.js';
/**
 * Connector metadata as returned by Vercel Connect. This is the stable, useful
 * subset of the connector object the management APIs return.
 */
export interface ConnectorMetadata {
    /** Opaque Vercel Connect connector id (e.g. `scl_…`). */
    id: string;
    /** Human-readable Vercel Connect connector UID. */
    uid: string;
    name: string;
    /** Connector type identifier (e.g. `snowflake`, `oauth`). */
    type: string;
    /** Service the connector integrates with. */
    service: string;
    /** Fully-qualified URL for the connector's service when derivable. */
    clientUrl?: string;
    createdAt: number;
    updatedAt: number;
    /** Vendor-specific public configuration. */
    vendor: Record<string, unknown>;
}
/**
 * Fetch a connector's metadata from Vercel Connect.
 *
 * Authenticates with the deployment's Vercel OIDC token (same as
 * {@link getToken}); the connector must be attached to the requesting
 * deployment's project and enabled for its environment.
 *
 * @param connector - The connector id or UID.
 */
export declare function getConnectorMetadata(connector: string, options?: ConnectOptions): Promise<ConnectorMetadata>;
