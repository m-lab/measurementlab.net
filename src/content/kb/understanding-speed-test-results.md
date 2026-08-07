---
permalink: understanding-speed-test-results
title: Understanding Speed Test Results
chapter: Understanding Measurement
chapterOrder: 2
order: 1
status: published
description: Why different speed tests produce different results, and what those differences reveal about your internet connection.
tags: [speed-test, measurement, ndt]
difficulty: beginner
---

Internet performance tests may produce different results for many reasons. Three of the main factors are server location, testing methodology, and changing network conditions.

## 1. Differences in Server Location

Every performance test has two parts:

- **Client:** The software running on your device that displays speed results.
- **Server:** The computer on the Internet to which the client connects to complete the test.

The test measures performance between these two points, so their locations matter significantly.

### On-net vs. off-net testing

**On-net** measurements occur between your device and a server located within your Internet Service Provider's (ISP's) own network (also called the "last mile"). This tells you how your connection performs within your ISP's infrastructure, but does not reflect real-world Internet use — which almost always involves crossing between networks to reach content hosted outside your ISP. On-net results are often higher than other methods because the traffic travels a shorter distance over a network controlled by a single provider.

**Off-net** measurements occur between your device and a server located outside your ISP's network. Traffic crosses inter-network borders and often travels longer distances, which typically produces lower results than on-net testing — but better reflects real-world performance.

M-Lab measurements are always conducted **off-net**. This means inter-network connections are included in the test, giving you a realistic picture of performance when browsing the web, streaming video, or using cloud services.

## 2. Differences in Testing Methods

Different tests measure different things in different ways.

M-Lab's NDT test tries to transfer as much data as possible in ten seconds (both upload and download) using a **single TCP connection** to an M-Lab server. Other popular tests use **multiple parallel connections** to maximize throughput.

Neither approach is inherently right or wrong. However, a single-stream test is more sensitive to problems in the network path — congestion, packet loss, or bottlenecks — that multiple streams can mask by working around them. This makes single-stream tests more useful for diagnosing network issues.

All NDT data collected by M-Lab are [publicly available](https://measurementlab.net/data) in visualized, queryable, and raw forms.

## 3. Changing Network Conditions and Distinct Test Paths

The Internet is constantly changing, and test results reflect that. A test run five minutes apart can show very different results because:

- **Traffic routing:** Different tests may follow different network paths. One path might pass through a congested or misconfigured router; another may not.
- **Server selection:** A test today may reach a server farther away than one yesterday.
- **IPv4 vs. IPv6:** These protocols may follow different physical paths. Some IPv6 routes are tunneled through IPv4, either from the client or at points further along the path, depending on local network management.

Running a single test gives you a snapshot of conditions at that moment, on the best available path, to the specific server used. Because Internet routing and infrastructure change dynamically, **testing regularly and reviewing results over time** gives a far more reliable picture of representative performance than any single measurement.
