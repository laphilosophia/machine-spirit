# Deploying the Machine Spirit to Railway

This document outlines the steps to deploy the Machine-Spirit ecosystem (Kernel + Altar) to Railway using the unified Dockerfile.

## Prerequisites

- A Railway account (railway.app)
- GitHub repository with the code pushed

## Deployment Steps

1. **Dashboard Setup**:

   - Go to [Railway Dashboard](https://railway.app/new).
   - Select **Deploy from GitHub repo**.
   - Choose your `machine-spirit` repository.

2. **Environment Variables**:
   Add the following variables in the **Variables** tab:

   - `NEXT_PUBLIC_API_URL`: The URL of your Railway service (e.g., `https://machine-spirit-production.up.railway.app`).
   - `PORT`: 3000 (Railway will map the internal ports correctly).

3. **Persistent Volume**:

   - Go to **Settings** -> **Volumes**.
   - Create a new volume.
   - Set **Mount Path** to `/data`.
   - This ensures `soul.db` persists across redeploys.

4. **Internal Networking**:
   - The unified Docker image runs both the Altar (Next.js) and the Servitor (Express).
   - Servitor runs on PORT 3001 internally.
   - Altar runs on PORT 3000 internally.
   - The unified `start.sh` handles orchestration.

## Verification

Once deployed, access the Altar URL. You should see the Terminal handshake. Perform a ritual and refresh; if the volume is mounted, your progress will be saved.

Praise the Omnissiah.
