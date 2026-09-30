---
permalink: welcome-to-mlab
title: "Welcome to M-Lab: Open Internet Measurement"
chapter: Getting Started
chapterOrder: 1
order: 1
status: draft
description: An introduction to what M-Lab is, what it measures, and how its open data can help you understand internet performance.
tags: [Measurement, Research]
difficulty: beginner
---

Measurement Lab (M-Lab) is the world's largest open internet measurement platform. Since 2009, M-Lab has collected billions of measurements from users around the globe, all published as open data under a Creative Commons license.

## What M-Lab Measures

M-Lab runs a set of standardized tests from measurement points hosted in internet exchange facilities worldwide. Every test captures:

- **Download and upload throughput** — how fast data can move between your device and the server
- **Round-trip latency** — how long a packet takes to travel to the server and back
- **Packet loss** — what fraction of network packets are dropped
- **Network path information** — the route packets take through the internet (via traceroute)

The flagship test is **NDT7** (Network Diagnostic Tool), which runs from any browser at [speed.measurementlab.net](https://speed.measurementlab.net) or is embedded in thousands of third-party apps and ISP portals.

## Why Open Data Matters

Unlike proprietary speed tests, every M-Lab measurement is:

- **Publicly archived** in Google Cloud Storage and BigQuery
- **Free to access** — no API keys, no paywalls for researchers
- **Consistently formatted** — a stable schema going back to 2009
- **Independently verifiable** — methodology and server code are open source

This makes M-Lab data suitable for longitudinal studies, regulatory filings, academic research, and community broadband advocacy.

## Key Datasets

| Dataset | What it contains | Access |
|---------|-----------------|--------|
| NDT7 | Speed + latency from user tests | BigQuery, GCS |
| Traceroute (Scamper) | Network paths between M-Lab and clients | BigQuery, GCS |
| MSAK | Multi-stream throughput measurements | BigQuery |
| Wehe | App-specific network differentiation | BigQuery |

## Where to Go Next

- **Run a test yourself** — [speed.measurementlab.net](https://speed.measurementlab.net)
- **Explore the data** — see [Getting Started with M-Lab Data in BigQuery](#)
- **Understand the measurements** — see [How M-Lab Measures Internet Speed: NDT7 and MSAK](#)
- **Run a node** — see [Running Your Own M-Lab Node: The BYOS Program](#)
- **Research applications** — see [Analyzing M-Lab Data: A Researcher's Guide](#)

## Community and Support

M-Lab runs monthly community calls, a research fellowship program, and annual hackathons at networking conferences. Visit [measurementlab.net](https://measurementlab.net) to learn about upcoming events and how to get involved.

---

<!-- TODO: Add overview diagram of the M-Lab platform architecture (measurement points → pipeline → BigQuery). Link to the current list of M-Lab measurement points. Add a brief history timeline (2009 founding → NDT7 → M-Lab 2.0 cloud migration → IQB framework). -->
