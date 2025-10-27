# OptImage Frontend

Modern, serverless image optimization application built with Next.js 14 and AWS.

## Features

- 🚀 Upload images with drag & drop support
- ⚡ Automatic image resizing (thumbnail, medium, large)
- 🎨 Beautiful, responsive UI with TailwindCSS
- ☁️ Powered by AWS S3 and Lambda
- 🔒 Secure presigned URL uploads

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

The app connects to AWS API Gateway endpoint:
```
https://q8b715g1b0.execute-api.ap-south-1.amazonaws.com/default/presigner-lambda
```

## Pages

- `/` - Homepage with feature overview
- `/upload` - Upload and optimize images
- `/gallery` - View all processed images

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **AWS Services** - S3, Lambda, API Gateway

## AWS Backend

- **S3 Bucket**: `image-resizer-demo-sriram`
- **Lambda Functions**: 
  - `presigner-lambda` - Generates upload URLs
  - `resizer-lambda` - Auto-resizes uploaded images
- **Sizes Generated**: 
  - Thumbnail: 100x100px
  - Medium: 500x500px
  - Large: 1000x1000px
