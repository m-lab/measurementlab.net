---
permalink: checking-node-probability
title: "FAQ: Checking Node Probability and Status"
chapter: Running a Node
chapterOrder: 7
order: 5
status: draft
description: How to use the M-Lab Locate Service API to verify your node's probability setting and registration status.
tags: [node-operations]
difficulty: beginner
---

**Q: How can I verify my node's current probability setting and registration status?**

**A:** Use the M-Lab Locate Service API to check whether your node is registered, its current probability, and which experiments it's serving.

## Query the Locate API

```bash
curl "https://locate.measurementlab.net/v2/nearest/ndt/ndt7" | jq .
```

If your node is registered and healthy, it will appear in the `results` array. The response includes the FQDN, access URLs, and any active experiments.

## Check Node Probability

Each node has a probability value (0.0–1.0) that controls how often the Locate API directs clients to it. A probability of 1.0 means the node is fully active; 0.0 means it's disabled.

You can query a specific node:

```bash
curl "https://locate.measurementlab.net/v2/nearest/ndt/ndt7?lat=<LAT>&lon=<LON>" | jq '.results[] | select(.machine | contains("your-node-hostname"))'
```

## Common Registration Issues

- **Node not appearing** — check that the `register-node` container is running and healthy:
  ```bash
  docker compose ps register-node
  docker compose logs register-node --tail 50
  ```
- **Probability unexpectedly 0** — M-Lab may have flagged your node for a health check failure; check the `host-service` metrics endpoint
- **Stale registration** — if you recently changed your node's IP or hostname, it may take up to 10 minutes for the Locate API to reflect the update

## Prometheus Metrics

Your node exposes health metrics at `http://your-node:9990/metrics`. Key metrics to check:

```
ndt_e2e_latency_seconds    — end-to-end test latency
ndt_client_connections     — number of active client connections
registration_last_success  — timestamp of last successful registration
```
