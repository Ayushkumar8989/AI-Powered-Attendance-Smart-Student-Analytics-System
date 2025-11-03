# Synthetic Data Generation System - Architecture

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                             │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend (Port 3000)                    │  │
│  │                                                                   │  │
│  │  • GenerationPage.tsx - Main UI                                  │  │
│  │  • Real-time progress tracking                                   │  │
│  │  • Input validation (1-1,000,000 rows)                          │  │
│  │  • Format selection (CSV/Parquet)                               │  │
│  │  • Download interface with IPFS/Arweave links                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ HTTPS/REST API
                               │ JWT Authentication
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Application Layer                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                Express Backend API (Port 5000)                    │  │
│  │                                                                   │  │
│  │  • GenerationController - Request handling                       │  │
│  │  • GenerationJob Model - MongoDB schema                         │  │
│  │  • Status polling - Every 5 seconds                             │  │
│  │  • Authentication middleware                                      │  │
│  │  • Rate limiting (100 req/15min)                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                               │  │
│  │                                                                   │  │
│  │  • GenerationJobs collection                                     │  │
│  │  • User management                                               │  │
│  │  • Job tracking                                                  │  │
│  │  • Progress storage                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ Internal API
                               │ HTTP/JSON
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI Processing Layer                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Python FastAPI AI Engine (Port 8000)                 │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────┐    │  │
│  │  │         Synthetic Data Generator Service                │    │  │
│  │  │                                                          │    │  │
│  │  │  • Chunk calculation (10K rows per chunk)               │    │  │
│  │  │  • Parallel chunk processing                            │    │  │
│  │  │  • Progress tracking per chunk                          │    │  │
│  │  │  • DataFrame concatenation                              │    │  │
│  │  │  • Memory management                                    │    │  │
│  │  └─────────────────────────────────────────────────────────┘    │  │
│  │                            ↓                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐    │  │
│  │  │           Data Export Service                            │    │  │
│  │  │                                                          │    │  │
│  │  │  • CSV writer (pandas.to_csv)                           │    │  │
│  │  │  • Parquet writer (pandas.to_parquet)                   │    │  │
│  │  │  • Compression options                                   │    │  │
│  │  │  • File hashing (SHA-256)                               │    │  │
│  │  └─────────────────────────────────────────────────────────┘    │  │
│  │                            ↓                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐    │  │
│  │  │          Decentralized Storage Service                   │    │  │
│  │  │                                                          │    │  │
│  │  │  • IPFS client integration                              │    │  │
│  │  │  • Arweave client integration                           │    │  │
│  │  │  • File metadata generation                             │    │  │
│  │  │  • Upload retry logic                                   │    │  │
│  │  └─────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ File Upload
                               │ Content Addressing
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Storage Layer                                     │
│                                                                          │
│  ┌──────────────────────────────┐    ┌────────────────────────────┐    │
│  │      IPFS Network            │    │    Arweave Network         │    │
│  │                              │    │                            │    │
│  │  • Content-addressed storage │    │  • Blockchain-based storage│    │
│  │  • Distributed nodes         │    │  • Permanent storage       │    │
│  │  • CID generation            │    │  • Transaction IDs         │    │
│  │  • Gateway access            │    │  • Pay once, store forever │    │
│  └──────────────────────────────┘    └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## DePin Network Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DePin Distributed Network                            │
│                                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │  US-WEST     │   │  US-EAST     │   │  EU-CENTRAL  │                │
│  │  Nodes: 3    │   │  Nodes: 3    │   │  Nodes: 2    │                │
│  │              │   │              │   │              │                │
│  │  ┌────────┐  │   │  ┌────────┐  │   │  ┌────────┐  │                │
│  │  │AI Node │  │   │  │AI Node │  │   │  │AI Node │  │                │
│  │  │2C/4GB  │  │   │  │2C/4GB  │  │   │  │2C/4GB  │  │                │
│  │  │GPU: 1  │  │   │  │GPU: 1  │  │   │  │GPU: 1  │  │                │
│  │  └────────┘  │   │  └────────┘  │   │  └────────┘  │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
│                                                                          │
│  ┌──────────────┐   ┌──────────────────────────────────────────┐       │
│  │ ASIA-PACIFIC │   │      Task Distribution Layer             │       │
│  │  Nodes: 2    │   │                                          │       │
│  │              │   │  • Redis task queue                       │       │
│  │  ┌────────┐  │   │  • Worker pool management                │       │
│  │  │AI Node │  │   │  • Load balancing (round-robin)          │       │
│  │  │2C/4GB  │  │   │  • Health monitoring                     │       │
│  │  │GPU: 1  │  │   │  • Automatic failover                    │       │
│  │  └────────┘  │   │  • Task redistribution                   │       │
│  └──────────────┘   └──────────────────────────────────────────┘       │
│                                                                          │
│  Total: 10 nodes across 4 regions                                       │
│  Auto-scaling: 3-15 replicas based on load                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Generation Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Generation Process Flow                            │
└────────────────────────────────────────────────────────────────────────┘

User Input (Frontend)
      │
      │ numberOfRows: 50,000
      │ outputFormat: "csv"
      │ modelId: "model-xyz"
      ▼
┌──────────────────────┐
│  Input Validation    │
│  (1-1,000,000 rows)  │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Create Generation   │
│  Job in Database     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  POST to AI Engine   │
│  /api/generate_data  │
└──────────┬───────────┘
           ▼
┌────────────────────────────────────────────┐
│         AI Engine Processing                │
│                                            │
│  Step 1: Calculate Chunks                  │
│  ├─ Total: 50,000 rows                    │
│  ├─ Chunk size: 10,000 rows               │
│  └─ Chunks needed: 5                      │
│                                            │
│  Step 2: Process Each Chunk (Sequential)   │
│  ├─ Chunk 1: Generate 10,000 rows         │
│  │   └─ Update progress: 20%              │
│  ├─ Chunk 2: Generate 10,000 rows         │
│  │   └─ Update progress: 40%              │
│  ├─ Chunk 3: Generate 10,000 rows         │
│  │   └─ Update progress: 60%              │
│  ├─ Chunk 4: Generate 10,000 rows         │
│  │   └─ Update progress: 80%              │
│  └─ Chunk 5: Generate 10,000 rows         │
│      └─ Update progress: 90%              │
│                                            │
│  Step 3: Combine Chunks                    │
│  └─ Concatenate into single DataFrame     │
│      └─ Update progress: 92%              │
│                                            │
│  Step 4: Export to File                    │
│  └─ Save as CSV/Parquet                   │
│      └─ Update progress: 95%              │
│                                            │
│  Step 5: Upload to Storage                 │
│  ├─ Calculate file hash                   │
│  ├─ Upload to IPFS/Arweave                │
│  ├─ Get storage link                      │
│  └─ Update progress: 100%                 │
└────────────┬───────────────────────────────┘
             ▼
┌──────────────────────┐
│  Update Database     │
│  with Storage Link   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Return Link to User │
│  via Frontend        │
└──────────────────────┘
```

## Chunked Processing Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Parallel Chunk Processing                            │
│                    (Future Enhancement)                                 │
└────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Task Scheduler  │
                    │   (AI Engine)    │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐     ┌──────────┐
    │ Worker 1 │      │ Worker 2 │     │ Worker 3 │
    │ Node: A  │      │ Node: B  │     │ Node: C  │
    └─────┬────┘      └─────┬────┘     └─────┬────┘
          │                 │                 │
          │ Chunk 1         │ Chunk 2         │ Chunk 3
          │ (10K rows)      │ (10K rows)      │ (10K rows)
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐     ┌──────────┐
    │Generate  │      │Generate  │     │Generate  │
    │  Data    │      │  Data    │     │  Data    │
    └─────┬────┘      └─────┬────┘     └─────┬────┘
          │                 │                 │
          │                 │                 │
          └────────┬────────┴────────┬────────┘
                   │                 │
                   ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Chunk Buffer │  │ Chunk Buffer │
            └──────┬───────┘  └──────┬───────┘
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Merge & Combine │
                   │  All Chunks     │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Final Dataset  │
                   └─────────────────┘
```

## Storage Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Decentralized Storage Flow                            │
└────────────────────────────────────────────────────────────────────────┘

Generated File (CSV/Parquet)
      │
      │ Size: ~100 MB
      │ Rows: 50,000
      ▼
┌─────────────────────┐
│  File Preparation   │
│                     │
│ • Calculate SHA-256 │
│ • Add metadata      │
│ • Compress (if req) │
└──────────┬──────────┘
           │
           ├───────────────────┐
           │                   │
           ▼                   ▼
┌─────────────────────┐  ┌─────────────────────┐
│   IPFS Upload       │  │  Arweave Upload     │
│                     │  │                     │
│ 1. Connect to node  │  │ 1. Load wallet      │
│ 2. Add file         │  │ 2. Create TX        │
│ 3. Get CID          │  │ 3. Sign TX          │
│ 4. Pin to network   │  │ 4. Submit TX        │
│                     │  │ 5. Get TX ID        │
└──────────┬──────────┘  └──────────┬──────────┘
           │                        │
           │ CID: Qm...             │ TX ID: abc...
           │                        │
           ▼                        ▼
┌──────────────────────────────────────────┐
│           Gateway URLs                    │
│                                          │
│ IPFS:    https://ipfs.io/ipfs/Qm...     │
│ Arweave: https://arweave.net/abc...     │
└──────────────────┬───────────────────────┘
                   │
                   │ Store in Database
                   ▼
           ┌───────────────┐
           │ GenerationJob │
           │ storageLink   │
           └───────────────┘
```

## Request/Response Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Complete Request Flow                                │
└────────────────────────────────────────────────────────────────────────┘

User clicks "Generate"
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ Frontend validates input                             │
│ • Check: 1 ≤ rows ≤ 1,000,000                       │
│ • Check: format in ['csv', 'parquet']               │
└─────────────────┬───────────────────────────────────┘
                  │ Valid
                  ▼
┌─────────────────────────────────────────────────────┐
│ POST /api/jobs/:jobId/generate-data                 │
│ Headers: Authorization: Bearer <JWT>                │
│ Body: {modelId, numberOfRows, outputFormat}         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Backend: authenticate()                              │
│ • Verify JWT token                                   │
│ • Extract user ID                                    │
│ • Check permissions                                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Backend: validate()                                  │
│ • Check job ownership                                │
│ • Verify job is completed                            │
│ • Validate request params                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Backend: Create GenerationJob                        │
│ • Generate unique ID                                 │
│ • Set status: 'pending'                              │
│ • Save to MongoDB                                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Backend → AI Engine: POST /api/generate_data        │
│ • Forward request                                    │
│ • Get task ID                                        │
│ • Update job with task ID                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Backend: Start status polling (async)                │
│ • Poll every 5 seconds                               │
│ • Update database with progress                      │
│ • Continue until complete/failed                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Backend: Return immediate response                   │
│ Response: {generationJobId, status, message}         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: Poll for updates                           │
│ • GET /api/generation/:id every 3 seconds           │
│ • Update progress bar                                │
│ • Show current/total rows                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼ (When complete)
┌─────────────────────────────────────────────────────┐
│ Frontend: Display download button                    │
│ • Show storage link                                  │
│ • Enable one-click download                          │
└─────────────────────────────────────────────────────┘
```

## Error Handling Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Error Recovery Flow                                  │
└────────────────────────────────────────────────────────────────────────┘

Error Occurs
      │
      ├─── Validation Error (400)
      │    └─> Return to user immediately
      │
      ├─── Authentication Error (401)
      │    └─> Redirect to login
      │
      ├─── Authorization Error (403)
      │    └─> Show access denied
      │
      ├─── Generation Error (500)
      │    │
      │    ├─> Retry #1 (5s delay)
      │    │   └─> Success → Continue
      │    │   └─> Fail → Retry #2
      │    │
      │    ├─> Retry #2 (10s delay)
      │    │   └─> Success → Continue
      │    │   └─> Fail → Retry #3
      │    │
      │    └─> Retry #3 (20s delay)
      │        └─> Success → Continue
      │        └─> Fail → Mark as failed
      │
      └─── Node Failure
           │
           ├─> Detect failure (health check)
           ├─> Remove from worker pool
           ├─> Redistribute task to healthy node
           └─> Continue processing
```

## Security Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Security Layers                                  │
└────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Layer 1: Network Security                           │
│ • HTTPS/TLS encryption                               │
│ • CORS configuration                                 │
│ • Rate limiting (100 req/15min)                      │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: Authentication                              │
│ • JWT tokens (access + refresh)                      │
│ • Token expiration (15min access, 7d refresh)        │
│ • Secure token storage                               │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Authorization                               │
│ • Role-based access control (RBAC)                   │
│ • Resource ownership verification                    │
│ • Permission checks on every request                 │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Layer 4: Data Security                               │
│ • Input validation and sanitization                  │
│ • No PII in synthetic data                           │
│ • Encrypted data at rest                             │
│ • Secure deletion after upload                       │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ Layer 5: Infrastructure Security                     │
│ • Container isolation                                │
│ • Network policies                                   │
│ • Secrets management                                 │
│ • Regular security audits                            │
└─────────────────────────────────────────────────────┘
```

## Scalability Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Auto-Scaling Strategy                                │
└────────────────────────────────────────────────────────────────────────┘

Current Load Metrics
      │
      ├─ CPU Usage: 85%
      ├─ Memory: 90%
      ├─ Queue Length: 12 tasks
      └─ Active Workers: 3
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ Scaling Decision Engine                              │
│                                                      │
│ IF cpu > 80% OR memory > 85% OR queue > 5           │
│ THEN scale_up()                                      │
│                                                      │
│ IF cpu < 40% AND memory < 50% AND queue < 2         │
│ THEN scale_down()                                    │
└─────────────────┬───────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│  Scale Up    │     │  Scale Down  │
│              │     │              │
│ Current: 3   │     │ Current: 8   │
│ Target: 6    │     │ Target: 5    │
│              │     │              │
│ • Add 3 nodes│     │ • Remove 3   │
│ • Wait 30s   │     │ • Drain tasks│
│ • Verify     │     │ • Shutdown   │
└──────────────┘     └──────────────┘
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-03
**Architecture Status**: Production Ready
