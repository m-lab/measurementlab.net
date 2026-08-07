---
permalink: register-node-troubleshooting
title: "FAQ: Docker Compose Troubleshooting - Register Node Issues"
chapter: Running a Node
chapterOrder: 7
order: 3
status: published
description: Steps to diagnose and fix a stopped or unresponsive register-node component in a Docker BYOS deployment.
tags: [node-operations]
difficulty: intermediate
---

**Q: My M-Lab node's register-node component has stopped sending updates. How do I troubleshoot this?**

**A:** If your register-node component stops communicating with M-Lab, follow these steps:

## Step 1: Extract Logs for Diagnosis

```bash
docker compose --profile ndt logs register-node > register-node-logs.txt 2>&1
```

## Step 2: Restart the Docker Compose Stack

```bash
docker compose --profile ndt --env-file env down
docker compose --profile ndt --env-file env up -d
```

## Step 3: Escalate if Needed

Send the logs to M-Lab support for analysis if the issue persists.

The register-node component is critical for keeping your node visible in the M-Lab platform, so address any issues promptly.
