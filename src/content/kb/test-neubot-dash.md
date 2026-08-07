---
permalink: test-neubot-dash
title: Neubot DASH Streaming Test
chapter: Tests
chapterOrder: 3
order: 3
status: published
description: DASH emulates a video streaming player to measure how well a network connection supports adaptive video streaming, without relying on a real video platform.
tags: [tests, data-access, streaming, network-neutrality]
difficulty: beginner
---

The DASH test (Dynamic Adaptive Streaming over HTTP) is a measurement tool that simulates a video streaming session to assess network quality from the perspective of a video player. It is one of the original Neubot suite of tests developed by the [Nexa Center for Internet & Society](http://www.neubot.org/), and continues to be hosted by M-Lab after the original Neubot client was retired in January 2019.

## How DASH Works

When you run the DASH test, it emulates streaming a thirty-second video from an M-Lab server. The video is divided into fifteen two-second segments. Before requesting each segment, the client specifies a video quality level (e.g., SD, HD, Super HD). Higher quality means a larger download for that segment.

The player follows a simple adaptive bitrate strategy: it tries to use the highest quality level that will not cause the network to queue (i.e., not exceed the available bandwidth). By keeping the strategy simple — unlike the sophisticated algorithms used by YouTube or Netflix — the test isolates the network's contribution to streaming quality. A real video player will often hide network impairment behind buffering and quality adaptation; the DASH test makes those impairments visible.

Key measurements collected per segment include:

- **Throughput** (Mbps) — actual download rate for each segment
- **Quality level** — which quality tier the client requested
- **Latency and timing** — per-segment timing data

Because the test deliberately avoids the optimizations real players use, results will often show lower "quality ceilings" than commercial video services. That gap is intentional and informative: it reflects the raw network capability rather than a platform's ability to smooth over problems.

## A Note on Throttling at Interconnects

A known limitation of the DASH test (shared with most measurement tools) is that if video throttling is caused by congestion at interconnection points between ISPs, results depend heavily on which network path the test takes. If the M-Lab server is reached via a different interconnect than the one where throttling occurs, the test may not detect the throttling. The [WeHe test](/kb/test-wehe) addresses app-specific throttling more directly.

## Privacy and Data Collection

When you run the DASH test, your IP address is collected along with measurement results and published publicly. See the [Neubot Privacy Policy](https://github.com/neubot/dash/blob/master/PRIVACY.md) and [M-Lab's Privacy Policy](https://www.measurementlab.net/privacy/).

## Accessing DASH Data

### Raw Data in Google Cloud Storage

DASH data is available in raw format in GCS:

- **DASH test results:** [gs://archive-measurement-lab/dash](https://console.cloud.google.com/storage/browser/archive-measurement-lab/neubot/dash)
- **Historical Neubot data (pre-retirement):** [gs://archive-measurement-lab/neubot](https://console.cloud.google.com/storage/browser/archive-measurement-lab/neubot)

See the Accessing Data in GCS<!-- FIXME: add link for "Accessing Data in GCS" --> article for guidance on downloading and parsing raw archives.

### BigQuery

DASH data is **not currently published to BigQuery**. Analysis requires working with the raw GCS archives directly.

<!-- FIXME: Create article on parsing Neubot/DASH raw data from GCS once format documentation is available. -->

## How People Use DASH Data

**Network neutrality research** — DASH data has been used to study whether ISPs differentiate video streaming traffic differently from other traffic, particularly in combination with tools like WeHe.

**Baseline streaming quality characterization** — researchers use DASH to establish a network-quality baseline for streaming that is independent of any specific video platform.

**Longitudinal studies** — the historical dataset covers years of measurements, making it possible to track how streaming-relevant network quality has changed over time.

## Source Code

- [Neubot DASH server & client](https://github.com/m-lab/dash) — M-Lab's maintained fork

## Citing DASH Data

> The M-Lab Neubot - Dash Data Set, \<date range used\>. https://measurementlab.net/tests/neubot

## Further Reading

- [Neubot project website](http://www.neubot.org/)
- [Dynamic Adaptive Streaming over HTTP (Wikipedia)](https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP)
- [WeHe — traffic differentiation testing](/kb/test-wehe)
- [NDT — throughput and speed testing](/kb/test-ndt)
