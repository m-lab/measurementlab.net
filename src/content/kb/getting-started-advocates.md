---
permalink: getting-started-advocates
title: "Getting Started: Internet Advocates"
chapter: Getting Started
chapterOrder: 1
order: 4
status: draft
description: A guide for digital rights advocates, community broadband organizers, and civil society researchers using M-Lab data to document ISP behavior, support communities, and make evidence-based arguments.
tags: [getting-started, advocacy, internet-quality, net-neutrality]
difficulty: beginner
---

M-Lab data is a powerful resource for internet advocacy — it's open, independently verifiable, and produced at a scale that individual communities or organizations cannot replicate on their own. This guide is for advocates, organizers, civil society researchers, and journalists who want to use M-Lab data to document ISP behavior, support communities, and build evidence-based arguments.

## What Makes M-Lab Useful for Advocacy

- **Independent** — M-Lab is not run by any ISP, and data is not controlled by commercial interests
- **Open and verifiable** — anyone can check the methodology and reproduce the results
- **Long record** — continuous measurements since 2009 enable before/after comparisons and trend analysis
- **Covers throttling** — the WeHe test specifically detects whether ISPs treat app traffic differently
- **Freely accessible** — no subscription required to access the data

## Start Here

- [Welcome to M-Lab: Open Internet Measurement](/kb/welcome-to-mlab) — what M-Lab is and why open measurement matters
- [Beyond Speed: Understanding Internet Quality Metrics](/kb/internet-quality-beyond-speed) — why download speed headlines often don't capture what users actually experience; latency, packet loss, and quality under load
- [How M-Lab Measures Internet Speed: NDT7 and MSAK](/kb/test-ndt) — what NDT actually measures and what it doesn't

## Detecting Throttling and Traffic Discrimination

One of M-Lab's most directly advocacy-relevant tools is **WeHe**, which tests whether your ISP treats traffic from specific apps (YouTube, Spotify, Amazon Video, etc.) differently from other traffic.

**To run a WeHe test now:** WeHe is available as a free mobile app at [wehe.meddle.mobi](https://wehe.meddle.mobi/). Each test you run contributes to the public dataset.

WeHe works by sending real app traffic and comparing it to randomized (bit-inverted) traffic. A statistically significant difference means the ISP is applying app-specific treatment — throttling, deprioritization, or blocking — not just experiencing general congestion.

- [WeHe — Traffic Differentiation Detection](/kb/test-wehe) — how WeHe works, how to interpret results, and how to query the historical dataset in BigQuery

## Broadband Speed and Coverage Evidence

For characterizing ISP performance in a community, region, or across ISPs:

- [NDT (Network Diagnostic Tool)](/kb/test-ndt) — M-Lab's flagship speed test, with 15+ years of data. Can be filtered by geography (country, region, city) or by ISP (ASN).
- [Analyzing M-Lab Data: A Researcher's Guide](/kb/research-guide) — patterns for ISP comparison and geographic analysis

### Accessing the Data (Free)

- [Setting Up Free BigQuery Access](/kb/getting-started-bigquery) — register for free BigQuery access with your Google account
- [Getting Started with M-Lab Data in BigQuery](/kb/getting-started-bigquery) — run your first query in under 10 minutes

### Visualization (No Coding Required)

- [M-Lab Observatory](https://viz.measurementlab.net) — interactive dashboards comparing ISP performance by geography, no SQL needed

## Understanding What the Data Shows (and Doesn't)

Before making claims based on M-Lab data, it's important to understand the limitations:

- [M-Lab Network Annotations: Geolocation, ASNs, and What They Mean](/kb/mlab-annotations-explained) — how M-Lab ties measurements to locations and ISPs, and where this can be imprecise
- [FAQ: Geolocation Limitations in M-Lab Data](/kb/mlab-annotations-explained) — city-level location data is often imprecise; ISP (ASN) level analysis is more reliable
- [FAQ: Test Rate Limits](/kb/test-rate-limits) — M-Lab limits tests to 40/day per IP to protect data integrity; good to know if you're organizing community measurement campaigns

**Important caveat:** M-Lab data comes from users who choose to run a test. This means it's not a random sample of all internet users — people who run speed tests may be more likely to be experiencing problems. This selection effect should be acknowledged in any public-facing analysis.

## The Internet Quality Barometer

The **Internet Quality Barometer (IQB)** is M-Lab's framework for moving beyond speed to evaluate overall internet quality. It scores connections across real use cases — web browsing, gaming, video calls, streaming — and is designed to make internet quality more legible to policymakers and the public.

- [Beyond Speed: Understanding Internet Quality Metrics](/kb/internet-quality-beyond-speed) — introduction to the IQB and why quality matters beyond Mbps
- [IQB Framework](https://www.measurementlab.net/blog/iqb/) — full framework documentation
- [IQB Executive Summary](https://www.measurementlab.net/publications/IQB_executive_summary_2025.pdf) — concise, non-technical summary

## How Advocates Have Used M-Lab Data

- **Net neutrality proceedings** — WeHe and NDT data have been submitted as evidence in regulatory proceedings documenting ISP throttling practices
- **Broadband mapping challenges** — comparing M-Lab speed data to FCC maps to document discrepancies between reported and experienced coverage
- **Digital equity campaigns** — showing speed and quality gaps between neighborhoods, demographics, or rural vs. urban areas
- **ISP accountability reporting** — journalists and watchdog groups have used NDT data to compare ISP performance claims against actual user experience

See [M-Lab Publications — Government/Regulatory Filings](https://www.measurementlab.net/publications/#government--regulatory-filings) for examples.

## Community Measurement

If you want to organize your community to contribute measurements:

- Point people to [speed.measurementlab.net](https://speed.measurementlab.net) — each test contributes anonymously to the public dataset
- [BYOS Program](/kb/byos-overview) — organizations can host their own M-Lab node to add local measurement capacity and generate data closer to the community

## Contact

For questions about using M-Lab data in advocacy campaigns, reports, or proceedings, contact [support@measurementlab.net](mailto:support@measurementlab.net). M-Lab staff have supported civil society organizations with data interpretation and expert testimony.

<!-- FIXME: Add link to "Organizing a Community Measurement Campaign with M-Lab" article once created. -->
<!-- FIXME: Add link to "Using M-Lab Data as Evidence in Regulatory Filings" article once created. -->
