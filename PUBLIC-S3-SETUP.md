# 🔓 Make S3 Resized Images Publicly Accessible

## Steps to Configure Public Access for Gallery

### Step 1: Unblock Public Access (if needed)

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Click on bucket: **`image-resizer-demo-sriram`**
3. Go to **"Permissions"** tab
4. Under **"Block public access (bucket settings)"**, click **"Edit"**
5. **Uncheck** "Block all public access" (or just the ones needed)
6. Click **"Save changes"**
7. Type `confirm` when prompted

### Step 2: Add Bucket Policy

1. Stay in the **"Permissions"** tab
2. Scroll down to **"Bucket policy"**
3. Click **"Edit"**
4. **Paste this policy:**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadResizedImages",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::image-resizer-demo-sriram/resized/*"
            ]
        },
        {
            "Sid": "PublicListBucket",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::image-resizer-demo-sriram"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "resized/*"
                    ]
                }
            }
        }
    ]
}
```

5. Click **"Save changes"**

---

## What This Does

✅ **Allows anyone to:**
- View/download images from the `resized/` folder
- List objects in the `resized/` folder (for gallery)

❌ **Does NOT allow:**
- Access to `uploads/` folder (remains private)
- Uploading new files (still requires presigned URLs)
- Deleting or modifying files

---

## After Configuration

1. **Refresh the page** at http://localhost:3000/gallery
2. **Click the "Refresh" button**
3. Your resized images should now appear!

---

## Verify It's Working

### Check Browser Console (F12):
You should NOT see any 403 (Forbidden) errors

### Check Terminal:
```
[LIST] Fetching images from S3...
[LIST] Found X objects
[LIST] Returning X images
```

### Check Gallery:
- Images should appear in the grid
- Filter buttons should work
- Download buttons should work

---

## Security Note

- Only the `resized/` folder is public
- Original uploads remain private in `uploads/`
- This is safe for demo/personal projects
- For production with sensitive images, use presigned GET URLs instead

---

## Alternative: Keep Everything Private

If you prefer to keep everything private, you can:
1. Add AWS credentials to `.env.local`
2. The backend will authenticate with AWS
3. But this requires managing AWS credentials

Public read for `resized/` is simpler and common for image galleries!

---

**After configuring the bucket policy, go back to your gallery and refresh! 🎉**
