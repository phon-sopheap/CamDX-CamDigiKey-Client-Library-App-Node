# CamDX CamDigiKey Client Library App

A thin Express HTTP wrapper around the [`camdigikey-client`](https://github.com/Techo-Startup-Center/camdigikey-client-library-node) Node library, exposing CamDigiKey authentication operations as REST endpoints.

## Setup

1. Copy `.env.sample` to `.env` and fill in your CamDigiKey service account credentials.
2. Place your TLS client keystore and truststore `.p12` files under `keystore/`.
3. Install dependencies and start the server:

```bash
pnpm install
pnpm start
```

The server listens on port `8000`.

### Environment variables

| Variable | Description |
| --- | --- |
| `CAMDIGIKEY_CLIENT_ID` | CamDigiKey service account client ID |
| `CAMDIGIKEY_HMAC_KEY` | HMAC signing key |
| `CAMDIGIKEY_AES_SECRET_KEY` | AES secret key used to encrypt/decrypt payloads |
| `CAMDIGIKEY_AES_IV_PARAMS` | AES IV parameters |
| `CAMDIGIKEY_CLIENT_DOMAIN` | Registered client domain |
| `CAMDIGIKEY_CLIENT_KEYSTORE_FILE` | Path to the mTLS client keystore (`.p12`) |
| `CAMDIGIKEY_CLIENT_KEYSTORE_FILE_PASSWORD` | Password for the client keystore |
| `CAMDIGIKEY_CLIENT_TRUST_STORE_FILE` | Path to the mTLS trust store (`.p12`) |
| `CAMDIGIKEY_CLIENT_TRUST_STORE_FILE_PASSWORD` | Password for the trust store |

## API

All responses are JSON. On failure, endpoints respond with the relevant HTTP status code and `{ "error": string }`.

### `GET /login-token`

Generate a login token/URL to start the CamDigiKey login flow.

**Query parameters** (all optional)

| Param | Type | Description |
| --- | --- | --- |
| `successReturnUrl` | string | URL CamDigiKey redirects to on successful login |
| `errorReturnUrl` | string | URL CamDigiKey redirects to on failed login |
| *(any other param)* | string | Forwarded as `callbackVars` and echoed back on the return redirect |

Values are URL-decoded and normalized to strings before being sent to the client library. Example:

```
GET /login-token?successReturnUrl=https%3A%2F%2Fapp.example.com%2Fsuccess&errorReturnUrl=https%3A%2F%2Fapp.example.com%2Ferror&state=abc123
```

**Response** `200`

```json
{ "loginToken": "...", "loginUrl": "https://..." }
```

**Errors**: `500` on library error.

---

### `POST /access-token`

Exchange an auth code for a user access token.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `authToken` | string | Yes |

```json
{ "authToken": "auth-code-from-callback" }
```

**Response** `200`

```json
{ "accessToken": "..." }
```

**Errors**: `400` if `authToken` is missing/empty, `500` on library error.

---

### `POST /`

Validate a JWT access token.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `accessToken` | string | Yes |

```json
{ "accessToken": "eyJhbGciOi..." }
```

**Response** `200`

```json
{ "is_valid": true, "payload": { /* AccessTokenStatusResponse | null */ } }
```

**Errors**: `400` if `accessToken` is missing/empty, `500` on library error.

---

### `GET /organization-access-token`

Get an organization-level access token for the configured service account.

**Request body**: none.

**Response** `200`

```json
{ "accessToken": "...", "created_date": "2026-08-14T00:00:00.000Z" }
```

**Errors**: `500` on library error.

---

### `POST /refresh-access-token`

Refresh an expiring user access token.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `accessToken` | string | Yes |

```json
{ "accessToken": "eyJhbGciOi..." }
```

**Response** `200`

```json
{ "service_account_id": "...", "accessToken": "...", "created_date": "2026-08-14T00:00:00.000Z" }
```

**Errors**: `400` if `accessToken` is missing/empty, `500` on library error.

---

### `POST /logout-access-token`

Log out / revoke a user access token.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `accessToken` | string | Yes |

```json
{ "accessToken": "eyJhbGciOi..." }
```

**Response** `200`

```json
{ "accessToken": "...", "status": 0, "jwtId": "..." }
```

**Errors**: `400` if `accessToken` is missing/empty, `500` on library error.

---

### `POST /lookup-user-profile`

Look up a user's account profile by personal code.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `accessToken` | string | Yes |
| `personalCode` | string | Yes |

```json
{ "accessToken": "eyJhbGciOi...", "personalCode": "123456789" }
```

**Response** `200`

```json
{
  "camdigikey_id": "...",
  "account_token": "...",
  "expired_date": "2026-08-14T00:00:00.000Z",
  "surname_en": "...",
  "given_name_en": "...",
  "surname_kh": "...",
  "given_name_kh": "...",
  "gender": "...",
  "mobile_phone_number": "...",
  "email_address": "...",
  "nationality": "...",
  "personal_code": "..."
}
```

**Errors**: `400` if `accessToken` or `personalCode` is missing/empty, `500` on library error.

---

### `POST /verify-user-profile`

Verify an account token issued by the lookup flow.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `accountToken` | string | Yes |

```json
{ "accountToken": "..." }
```

**Response** `200`

```json
{
  "camdigikey_id": "...",
  "user_status": 1,
  "surname_en": "...",
  "given_name_en": "...",
  "surname_kh": "...",
  "given_name_kh": "...",
  "gender": "...",
  "mobile_phone_number": "...",
  "email_address": "...",
  "nationality": "...",
  "personal_code": "..."
}
```

`user_status` values: `0` DISABLED, `1` ENABLED, `2` EXPIRED, `4` DELETED.

**Errors**: `400` if `accountToken` is missing/empty, `500` on library error.

---

### `POST /user-face`

Retrieve the user's face image for a given access token.

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `accessToken` | string | Yes |

```json
{ "accessToken": "eyJhbGciOi..." }
```

**Response** `200`

```json
{ "face": "<base64-encoded image>" }
```

**Errors**: `400` if `accessToken` is missing/empty, `500` on library error.
