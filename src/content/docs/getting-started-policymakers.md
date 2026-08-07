---
permalink: getting-started-policymakers
title: "Getting Started: Internet Policymakers"
chapter: Getting Started
chapterOrder: 1
order: 3
status: draft
description: A guide for policymakers, regulators, and government staff who want to use M-Lab data to understand broadband performance, inform policy decisions, and evaluate connectivity programs.
tags: [getting-started, policy, internet-quality]
difficulty: beginner
---

M-Lab data has informed broadband policy at the national and international level — from FCC proceedings in the United States to regulatory filings across Europe, Latin America, and Asia. This guide points policymakers, regulators, and their research staff toward the resources most relevant to their work.

## What M-Lab Can Tell You

M-Lab measures actual internet performance experienced by real users, not what ISPs report or what is theoretically possible. Key uses for policy:

- **Characterizing ISP performance** by region, ASN, or time period using real user test data
- **Identifying underserved areas** through geographic analysis of speed and quality metrics
- **Detecting traffic differentiation** (throttling of specific apps or services) using the WeHe test
- **Evaluating broadband programs** by comparing before/after performance in target areas
- **Grounding policy in evidence** — M-Lab data is open, independently verifiable, and methodologically transparent

## Start Here

- [Welcome to M-Lab: Open Internet Measurement](/docs/welcome-to-mlab) — what M-Lab is, how it works, and why open data matters
- [Beyond Speed: Understanding Internet Quality Metrics](/docs/internet-quality-beyond-speed) — why download speed alone is an incomplete picture, and how latency, packet loss, and "working quality" affect real users
- [How M-Lab Measures Internet Speed: NDT7 and MSAK](/docs/test-ndt) — what NDT7 actually measures and what its results mean in practice

## The Internet Quality Barometer (IQB)

The **Internet Quality Barometer** is M-Lab's framework for evaluating internet quality beyond headline speed. IQB produces a composite score reflecting user experience across real use cases — web browsing, video streaming, gaming, video calls — each with its own network requirements.

IQB was developed through engagement with more than 60 experts across policy, academia, advocacy, and industry, and is designed to give policymakers a more actionable and equitable view of internet quality than speed tests alone.

- [IQB Framework blog post](https://www.measurementlab.net/blog/iqb/) — overview of the framework and its goals
- [IQB Detailed Report](https://www.measurementlab.net/publications/IQB_report_2025.pdf) — full methodology and scoring approach
- [IQB Executive Summary](https://www.measurementlab.net/publications/IQB_executive_summary_2025.pdf) — concise summary suitable for non-technical audiences and briefings

### IQB for Education (IQB-edu)

M-Lab is working with [Giga](https://giga.global/) to adapt the IQB framework for evaluating **school connectivity** — recognizing that classroom internet use has specific requirements (video conferencing, content delivery, simultaneous multi-user access) that differ from residential use.

This work is part of the [Connectivity Community of Practice](https://www.measurementlab.net/blog/cop-launch/), a global forum launched in March 2026 bringing together academia, industry, civil society, and international organizations around school connectivity measurement.

<!-- FIXME: Add link to IQB-edu methodology article once published. -->

## Key Measurement Tools for Policy

- [NDT (Network Diagnostic Tool)](/docs/test-ndt) — the flagship speed test, with data going back to 2009. Measures download speed, upload speed, and latency. The most widely used M-Lab dataset for policy analysis.
- [WeHe — Traffic Differentiation Detection](/docs/test-wehe) — detects whether ISPs are treating traffic from specific apps (YouTube, Spotify, etc.) differently from other traffic. Relevant for net neutrality enforcement and monitoring.
- [Neubot DASH Streaming Test](/docs/test-neubot-dash) — measures network quality from a video streaming perspective. Useful for evaluating broadband quality for video-dependent use cases like education and telehealth.

## Working with M-Lab Data

For no-code exploration, see the Visualization section below — the M-Lab Observatory requires no account or setup.

If you have a data analyst on staff, M-Lab data is also freely available in Google BigQuery:

- [Getting Started with M-Lab Data in BigQuery](/docs/getting-started-bigquery) — access setup, first queries, and schema overview
- [Analyzing M-Lab Data: A Researcher's Guide](/docs/research-guide) — ISP comparison patterns and geographic analysis

### Understanding Geographic Limitations

Country-level and ISP-level (ASN) analysis is reliable. City-level data and coordinates are intentionally coarse for privacy reasons and should not be used for fine-grained broadband mapping without supplementary geolocation sources:

- [M-Lab Network Annotations: Geolocation, ASNs, and What They Mean](/docs/mlab-annotations-explained) — full accuracy guidance, how to use region codes for sub-national analysis, and joining M-Lab data with external datasets

## How M-Lab Data Has Been Used in Policy

M-Lab data has been used in:

- **FCC proceedings** — cited in network neutrality rulemakings and broadband mapping challenges
- **BEAD program evaluation** — comparing NDT measurements to FCC broadband maps to identify coverage discrepancies
- **Regulatory filings** — ISP performance comparisons submitted to communications regulators globally
- **Broadband equity research** — studies of the digital divide using ASN and geographic filters

See [M-Lab Publications](https://www.measurementlab.net/publications/#government--regulatory-filings) for government and regulatory filings that have used M-Lab data.

## Visualization and Exploration (No Coding Required)

- [M-Lab Observatory](https://viz.measurementlab.net) — interactive dashboards for ISP and geographic comparisons, no SQL required
- [speed.measurementlab.net](https://speed.measurementlab.net) — run an NDT test yourself to understand what users experience

## Privacy and Data Governance

All M-Lab tests collect the user's IP address alongside measurement results, which is published openly. M-Lab does not collect personally identifiable information beyond the IP address, and enforces rate limits to prevent bulk surveillance use. See [M-Lab's Privacy Policy](https://www.measurementlab.net/privacy/) for full details.

## Contact and Engagement

M-Lab regularly engages with policymakers and regulators. For inquiries about specific policy applications, data interpretation, or testimony support, contact [support@measurementlab.net](mailto:support@measurementlab.net).

