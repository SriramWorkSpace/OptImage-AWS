# AWS Configuration Quick Reference

## 🔧 Current AWS Setup

### API Gateway
**Endpoint URL:**
```
https://q8b715g1b0.execute-api.ap-south-1.amazonaws.com/default/presigner-lambda
```

**Method:** GET
**Query Parameter:** `filename` (required)

**Example Request:**
```bash
curl "https://q8b715g1b0.execute-api.ap-south-1.amazonaws.com/default/presigner-lambda?filename=test.jpg"
```

**Expected Response:**
```json
{
  "url": "https://image-resizer-demo-sriram.s3.ap-south-1.amazonaws.com/uploads/test.jpg?X-Amz-Algorithm=..."
}
```

### S3 Bucket
**Name:** `image-resizer-demo-sriram`
**Region:** `ap-south-1` (Mumbai)

**Folder Structure:**
```
image-resizer-demo-sriram/
├── uploads/           # Original uploaded images
└── resized/          # Processed images
    ├── thumb_*       # 100x100px thumbnails
    ├── medium_*      # 500x500px medium size
    └── large_*       # 1000x1000px large size
```

### Lambda Functions

#### 1. Presigner Lambda
- **Name:** `presigner-lambda`
- **Runtime:** Python 3.12
- **Purpose:** Generates presigned S3 PUT URLs
- **Trigger:** API Gateway (HTTP GET)
- **Permissions:** S3 write access to `uploads/` folder

#### 2. Resizer Lambda
- **Name:** `resizer-lambda`
- **Runtime:** Python 3.12
- **Purpose:** Automatically resize uploaded images
- **Trigger:** S3 ObjectCreated event on `uploads/` prefix
- **Dependencies:** Pillow (via Lambda Layer)
- **Layer ARN:** `arn:aws:lambda:ap-south-1:770693421928:layer:Klayers-p312-Pillow:7`
- **Output Sizes:**
  - Thumbnail: 100x100px
  - Medium: 500x500px
  - Large: 1000x1000px

### IAM Permissions

Both Lambda functions use an IAM role with:
- ✅ `AmazonS3FullAccess`
- ✅ `CloudWatchLogsFullAccess`

### CORS Configuration

If you encounter CORS errors, ensure your S3 bucket has CORS configured:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 🧪 Testing the Backend

### Test 1: Get Presigned URL
```powershell
# PowerShell
$response = Invoke-RestMethod -Uri "https://q8b715g1b0.execute-api.ap-south-1.amazonaws.com/default/presigner-lambda?filename=test.jpg"
$response
```

### Test 2: Upload to S3 (after getting presigned URL)
```powershell
# PowerShell
$imageBytes = [System.IO.File]::ReadAllBytes("path\to\image.jpg")
Invoke-RestMethod -Uri $presignedUrl -Method PUT -Body $imageBytes -ContentType "image/jpeg"
```

### Test 3: Check if images were resized
After uploading, wait 5-10 seconds and check S3 bucket:
- Look in `uploads/` folder for original
- Look in `resized/` folder for `thumb_`, `medium_`, `large_` versions

## 🔍 Monitoring

### CloudWatch Logs

**Presigner Lambda:**
```
/aws/lambda/presigner-lambda
```

**Resizer Lambda:**
```
/aws/lambda/resizer-lambda
```

## 🚨 Troubleshooting

### Issue: Presigned URL returns 403
**Solution:** Check IAM role has S3:PutObject permission

### Issue: Images not being resized
**Solution:** 
1. Check S3 event trigger is configured on `uploads/` prefix
2. Verify Pillow layer is attached to Lambda
3. Check CloudWatch logs for errors

### Issue: CORS errors in browser
**Solution:** Add CORS policy to S3 bucket

### Issue: Lambda timeout
**Solution:** Increase Lambda timeout (default: 3s, recommended: 30s for large images)

## 📊 Expected Behavior

1. **Upload Image (2MB JPEG)**
   - Frontend gets presigned URL: ~500ms
   - Upload to S3: ~2-3 seconds
   - Lambda processes: ~3-5 seconds
   - Total time: ~6-8 seconds

2. **File Sizes After Processing**
   - Original: 2MB
   - Thumb (100x100): ~10-20KB
   - Medium (500x500): ~100-200KB
   - Large (1000x1000): ~300-500KB

## 🔐 Security Notes

- Presigned URLs expire after configured time (typically 3600s = 1 hour)
- Each URL is unique and can only be used once
- URLs include AWS signature for authentication
- No AWS credentials exposed to frontend

## 📝 Next Integration Steps

Your frontend is already configured to use:
```typescript
// app/api/presign/route.ts
const API_GATEWAY_URL = 'https://q8b715g1b0.execute-api.ap-south-1.amazonaws.com/default/presigner-lambda'
```

No changes needed! The frontend will:
1. Call this endpoint with filename
2. Get presigned URL
3. Upload directly to S3
4. Show success message
