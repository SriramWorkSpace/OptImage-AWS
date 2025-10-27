# OptImage - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Next.js Frontend                         │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │   Home   │  │  Upload  │  │ Gallery  │              │  │
│  │  │   Page   │  │   Page   │  │   Page   │              │  │
│  │  └──────────┘  └──────────┘  └──────────┘              │  │
│  │                      │                                    │  │
│  │                      ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │         API Routes (Server-Side)                 │    │  │
│  │  │  • /api/presign      • /api/list-images         │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └───────────────────────┬──────────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Gateway                           │   │
│  │  https://q8b715g1b0.execute-api.ap-south-1....          │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Presigner Lambda (Python 3.12)                │   │
│  │  • Generates presigned S3 PUT URLs                       │   │
│  │  • Returns URL to frontend                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  S3 Bucket                                │  │
│  │         image-resizer-demo-sriram                         │  │
│  │                                                           │  │
│  │  ┌──────────────┐         ┌────────────────┐            │  │
│  │  │   uploads/   │────────▶│   resized/     │            │  │
│  │  │  (originals) │         │  • thumb_*     │            │  │
│  │  │              │         │  • medium_*    │            │  │
│  │  │              │         │  • large_*     │            │  │
│  │  └──────────────┘         └────────────────┘            │  │
│  │         │                                                │  │
│  │         │ S3 Event Trigger                              │  │
│  │         │ (ObjectCreated)                               │  │
│  │         ▼                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Resizer Lambda (Python 3.12)                   │  │
│  │  • Triggered by new uploads                               │  │
│  │  • Uses Pillow to resize images                           │  │
│  │  • Creates 3 versions (100px, 500px, 1000px)             │  │
│  │  • Saves to resized/ folder                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  CloudWatch Logs                          │  │
│  │  • Lambda execution logs                                  │  │
│  │  • Error tracking                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Upload Flow Diagram

```
User Action                Frontend                API Gateway           AWS Lambda              S3 Bucket
    │                         │                         │                     │                      │
    │ 1. Select Image         │                         │                     │                      │
    ├────────────────────────▶│                         │                     │                      │
    │                         │                         │                     │                      │
    │                         │ 2. GET /api/presign?    │                     │                      │
    │                         │    filename=image.jpg   │                     │                      │
    │                         ├────────────────────────▶│                     │                      │
    │                         │                         │                     │                      │
    │                         │                         │ 3. Invoke Presigner │                      │
    │                         │                         ├────────────────────▶│                      │
    │                         │                         │                     │                      │
    │                         │                         │ 4. Generate URL     │                      │
    │                         │                         │    with signature   │                      │
    │                         │                         │◀────────────────────┤                      │
    │                         │                         │                     │                      │
    │                         │ 5. Return Presigned URL │                     │                      │
    │                         │◀────────────────────────┤                     │                      │
    │                         │                         │                     │                      │
    │ 6. Display preview      │                         │                     │                      │
    │◀────────────────────────┤                         │                     │                      │
    │                         │                         │                     │                      │
    │ 7. Click Upload         │                         │                     │                      │
    ├────────────────────────▶│                         │                     │                      │
    │                         │                         │                     │                      │
    │                         │ 8. PUT image directly to presigned URL                               │
    │                         ├─────────────────────────────────────────────────────────────────────▶│
    │                         │                         │                     │                      │
    │                         │                         │                     │ 9. S3 Event Trigger  │
    │                         │                         │                     │    (ObjectCreated)   │
    │                         │                         │                     │◀─────────────────────┤
    │                         │                         │                     │                      │
    │                         │                         │                     │ 10. Lambda reads     │
    │                         │                         │                     │     original image   │
    │                         │                         │                     ├─────────────────────▶│
    │                         │                         │                     │                      │
    │                         │                         │                     │ 11. Resize to        │
    │                         │                         │                     │     3 versions       │
    │                         │                         │                     │     using Pillow     │
    │                         │                         │                     │                      │
    │                         │                         │                     │ 12. Save resized     │
    │                         │                         │                     │     images           │
    │                         │                         │                     ├─────────────────────▶│
    │                         │                         │                     │                      │
    │ 13. Show success        │                         │                     │                      │
    │◀────────────────────────┤                         │                     │                      │
    │                         │                         │                     │                      │
    │ 14. View in Gallery     │                         │                     │                      │
    ├────────────────────────▶│                         │                     │                      │
    │                         │                         │                     │                      │

Final Result:
    uploads/image.jpg           → Original (e.g., 2MB)
    resized/thumb_image.jpg     → 100x100px (~20KB)
    resized/medium_image.jpg    → 500x500px (~200KB)
    resized/large_image.jpg     → 1000x1000px (~500KB)
```

## Component Hierarchy

```
App (layout.tsx)
│
├── Navigation
│   ├── Logo (with ImageIcon)
│   └── Nav Links
│       ├── Home
│       ├── Upload
│       └── Gallery
│
└── Page Router
    │
    ├── Homepage (/)
    │   ├── Hero Section
    │   │   ├── Badge (AWS Serverless)
    │   │   ├── Heading
    │   │   ├── Description
    │   │   └── CTA Buttons
    │   ├── Features Grid
    │   │   ├── Feature Card (Upload)
    │   │   ├── Feature Card (Resize)
    │   │   └── Feature Card (Gallery)
    │   └── Tech Stack Footer
    │
    ├── Upload Page (/upload)
    │   ├── Page Header
    │   ├── Upload Zone
    │   │   ├── Drag & Drop Area
    │   │   ├── File Input (hidden)
    │   │   └── Image Preview
    │   ├── Upload Button
    │   ├── Status Messages
    │   │   ├── Success Alert
    │   │   └── Error Alert
    │   └── Info Cards
    │       ├── Thumbnail Size
    │       ├── Medium Size
    │       └── Large Size
    │
    └── Gallery Page (/gallery)
        ├── Page Header
        ├── Filter Bar
        │   ├── All Button
        │   ├── Thumbnails Button
        │   ├── Medium Button
        │   ├── Large Button
        │   └── Refresh Button
        ├── Loading State
        ├── Error State
        ├── Empty State
        └── Image Grid
            └── Image Card (repeated)
                ├── Image Preview
                ├── File Name
                ├── Size Badge
                ├── Size Label
                └── Download Button
```

## Data Flow

```
Frontend State Management
┌──────────────────────────────────────┐
│ Upload Page State                    │
├──────────────────────────────────────┤
│ • file: File | null                  │
│ • preview: string | null             │
│ • uploading: boolean                 │
│ • success: boolean                   │
│ • error: string | null               │
│ • isDragging: boolean                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Gallery Page State                   │
├──────────────────────────────────────┤
│ • images: ImageItem[]                │
│ • loading: boolean                   │
│ • error: string | null               │
│ • filter: 'all' | 'thumb' | etc.     │
└──────────────────────────────────────┘

API Communication
┌──────────────────────────────────────┐
│ /api/presign                         │
├──────────────────────────────────────┤
│ Input:  filename (query param)       │
│ Output: { url: string }              │
│ Method: GET                          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ /api/list-images (optional)          │
├──────────────────────────────────────┤
│ Input:  none                         │
│ Output: { images: ImageItem[] }      │
│ Method: GET                          │
└──────────────────────────────────────┘
```

## File Size Journey

```
Original Upload: 2MB JPEG (3000x2000px)
                    │
                    │ Upload to S3 (uploads/)
                    ▼
┌───────────────────────────────────────┐
│     uploads/vacation-photo.jpg        │
│              2MB                      │
└───────────────────────────────────────┘
                    │
                    │ Lambda Triggered
                    ▼
        ┌───────────────────────┐
        │   Resizer Lambda       │
        │   (Pillow Library)     │
        └───────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Thumb   │  │ Medium  │  │  Large  │
│ 100x100 │  │ 500x500 │  │1000x1000│
│  ~20KB  │  │ ~200KB  │  │ ~500KB  │
└─────────┘  └─────────┘  └─────────┘
     │            │            │
     └────────────┼────────────┘
                  ▼
┌───────────────────────────────────────┐
│          resized/ folder              │
│  • thumb_vacation-photo.jpg   20KB    │
│  • medium_vacation-photo.jpg  200KB   │
│  • large_vacation-photo.jpg   500KB   │
└───────────────────────────────────────┘
                  │
                  │ Gallery fetches
                  ▼
        [ User's Browser Gallery ]
```

## Technology Stack Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  • Next.js Pages                        │
│  • React Components                     │
│  • TailwindCSS Styling                  │
│  • Lucide Icons                         │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Application Layer               │
│  • Next.js API Routes                   │
│  • TypeScript Logic                     │
│  • State Management (useState)          │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Integration Layer               │
│  • AWS API Gateway Client               │
│  • S3 Presigned URL Upload              │
│  • AWS SDK (optional, for gallery)      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         AWS Services Layer              │
│  • API Gateway                          │
│  • Lambda Functions                     │
│  • S3 Storage                           │
│  • CloudWatch Logging                   │
└─────────────────────────────────────────┘
```

## Security & Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Security Layers                       │
└──────────────────────────────────────────────────────────┘

Upload Security:
1. Frontend validates file type (image/*)
2. Frontend validates file size
3. API Gateway authenticates request
4. Lambda generates time-limited presigned URL (1 hour)
5. S3 presigned URL includes AWS signature
6. Upload only works with correct signature
7. S3 bucket has CORS policy

Read Security:
1. S3 objects are private by default
2. Gallery uses presigned GET URLs (if configured)
3. Or IAM role credentials for listing
4. CloudWatch logs all access

IAM Permissions:
┌─────────────────────────────────┐
│  Presigner Lambda IAM Role      │
├─────────────────────────────────┤
│  • s3:PutObject (uploads/*)     │
│  • logs:CreateLogGroup          │
│  • logs:CreateLogStream         │
│  • logs:PutLogEvents            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Resizer Lambda IAM Role        │
├─────────────────────────────────┤
│  • s3:GetObject (uploads/*)     │
│  • s3:PutObject (resized/*)     │
│  • logs:CreateLogGroup          │
│  • logs:CreateLogStream         │
│  • logs:PutLogEvents            │
└─────────────────────────────────┘
```

## Performance Optimization

```
Frontend Optimizations:
├── Next.js App Router (Server Components)
├── Automatic Code Splitting
├── Image Optimization (Next/Image)
├── TailwindCSS Purge (removes unused CSS)
├── Production Build Minification
└── Static Asset Caching

Backend Optimizations:
├── Lambda Cold Start Mitigation
│   └── Keep functions warm (optional)
├── S3 Transfer Acceleration (optional)
├── CloudFront CDN (optional)
├── Pillow Image Processing (efficient)
└── Concurrent Lambda Executions

Expected Performance:
┌─────────────────────────────────┐
│ Action          │ Time          │
├─────────────────────────────────┤
│ Get Presigned   │ ~500ms        │
│ Upload 2MB      │ ~2-3s         │
│ Lambda Process  │ ~3-5s         │
│ Total Flow      │ ~6-8s         │
└─────────────────────────────────┘
```

---

**This architecture provides:**
- ✅ Scalability (serverless auto-scaling)
- ✅ Security (presigned URLs, IAM roles)
- ✅ Performance (CDN ready, optimized)
- ✅ Cost-efficiency (pay per use)
- ✅ Reliability (AWS SLA)
