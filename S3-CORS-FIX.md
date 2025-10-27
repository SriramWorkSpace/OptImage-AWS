# 🔧 Fix S3 CORS Configuration

## Problem
The API successfully gets a presigned URL from AWS, but the browser can't upload directly to S3 due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solution
Configure CORS on your S3 bucket to allow browser uploads.

---

## Steps to Fix:

### 1. Go to AWS S3 Console
1. Open [AWS S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Find your bucket: **`image-resizer-demo-sriram`**
3. Click on the bucket name

### 2. Configure CORS
1. Click on the **"Permissions"** tab
2. Scroll down to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"**
4. **Delete any existing CORS configuration** and paste this:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:*",
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. Click **"Save changes"**

---

## Why This is Needed

When you upload from the browser:
```
Browser → AWS API Gateway ✅ (works)
        → Get Presigned URL ✅ (works)
        → Upload to S3 ❌ (CORS blocked without this config)
```

The browser blocks the S3 upload unless S3 explicitly allows it via CORS headers.

---

## After Fixing CORS

1. **No code changes needed** - your frontend is already correct
2. **Try uploading again** at http://localhost:3000/upload
3. You should see:
   - ✅ "Upload Successful!"
   - Your image in S3 bucket under `uploads/`
   - After 5-10 seconds, resized versions in `resized/`

---

## Verify It's Working

### Check Terminal Logs:
You should see:
```
Fetching presigned URL for: yourimage.jpg
API Gateway response status: 200
Presigned URL generated successfully
```

### Check Browser Console (F12):
```
Getting presigned URL for: yourimage.jpg
Got presigned URL
Uploading to S3...
Upload response status: 200
Upload successful!
```

### Check S3 Bucket:
- Go to your S3 bucket
- Look in `uploads/` folder - your original image should be there
- Wait 5-10 seconds
- Look in `resized/` folder - you should see:
  - `thumb_yourimage.jpg`
  - `medium_yourimage.jpg`
  - `large_yourimage.jpg`

---

## Alternative: For Production

For production, replace `"*"` in AllowedOrigins with your actual domain:

```json
"AllowedOrigins": [
    "https://yourdomain.com"
]
```

---

## Still Having Issues?

### Check S3 Bucket Permissions
1. Go to bucket **Permissions** tab
2. Make sure **"Block all public access"** settings allow your use case
3. The presigner Lambda should have `s3:PutObject` permission

### Check Lambda IAM Role
Make sure the presigner Lambda has:
- `s3:PutObject` for the `uploads/` folder
- `s3:GetObject` for generating presigned URLs

---

**After configuring CORS, try uploading again - it should work!** 🎉
