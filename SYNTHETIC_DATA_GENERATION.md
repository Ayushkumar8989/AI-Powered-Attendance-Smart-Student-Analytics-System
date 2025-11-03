# Synthetic Data Generation System - Implementation Guide

## Overview

This document provides a complete implementation guide for the synthetic data generation system using decentralized compute infrastructure. The system enables users to generate large-scale synthetic datasets with chunked processing, decentralized storage, and distributed compute across DePin networks.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│              Generation UI + Progress Tracking                   │
│                         Port: 3000                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js)                         │
│           Job Management + Status Polling                        │
│                         Port: 5000                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AI Engine (Python FastAPI)                      │
│     Chunked Generation + Decentralized Storage Upload           │
│                         Port: 8000                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               Decentralized Storage (IPFS/Arweave)              │
│            Permanent Data Storage with Content IDs               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. AI Engine (Python FastAPI)

#### Key Files Created

- **`app/schemas/data_generation_v2.py`**: Pydantic schemas for request/response validation
- **`app/services/storage_service.py`**: Decentralized storage integration (IPFS/Arweave)
- **`app/services/synthetic_data_generator.py`**: Core generation logic with chunking
- **`app/api/generate_data.py`**: REST API endpoints

#### Core Features

**Chunked Processing**
- Data is generated in chunks of 10,000 rows for optimal performance
- Each chunk is processed independently to enable parallelization
- Progress tracking at chunk level for real-time updates

**Storage Integration**
```python
# IPFS Upload (Production ready)
storage_link = storage_service.upload_to_ipfs(file_path)
# Returns: https://ipfs.io/ipfs/Qm...

# Arweave Upload (Production ready)
storage_link = storage_service.upload_to_arweave(file_path)
# Returns: https://arweave.net/...
```

**API Endpoints**

**POST `/api/generate_data`**
```json
{
  "modelId": "m7n8o9p0-q1r2-s3t4-u5v6-w7x8y9z0a1b2",
  "numberOfRows": 50000,
  "outputFormat": "csv",
  "jobId": "job-123456"
}

Response:
{
  "status": "success",
  "taskId": "f7b3c9d2-4e8a-4c9d-b1f3-9a8e7c6d5b4a",
  "message": "Generation started for 50000 rows",
  "estimatedTime": 25
}
```

**GET `/api/generation_status/{task_id}`**
```json
{
  "taskId": "f7b3c9d2-4e8a-4c9d-b1f3-9a8e7c6d5b4a",
  "status": "processing",
  "progress": 65.5,
  "currentRows": 32750,
  "totalRows": 50000,
  "storageLink": null,
  "outputFormat": "csv"
}
```

#### Generation Process Flow

1. **Initialization** (Progress: 0-5%)
   - Validate request parameters
   - Create task record
   - Estimate completion time

2. **Chunk Processing** (Progress: 5-75%)
   - Calculate number of chunks needed
   - Generate each chunk sequentially
   - Update progress after each chunk
   - Combine all chunks into single DataFrame

3. **File Export** (Progress: 75-80%)
   - Save data to CSV or Parquet format
   - Apply compression where applicable

4. **Storage Upload** (Progress: 80-95%)
   - Calculate file hash
   - Upload to IPFS or Arweave
   - Retrieve permanent storage link

5. **Completion** (Progress: 95-100%)
   - Store metadata
   - Mark task as completed
   - Return storage link to user

### 2. Backend API (Node.js/Express)

#### Key Files Created

- **`src/models/GenerationJob.model.ts`**: MongoDB schema for generation jobs
- **`src/controllers/generation.controller.ts`**: Request handlers
- **`src/routes/generation.routes.ts`**: API route definitions
- **`src/services/ai-engine.service.ts`**: (Updated) AI Engine client

#### Database Schema

```typescript
interface IGenerationJob {
  generationJobId: string;        // Unique identifier
  jobId: ObjectId;                // Reference to training job
  userId: ObjectId;               // User who created job
  modelId: string;                // Model used for generation
  numberOfRows: number;           // Target row count (1-1,000,000)
  outputFormat: 'csv' | 'parquet';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;               // 0-100
  currentRows?: number;           // Rows generated so far
  storageLink?: string;           // IPFS/Arweave URL
  storageType: 'ipfs' | 'arweave';
  taskId?: string;                // AI Engine task ID
  estimatedTime?: number;         // Seconds
  fileSize?: number;              // MB
  errorMessage?: string;
  metadata?: {
    chunkSize?: number;
    chunksProcessed?: number;
    totalChunks?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

#### API Endpoints

**POST `/api/jobs/:jobId/generate-data`**
- Creates a new generation job
- Validates numberOfRows (1-1,000,000)
- Starts async generation process
- Returns job ID immediately

**GET `/api/generation/:generationJobId`**
- Retrieves generation job status
- Includes real-time progress updates
- Returns storage link when complete

**GET `/api/generation`**
- Lists all generation jobs for authenticated user
- Supports pagination
- Sorted by creation date

#### Status Polling

The backend polls the AI Engine every 5 seconds to update job status:

```typescript
private async pollGenerationStatus(generationJobId: string, taskId: string) {
  const maxPolls = 720;           // 1 hour maximum
  const pollInterval = 5000;       // 5 seconds

  while (pollCount < maxPolls) {
    const status = await aiEngineService.getGenerationStatus(taskId);

    await GenerationJob.findOneAndUpdate(
      { generationJobId },
      {
        progress: status.progress,
        currentRows: status.currentRows,
        storageLink: status.storageLink,
        status: status.status
      }
    );

    if (status.status === 'completed' || status.status === 'failed') {
      break;
    }

    await delay(pollInterval);
  }
}
```

### 3. Frontend (React + TypeScript)

#### Key Files Created

- **`src/services/generation.service.ts`**: API client for generation endpoints
- **`src/pages/GenerationPage.tsx`**: Main generation UI component
- **`src/App.tsx`**: (Updated) Added generation route

#### User Interface Features

**Generation Configuration**
- Number of rows input with validation (1-1,000,000)
- Output format selection (CSV/Parquet)
- Visual format cards with icons
- Real-time validation feedback

**Progress Tracking**
- Live progress bar with percentage
- Current/total row count display
- Status indicators (queued, processing, completed, failed)
- Estimated time remaining
- Auto-refresh every 3 seconds during processing

**Download Interface**
- Prominent download button when complete
- IPFS/Arweave link display
- File size information
- One-click download to browser

**Error Handling**
- Clear error messages for validation failures
- Retry functionality on generation failure
- Network error recovery

#### Key UI Components

```tsx
// Number of rows input with validation
<Input
  type="number"
  min="1"
  max="1000000"
  value={numberOfRows}
  onChange={handleNumberOfRowsChange}
/>

// Output format selection
<button
  onClick={() => setOutputFormat('csv')}
  className={outputFormat === 'csv' ? 'selected' : ''}
>
  CSV Format
</button>

// Progress display
<div className="progress-bar">
  <div style={{ width: `${progress}%` }} />
</div>
<p>{currentRows.toLocaleString()} of {totalRows.toLocaleString()} rows</p>

// Download button
<Button onClick={() => window.open(storageLink, '_blank')}>
  <Download /> Download Synthetic Dataset
</Button>
```

### 4. NodeOps Configuration (Distributed Compute)

#### Updated Configuration

**AI Engine Service Enhancements**
```yaml
ai-engine:
  replicas: 3                    # Increased from 2
  resources:
    cpu: 2000m
    memory: 4Gi
    gpu: 1
  volumes:
    - name: generated-data       # New volume for outputs
      mountPath: /tmp/generated_data
      size: 100Gi
  autoscaling:
    minReplicas: 3               # Increased from 2
    maxReplicas: 15              # Increased from 8
  distributedCompute:
    enabled: true
    taskQueue: redis
    workerPool:
      minWorkers: 3
      maxWorkers: 20
      scaleUpThreshold: 5
      scaleDownThreshold: 1
    chunkProcessing:
      enabled: true
      maxChunkSize: 10000
      parallelChunks: 5
    failover:
      enabled: true
      maxRetries: 3
      redistributeOnFailure: true
```

**DePin Network Configuration**
```yaml
depin:
  nodes:
    preferred:
      - region: us-west
        count: 3
      - region: us-east
        count: 3
      - region: eu-central
        count: 2
      - region: asia-pacific
        count: 2

  tasks:
    - name: synthetic-data-generation
      type: compute-intensive
      priority: high
      resources:
        cpu: 2
        memory: 4Gi
        storage: 10Gi
      scheduling:
        strategy: distributed
        maxNodesPerTask: 5
        preferGPU: true
      execution:
        timeout: 3600
        retryPolicy:
          maxAttempts: 3
          backoff: exponential
        checkpointing:
          enabled: true
          interval: 300
      dataDistribution:
        sharding: automatic
        replication: 2
        consistency: eventual
```

## Security & Authentication

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all generation endpoints
- Prevents abuse and ensures fair resource allocation

### Authentication
- JWT token required for all operations
- Token includes user ID and role
- Automatic token refresh on expiration

### Access Control
- Users can only access their own generation jobs
- Job ownership verified on every request
- Unauthorized access returns 403 Forbidden

### Data Privacy
- Synthetic data contains no real PII
- Generated data is privacy-preserving by design
- No sensitive information stored in decentralized storage

## Production Deployment Guide

### Prerequisites

1. **Install dependencies**
```bash
# Backend
cd backend && npm install

# AI Engine
cd ai-engine && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

2. **Configure environment variables**
```bash
# Backend .env
MONGODB_URI=mongodb://mongodb:27017/deai_synthetic_data
JWT_ACCESS_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
AI_ENGINE_URL=http://ai-engine:8000

# Frontend .env
VITE_API_URL=http://localhost:5000
```

### Deployment Steps

#### Option 1: Docker Compose
```bash
# Build and start all services
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f ai-engine
```

#### Option 2: NodeOps (DePin Network)
```bash
# Validate configuration
nodeops validate -f nodeops.yaml

# Deploy to DePin network
nodeops deploy -f nodeops.yaml

# Monitor deployment
nodeops status deai-synthetic-data-generator

# View logs
nodeops logs deai-synthetic-data-generator --service=ai-engine

# Scale services
nodeops scale deai-synthetic-data-generator --service=ai-engine --replicas=10
```

### Production Integrations

#### IPFS Integration (Production)

**Option 1: Web3.Storage**
```python
from web3storage import Web3Storage

client = Web3Storage(token='your-api-token')
cid = client.upload_file(file_path)
ipfs_link = f"https://w3s.link/ipfs/{cid}"
```

**Option 2: Pinata**
```python
import requests

def upload_to_pinata(file_path):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": "your-api-key",
        "pinata_secret_api_key": "your-secret-key"
    }
    with open(file_path, 'rb') as f:
        response = requests.post(url, files={'file': f}, headers=headers)
    return f"https://gateway.pinata.cloud/ipfs/{response.json()['IpfsHash']}"
```

**Option 3: Local IPFS Node**
```python
import ipfshttpclient

client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
result = client.add(file_path)
return f"https://ipfs.io/ipfs/{result['Hash']}"
```

#### Arweave Integration (Production)

```python
from arweave import Wallet, Transaction, ArweaveClient

wallet = Wallet('path/to/wallet.json')
client = ArweaveClient()

with open(file_path, 'rb') as f:
    data = f.read()

tx = Transaction(wallet, data=data)
tx.add_tag('Content-Type', 'text/csv')
tx.add_tag('App-Name', 'DeAI-Synthetic-Data')
tx.sign()
tx.send()

return f"https://arweave.net/{tx.id}"
```

## Performance Optimization

### Chunking Strategy

**Optimal chunk sizes by dataset size:**
- Small (< 10K rows): 5,000 rows/chunk
- Medium (10K-100K): 10,000 rows/chunk
- Large (100K-500K): 25,000 rows/chunk
- Very Large (> 500K): 50,000 rows/chunk

### Parallel Processing

Enable parallel chunk generation across multiple nodes:
```python
# Configure in nodeops.yaml
chunkProcessing:
  enabled: true
  maxChunkSize: 10000
  parallelChunks: 5  # Process 5 chunks simultaneously
```

### Resource Allocation

**CPU/Memory by dataset size:**
- < 50K rows: 1 CPU, 2GB RAM
- 50K-200K rows: 2 CPU, 4GB RAM
- 200K-500K rows: 4 CPU, 8GB RAM
- > 500K rows: 8 CPU, 16GB RAM

## Monitoring & Observability

### Key Metrics

**Generation Performance**
- Rows per second: Target 10,000 rows/sec
- Chunk processing time: < 5 seconds per 10K rows
- Total generation time: < 60 seconds per 100K rows

**Storage Metrics**
- IPFS upload time: < 10 seconds per 100MB
- Arweave upload time: < 30 seconds per 100MB
- Storage availability: 99.9% uptime

**System Health**
- API response time: < 500ms p95
- Task queue length: < 10 pending tasks
- Worker utilization: 60-80% optimal

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:5000/api/health

# AI Engine health
curl http://localhost:8000/api/health

# Generation service status
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/generation/<generationJobId>
```

## Error Handling & Recovery

### Common Errors

**Validation Errors (400)**
- Invalid numberOfRows (outside 1-1,000,000)
- Missing required parameters
- Invalid output format

**Authorization Errors (401/403)**
- Missing or expired JWT token
- Unauthorized access to job

**Generation Errors (500)**
- Model loading failure
- Insufficient memory
- Storage upload failure

### Automatic Recovery

**Retry Policy**
```yaml
retryPolicy:
  maxAttempts: 3
  backoff: exponential
  initialDelay: 5s
  maxDelay: 60s
```

**Checkpointing**
- Generation state saved every 5 minutes
- Resume from last checkpoint on failure
- Prevents data loss during long-running jobs

**Node Failover**
- Automatic task redistribution
- Health monitoring every 30 seconds
- Failed nodes removed from pool

## Cost Estimation

### Compute Costs (DePin Network)

**Generation costs by size:**
- 10K rows: ~$0.01 (2 seconds)
- 100K rows: ~$0.10 (20 seconds)
- 1M rows: ~$1.00 (3-5 minutes)

### Storage Costs

**IPFS (Pinning Services):**
- Web3.Storage: Free up to 5GB
- Pinata: $20/month for 1GB
- Filebase: $5/TB/month

**Arweave (Permanent Storage):**
- ~$5 per GB (one-time)
- Permanent storage guarantee
- No recurring fees

## Testing Guide

### Unit Tests

```bash
# Backend tests
cd backend && npm test

# AI Engine tests
cd ai-engine && pytest

# Frontend tests
cd frontend && npm test
```

### Integration Tests

```bash
# Test generation workflow
curl -X POST http://localhost:5000/api/jobs/test-job-id/generate-data \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "test-model",
    "numberOfRows": 1000,
    "outputFormat": "csv"
  }'

# Check status
curl http://localhost:5000/api/generation/<generationJobId> \
  -H "Authorization: Bearer <token>"
```

### Load Testing

```bash
# Generate 100 concurrent requests
ab -n 100 -c 10 \
  -H "Authorization: Bearer <token>" \
  -T "application/json" \
  -p generation-request.json \
  http://localhost:5000/api/jobs/test-job-id/generate-data
```

## Best Practices

### For Users

1. **Start Small**: Test with 10K rows before scaling to 1M
2. **Choose Format Wisely**: Use Parquet for large datasets (better compression)
3. **Monitor Progress**: Watch real-time updates during generation
4. **Save Links**: IPFS/Arweave links are permanent but should be backed up

### For Developers

1. **Validate Early**: Check input parameters before starting generation
2. **Log Everything**: Comprehensive logging for debugging
3. **Handle Failures Gracefully**: Implement retry logic and user notifications
4. **Optimize Chunks**: Tune chunk size based on dataset characteristics
5. **Monitor Resources**: Track CPU, memory, and storage usage

## Troubleshooting

### Generation Stuck at 0%
- Check AI Engine logs: `docker-compose logs ai-engine`
- Verify AI Engine connectivity from backend
- Restart AI Engine service

### Storage Upload Fails
- Check network connectivity to IPFS/Arweave
- Verify file permissions on generated data
- Check available disk space

### High Memory Usage
- Reduce chunk size in configuration
- Increase available memory for AI Engine
- Enable garbage collection between chunks

## Future Enhancements

1. **Multi-Model Support**: Allow users to select from multiple generation models
2. **Custom Schemas**: User-defined data schemas and distributions
3. **Quality Metrics**: Automatic quality assessment of generated data
4. **Batch Generation**: Generate multiple datasets in parallel
5. **Data Validation**: Post-generation validation and quality checks
6. **Export Formats**: Support for JSON, XML, SQL dumps
7. **Scheduled Generation**: Cron-based recurring generation jobs
8. **Collaboration**: Share generation jobs with team members

## Support & Resources

- **Documentation**: `/docs` directory
- **API Reference**: `/docs/API.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: DePin Network Discord

---

**Version**: 1.0.0
**Last Updated**: 2025-11-03
**License**: MIT
