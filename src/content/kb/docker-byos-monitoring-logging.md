---
permalink: docker-byos-monitoring-logging
title: "FAQ: Docker BYOS Monitoring and Logging"
chapter: Running a Node
chapterOrder: 7
order: 4
status: published
description: Recommended Prometheus metrics endpoints and Docker logging configuration to prevent disk exhaustion on M-Lab BYOS nodes.
tags: [Node Operations]
difficulty: intermediate
---

**Q: How should I monitor my Docker BYOS M-Lab node, and what logging configuration is recommended?**

**A:** Since M-Lab does not provide alerts or notifications for BYOS nodes, you must set up your own monitoring system.

## Prometheus Metrics Endpoints

Deploy a Prometheus instance to scrape metrics from these endpoints in your Docker Compose stack:

| Service | Port | Key Metric |
|---|---|---|
| ndt-server | 9990/metrics | `ndt7_client_test_results_total` |
| jostler | 9991/metrics | — |
| uuid-annotator | 9992/metrics | — |
| heartbeat | 9993/metrics | — |
| traceroute-caller | 9994/metrics | — |
| node_exporter | 9995/metrics | CPU, memory, disk usage |

## Critical Logging Configuration

Docker's default `json-file` logging driver does not rotate logs, and M-Lab containers generate significant log output that can fill your disk. Configure Docker to use the `local` logging driver by adding this to `/etc/docker/daemon.json`:

```json
{
  "log-driver": "local"
}
```

Then restart Docker. The `local` driver includes automatic log rotation and size limits to prevent disk space issues over time.
