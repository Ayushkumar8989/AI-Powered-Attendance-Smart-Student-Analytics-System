# API Documentation

## Base URLs

- **Backend API**: `http://localhost:5000/api`
- **AI Engine API**: `http://localhost:8000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Tokens are obtained through the login endpoint and must be refreshed using the refresh token before expiration.

## Backend API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "developer"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "developer",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login

Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "developer",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/refresh-token

Refresh an expired access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "developer",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /api/auth/logout

Logout and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### GET /api/health

Check backend service health.

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## AI Engine API Endpoints

### Data Generation

#### POST /api/data-generation/generate

Generate synthetic data.

**Request Body:**
```json
{
  "data_type": "tabular",
  "num_samples": 1000,
  "schema_config": {
    "columns": ["age", "income", "credit_score"],
    "dtypes": ["int", "float", "int"]
  },
  "model_params": {
    "noise_level": 0.1
  }
}
```

**Parameters:**
- `data_type` (string, required): Type of data - `"tabular"`, `"text"`, or `"time_series"`
- `num_samples` (integer, required): Number of samples (1-10000)
- `schema_config` (object, optional): Configuration for data schema
- `model_params` (object, optional): Model-specific parameters

**Response:** `200 OK`
```json
{
  "status": "success",
  "task_id": "f7b3c9d2-4e8a-4c9d-b1f3-9a8e7c6d5b4a",
  "message": "Generated 1000 samples successfully",
  "num_samples": 1000
}
```

#### GET /api/data-generation/task/{task_id}

Check generation task status and retrieve results.

**Response:** `200 OK`
```json
{
  "task_id": "f7b3c9d2-4e8a-4c9d-b1f3-9a8e7c6d5b4a",
  "status": "completed",
  "progress": 100.0,
  "result": {
    "format": "tabular",
    "columns": ["age", "income", "credit_score"],
    "data": [
      {"age": 25, "income": 45000.5, "credit_score": 720},
      {"age": 32, "income": 62000.3, "credit_score": 680}
    ],
    "shape": [1000, 3]
  }
}
```

**Status Values:**
- `pending`: Task queued
- `processing`: Task in progress
- `completed`: Task finished successfully
- `failed`: Task failed with error

### Model Training

#### POST /api/models/train

Train a new model.

**Request Body:**
```json
{
  "model_type": "synthetic_gan",
  "dataset_config": {
    "features": 10,
    "samples": 5000
  },
  "hyperparameters": {
    "learning_rate": 0.001,
    "batch_size": 32
  },
  "epochs": 20
}
```

**Parameters:**
- `model_type` (string, required): Type of model to train
- `dataset_path` (string, optional): Path to training dataset
- `dataset_config` (object, optional): Dataset configuration
- `hyperparameters` (object, optional): Model hyperparameters
- `epochs` (integer, optional): Training epochs (1-100, default: 10)

**Response:** `200 OK`
```json
{
  "status": "success",
  "task_id": "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
  "message": "Model training completed successfully",
  "model_id": "m7n8o9p0-q1r2-s3t4-u5v6-w7x8y9z0a1b2"
}
```

#### GET /api/models/{model_id}

Get information about a trained model.

**Response:** `200 OK`
```json
{
  "model_id": "m7n8o9p0-q1r2-s3t4-u5v6-w7x8y9z0a1b2",
  "model_type": "synthetic_gan",
  "created_at": "2024-01-15T10:30:00.000Z",
  "metrics": {
    "accuracy": 0.8542,
    "loss": 0.2341,
    "val_accuracy": 0.8321,
    "val_loss": 0.2789,
    "epochs_completed": 20
  },
  "status": "trained"
}
```

#### GET /api/models/

List all trained models.

**Response:** `200 OK`
```json
[
  {
    "model_id": "m7n8o9p0-q1r2-s3t4-u5v6-w7x8y9z0a1b2",
    "model_type": "synthetic_gan",
    "created_at": "2024-01-15T10:30:00.000Z",
    "metrics": {
      "accuracy": 0.8542,
      "loss": 0.2341
    },
    "status": "trained"
  }
]
```

#### GET /api/health

Check AI engine service health.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "environment": "production"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting:
- **Limit**: 100 requests per 15 minutes per IP address
- **Header**: `X-RateLimit-Remaining` shows remaining requests
- **Response**: 429 Too Many Requests when limit exceeded

## Authentication Flow

1. **Register/Login**: Obtain access and refresh tokens
2. **API Requests**: Include access token in Authorization header
3. **Token Refresh**: When access token expires (15 min), use refresh token
4. **Logout**: Invalidate refresh token

## Best Practices

1. **Store tokens securely**: Use httpOnly cookies or secure storage
2. **Refresh tokens proactively**: Before access token expires
3. **Handle errors gracefully**: Implement retry logic for network errors
4. **Validate inputs**: Check data before sending to API
5. **Monitor rate limits**: Track remaining requests in headers
