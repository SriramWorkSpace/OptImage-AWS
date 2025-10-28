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
