---
permalink: integrating-mlab-tests
title: Integrating M-Lab Tests into Your Application
chapter: Tests
chapterOrder: 3
order: 6
status: published
description: "How to embed M-Lab's open source tests in a website, mobile app, or software product — and how integration partners can contribute infrastructure back to the M-Lab community."
tags: [tests, ndt, node-operations]
difficulty: intermediate
---

M-Lab is a community project: its tests are open source, its data is public, and its measurement infrastructure is maintained through partnerships with networks, institutions, and developers worldwide. Integrating an M-Lab test into your product is one of the most direct ways to participate in that community — your users run measurements that contribute to the global public dataset, and in return you get access to reliable, independently verifiable speed test infrastructure.

## Who Has Integrated M-Lab Tests

The Network Diagnostic Tool (NDT) is M-Lab's most widely integrated test. Third-party integrations include Google Search (the "internet speed test" panel in search results), Speedup America, Fing, and a number of ISP portals and consumer applications. Each integration runs the same standardized test and contributes results to M-Lab's open archive.

## Adding NDT to Your Website or Application

M-Lab's tests are open source and available as client libraries for several platforms:

| Platform | Library |
|----------|---------|
| JavaScript (browser) | [ndt7-js](https://github.com/m-lab/ndt7-js) |
| Go | [ndt7-client-go](https://github.com/m-lab/ndt7-client-go) |
| iOS | [ndt7-client-ios](https://github.com/m-lab/ndt7-client-ios) |
| Android | [ndt7-client-android](https://github.com/m-lab/ndt7-client-android) |

All clients follow the same flow:

1. Query the **Locate API** to find the nearest M-Lab server for the user
2. Run the NDT7 test (download and upload, ~10 seconds each)
3. Display results; the raw measurement is automatically uploaded to M-Lab's archive

### Access Tokens

NDT7 tests run through the Locate API require an **access token** returned in the Locate API response. Your client must pass this token to the test server when connecting. Tokens bind a measurement to its session and are logged in the raw data, so the provenance of every test is auditable. The reference client libraries handle this automatically.

### Data from Your Integration

Measurements from your integration flow into M-Lab's standard data pipeline and are published to BigQuery and Google Cloud Storage within ~24 hours. This means your users' tests become part of the open public dataset — searchable by the community. 

## Choosing Between M-Lab-Managed and Host-Managed Servers

By default, clients are directed to the nearest M-Lab-managed server via the Locate API. For integrators who want more control — or want to place measurement capacity directly in their own network — M-Lab offers two paths:

**M-Lab-managed servers** — the default. No infrastructure work required. Your users are served by M-Lab's global network of servers at internet exchange facilities. Results appear in `ndt7_union` and `ndt7` BigQuery views.

**Host-Managed servers (BYOS)** — your organization hosts an M-Lab node on your own infrastructure using Docker. This is well-suited to ISPs, IXPs, and large platforms that want measurements anchored to specific networks. Results appear in `ndt7_dynamic`. See [Running Your Own M-Lab Node: The BYOS Program](/kb/byos-overview) for hardware requirements and deployment steps.

## Contributing Infrastructure as a Community Partner

M-Lab's measurement coverage depends on organizations that contribute servers and network capacity. Several models exist for infrastructure partners:

- **BYOS nodes** — deploy a Docker-based M-Lab node on your servers. Used by ISPs, academic networks, and community broadband providers. All measurements from your node become open data.
- **IXP hosting** — internet exchange points hosting M-Lab nodes provide measurement capacity to all member networks, making them a high-leverage contribution point.
- **Research partnerships** — academic and research institutions can work with M-Lab to run additional experiments alongside NDT. New experiments go through M-Lab's Experiment Review Committee.

Hosting a node also gives you a direct view into how users on your network experience the internet, queryable via BigQuery using the `server.Site` field.

## Getting Support

The M-Lab team regularly works with application and web developers to support integrations. To get started:

- Review the [M-Lab Developer Guide](https://www.measurementlab.net/develop/) for technical documentation
- Email [support@measurementlab.net](mailto:support@measurementlab.net) to discuss your integration or infrastructure partnership
- Join the [M-Lab Discuss group](https://groups.google.com/a/measurementlab.net/g/discuss) to connect with the broader community of developers and researchers using M-Lab

M-Lab support typically responds within five business days.
