---
permalink: byos-overview
title: "Running Your Own M-Lab Node: The BYOS Program"
chapter: Running a Node
chapterOrder: 7
order: 1
status: published
description: An overview of M-Lab's Bring Your Own Server program — what it is,
  what's required, and how hosting a node contributes to global internet
  measurement.
tags:
  - Node Operations
difficulty: intermediate
---
M-Lab's **Bring Your Own Server (BYOS)** program lets organizations host M-Lab measurement nodes on their own infrastructure. BYOS nodes expand M-Lab's test server coverage and let you run standardized measurements from your network.

## Why Host a Node?

- **Expand coverage** — M-Lab has measurement points at major internet exchange facilities, but hosting a node puts measurement capacity directly in your network
- **Understand your network** — see NDT7 results from your own perspective as an ISP, campus, or community network
- **Contribute to open data** — all measurements from BYOS nodes are published as open data, just like M-Lab's own infrastructure

BYOS is used by ISPs, academic institutions, research networks, and community broadband providers.

## Requirements

### Hardware / VPS


| Resource | Minimum | Recommended |
| --------- | ------------- | ---------------- |
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| Bandwidth | 1 Gbps | 10 Gbps |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |


### Network Requirements

- A **static public IPv4 address** (IPv6 optional but recommended)
- **Ports 80 and 443** open inbound from the internet (required for NDT7)
- **Port 9990** open for Prometheus metrics (for M-Lab monitoring)
- The node must be reachable from the public internet — NAT or CG-NAT configurations are not supported

### Software

- **Docker** and **Docker Compose** (the node runs as a set of containers)
- The M-Lab BYOS deployment package (provided after registration)

## Getting Started

1. **Apply to the BYOS program** — fill out the [Infrastructure Contributor Form](https://docs.google.com/forms/d/e/1FAIpQLSejtmZJrW8BPuuhjG4FlGm0fFmN3cW6onvLsCxkd3UnECVd9Q/viewform) to express interest
2. **Receive credentials** — M-Lab will provide your node's configuration files and registration credentials
3. **Deploy the Docker stack** — follow the provided deployment guide to start the containers
4. **Verify registration** — use the Locate API to confirm your node is visible and serving tests

```bash
# Check if your node is registered and serving traffic
curl "https://locate.measurementlab.net/v2/nearest/ndt/ndt7"
```

Your node's hostname will appear in the response when it's successfully registered and passing health checks.

## What Runs on a BYOS Node

The BYOS stack runs these Docker containers:


| Container | Role |
| ------------------- | ------------------------------------------- |
| `ndt-server` | Handles NDT7 and NDT5 test connections |
| `register-node` | Registers the node with M-Lab's Locate API |
| `tcp-info` | Collects kernel TCP statistics during tests |
| `traceroute-caller` | Runs Scamper traceroutes to clients |
| `uuid-annotator` | Annotates measurements with metadata |
| `host-service` | Exports Prometheus metrics for monitoring |


All containers are maintained by M-Lab and updated automatically via the provided configuration.

## Data from Your Node

Measurements from BYOS nodes flow through M-Lab's standard data pipeline:

- Raw test data is uploaded to M-Lab's Google Cloud Storage archive
- Data is processed and published to BigQuery within ~24 hours
- You can filter for your node's data using the `server.Site` field in BigQuery:



```sql
-- Query a specific site-id for BYOS test data
SELECT a.TestTime, a.MeanThroughputMbps, client.Network.ASName
FROM `measurement-lab.ndt.ndt7_union`
WHERE server.Site = 'your-site-id'
  AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
ORDER BY a.TestTime DESC
```

## Monitoring Your Node

See the [Docker BYOS Monitoring and Logging](#) article for recommended Prometheus configuration and log management to keep your node healthy.

---

