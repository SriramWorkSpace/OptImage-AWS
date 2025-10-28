# OptImage Frontend

Cloud-native image optimization web app built with Next.js and AWS.

## 🚀 Live Demo

[opt-image-aws-la1z.vercel.app](https://opt-image-aws-la1z.vercel.app/)

[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?logo=vercel)](https://opt-image-aws-la1z.vercel.app/)

## ✨ Features

- Drag & drop image upload with live preview
- Presigned S3 uploads (no credentials in the browser)
- Automatic resizing via AWS Lambda (thumb/medium/large)
- Gallery with filters, download, and delete actions
- Dark theme UI, responsive layout, accessible components
- “OI” logo and branded footer (Sriram Madala)

## 🧩 Components & Technologies Used

- Frontend
  - Next.js 13.5.6 (App Router)
  - React 18 + TypeScript
  - TailwindCSS
  - Lucide React (icons)
  - Deployed on Vercel (Serverless Functions for API routes)
- AWS Backend
  - Amazon S3 (uploads/, resized/)
  - AWS Lambda (Python 3.12) + Pillow for image processing
  - API Gateway for presigned URL endpoint
  - CloudWatch Logs for observability
  - S3 CORS and Bucket Policy (public GET/LIST for resized/ only)

## 📚 Pages & API Routes

- Pages
  - `/` — Homepage with product overview
  - `/upload` — Drag & drop uploader; PUTs to S3 via presigned URL
  - `/gallery` — Lists images from `resized/`, filter by size, download/delete
- API Routes (Next.js on Vercel)
  - `GET /api/presign` → Calls API Gateway for presigned PUT URL
  - `GET /api/list-images` → Lists `resized/` via S3 REST API (XML → JSON), no creds
  - `DELETE /api/delete-image?name=<file>` → Deletes thumb/medium/large variants

## 🏗️ Project Structure (highlights)

```
app/
  page.tsx                # Homepage
  upload/page.tsx         # Upload UI
  gallery/page.tsx        # Gallery with filters & actions
  api/
    presign/route.ts      # Presigned URL proxy to API Gateway
    list-images/route.ts  # Public S3 list via REST API
    delete-image/route.ts # Delete all sizes in resized/
components/
  Navigation.tsx          # Top navigation with OI logo
```

## ⚙️ Local Development

Prereqs: Node.js 18+ (Node 20 recommended)

```bash
npm install
npm run dev
# open http://localhost:3000
```

Environment:
- No secrets required for listing/reading/deleting if your bucket policy allows public access on `resized/`.
- API Gateway URL for presign is hardcoded in `app/api/presign/route.ts`.

## ☁️ Deploy (Vercel)

- Framework: Next.js (auto)
- Root Directory: `./` (if the app is at repo root)
- Install: `npm install` • Build: `next build` • Output: `.next`
- After deploy: test `/upload` → wait a few seconds → check `/gallery`.

## 🔧 AWS Notes

- Bucket: `image-resizer-demo-sriram` (Region: `ap-south-1`)
- Folders:
  - `uploads/` — originals (private)
  - `resized/` — public variants (`thumb_`, `medium_`, `large_`)
- Lambda resizer hardening:
  - URL-decodes S3 keys with `urllib.parse.unquote_plus`
  - EXIF orientation fix (`ImageOps.exif_transpose`)
  - RGB conversion for JPEG to avoid RGBA save errors
  - High-quality `LANCZOS` downscale, cache headers on outputs

## 🧰 Troubleshooting

- “NoSuchKey” when manually opening a URL like `resized/thumb` → add the full filename, e.g. `resized/thumb_test.jpg`.
- Gallery empty after upload → allow 5–20s for Lambda to write variants; click Refresh.
- Filenames with spaces/parentheses → handled by Lambda decoding and frontend URL encoding.

---

Made with ❤️ using Next.js, AWS, and Vercel.

---

# 🖼️ OptImage – Serverless Image Optimization App

OptImage is a modern, cloud-based image optimization web app built with Next.js 13.5.6 and AWS.
It allows users to securely upload images that are automatically resized and optimized in real time — powered entirely by AWS Lambda and S3.

---

## 🚀 Features (summary)

- 🔄 Automatic Image Resizing – Every uploaded image is resized into three versions (thumbnail, medium, large).
- ☁️ Completely Serverless – Built with AWS Lambda, S3, and API Gateway — no backend server to manage.
- 🔒 Secure Uploads – Uses AWS Presigned URLs to upload directly to S3 without exposing credentials.
- 🖥️ Fast and Responsive UI – Clean frontend built with Next.js + TailwindCSS.
- 🧹 Smart Storage Management – Optional S3 lifecycle rules can auto-delete old resized images.
- 📊 Monitored via CloudWatch – Lambda logs make debugging and tracking performance easy.

---

## ⚙️ How It Works

### 🧠 AWS Lambda Integration

- `presigner-lambda`
  - Generates a presigned URL using AWS SDK.
  - The frontend requests this URL, then uploads images directly to S3 — no server in between.

- `resizer-lambda`
  - Triggered automatically when a new image is uploaded to the S3 bucket (event type: `ObjectCreated`).
  - Uses Pillow (via a Lambda Layer) to:
    - Resize the image to multiple sizes.
    - Save them back to S3 under the `resized/` folder.

Together, these functions form a fully serverless pipeline — from upload to image optimization.

---

## 🧭 Getting Started (Frontend)

### 1) Install dependencies

```bash
npm install
```

### 2) Run locally

```bash
npm run dev
```

### 3) Open the app

Visit http://localhost:3000
