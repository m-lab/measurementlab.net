---
permalink: ip-address-mismatch
title: "FAQ: IP Address Mismatch in BYOS Environment File"
chapter: Running a Node
chapterOrder: 7
order: 2
status: published
description: How to fix an M-Lab BYOS node that is unreachable due to a mismatch between the env file IP and the server's actual public IP.
tags: [node-operations]
difficulty: beginner
---

**Q: My node is unreachable even though it's running. What could be wrong?**

**A:** A common issue is an IP address mismatch between your environment file and your server's actual public IP. This happens when:

- Your `env` file has `IPV4=X.X.X.X`
- But your server is actually registering from a different IP address
- DNS records point to the env file IP, making the server unreachable

## Fix

1. Identify your server's actual public IP address
2. Update your `env` file to set `IPV4=` to the correct IP
3. Restart the stack:

```bash
docker compose --profile ndt --env-file env down
docker compose --profile ndt --env-file env up -d
```
