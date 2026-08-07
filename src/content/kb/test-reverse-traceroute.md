---
permalink: test-reverse-traceroute
title: Reverse Traceroute
chapter: Tests
chapterOrder: 3
order: 5
status: published
description: "Reverse Traceroute reconstructs the network path from an M-Lab server back to a client — the direction that standard traceroute cannot see — using a distributed system of vantage points and spoofed probes."
tags: [tests, data-access, bigquery, routing, network-topology]
difficulty: advanced
---

Reverse Traceroute (RevTr) measures the network path from an M-Lab server back to a user — the reverse direction of a standard traceroute. Because Internet paths are almost always asymmetric (the route from A to B is rarely the same as B to A), understanding only the forward path often isn't enough to diagnose performance problems or study routing behavior. RevTr fills this gap.

As of now, roughly **25% of NDT speed tests** on M-Lab are paired with a reverse traceroute, creating a large-scale dataset linking speed measurements to bidirectional path information.

RevTr is developed by a research group led by Ethan Katz-Bassett (Columbia University), including Italo Cunha (UFMG), Kevin Vermeulen (CNRS), Dave Choffnes (Northeastern University), and Loqman Salamatian (Columbia University). The system is described in the [RevTr 1.0 paper](https://www.measurementlab.net/publications/reverse-traceroute.pdf) (NSDI '10) and the [RevTr 2.0 paper](https://hal.science/hal-03788618/file/internet-scale-revtr.pdf) (IMC '22), which is the version integrated with M-Lab.

## Why Reverse Traceroute Is Hard

Standard traceroute works by sending packets with increasing TTL values and listening for ICMP "time exceeded" messages from routers along the path. This only works because the sender controls the probe packets. M-Lab's speed tests are browser-based and cannot send traceroute probes from the user's device — and even in cases where they could, most networks block or rate-limit ICMP in ways that make reverse-direction measurement unreliable.

RevTr solves this by reconstructing the reverse path from the server side, using several complementary techniques.

## How Reverse Traceroute Works

RevTr builds the reverse path hop-by-hop from the client back to the M-Lab server using five strategies:

**Strategy 1 — Atlas intersection.** RevTr maintains a global atlas of traceroutes from RIPE Atlas probes to M-Lab servers. When a discovered reverse hop matches a router already seen in the atlas, RevTr assumes the remaining path follows the known atlas route back to the server, avoiding the need to probe further.

**Strategy 2 — Record-Route (RR) atlas.** RevTr sends pings with the IP Record-Route option enabled to routers along known paths. These pings capture interface addresses on the return path, enriching the atlas.

**Strategy 3 — Direct RR pings from the server.** The server sends a Record-Route ping to the client's IP. Routers record their addresses in the packet header on the return trip. This is limited by the RR header's 9-slot capacity — on long paths, the header fills before any reverse hops can be recorded.

**Strategy 4 — Spoofed RR pings from nearby vantage points.** A vantage point geographically close to the client sends an RR ping with the server's IP as the source address (spoofed). Because the vantage point is closer, fewer forward hops are needed, leaving room in the RR header to capture return hops. The client's device responds to the spoofed source (the server), revealing reverse path hops. This spoofing is done with the consent and approval of all parties involved.

**Strategy 5 — Fallback symmetry assumption.** When a hop is unreachable by any other method, RevTr assumes the forward and reverse paths are symmetric at that hop. Intradomain symmetry (within the same AS) is generally safe; interdomain symmetry (crossing AS boundaries) is less reliable.

## Understanding Hop Types

Each hop in a reverse traceroute path is labeled with a `hop_type` field indicating which technique discovered it:

| Type | Name | Reliability |
|------|------|-------------|
| 1 | Destination (client) | Definitive |
| 3 | Intersected traceroute atlas | High |
| 4 | Intersected RR atlas | Moderate — can introduce apparent loops |
| 5 | Record-Route | High |
| 6 | Spoofed Record-Route | High |
| 11 | Assume symmetry (intradomain) | Generally safe |
| 12 | Assume symmetry (interdomain) | Less reliable — treat with caution |
| 2 | Assume symmetry (deprecated, pre-April 2025) | Replaced by types 11 and 12 |

For most analyses, use hops with types 1, 3, 5, 6, and 11. Treat type 12 with caution and inspect type 4 hops when you see unexpected loops in the AS-level or geographic path.

**A note on hop type 4:** Record-Route packets often expose different router interfaces than traceroute does, and alias resolution (determining which IPs belong to the same physical router) is imperfect. When a type 4 hop creates a loop in the geographic or AS-level path, M-Lab recommends removing just that hop and keeping the rest of the path.

## Fallback Probing Within the Destination ASN

When a target client is behind a NAT or firewall and drops all probes, RevTr looks for a responsive IP address within the same ASN (from the forward traceroute) and re-issues the reverse traceroute to that address. These retries are flagged with `raw.is_try_from_destination_AS = TRUE`. They often yield useful data but represent a substitution — consider whether this is acceptable for your analysis.

## Accessing Reverse Traceroute Data

### BigQuery

Reverse traceroute data is available in BigQuery. First, set up free access following the [BigQuery access setup guide](/kb/getting-started-bigquery).

The primary table is `measurement-lab.revtr_raw.revtr1`. Additional supporting tables:

| Table | Contents |
|-------|----------|
| `revtr_raw.revtr1` | One row per reverse traceroute, with full path and metadata |
| `revtr_raw.trace1` | Forward traceroutes from M-Lab servers to clients |
| `revtr_raw.traceatlas1` | Atlas of traceroutes from RIPE probes to M-Lab servers |
| `revtr_raw.ping1` | Standard and Record-Route pings |
| `revtr_raw.rankedspoofers1` | Vantage points ranked by proximity to measurement targets |

**Important:** always filter by `DATE(date)` in every query — the `date` field is required as a partition filter.

### Example Queries

**Query 1 — High-quality reverse paths only** (reaches destination, no interdomain symmetry, no type-4-induced loops):

<!-- sqltest -->
```sql
-- High quality reverse paths only
SELECT date, raw
FROM `measurement-lab.revtr_raw.revtr1`
WHERE DATE(date) = '2024-06-01'
  AND raw.stop_reason = 'REACHES'
  AND raw.is_try_from_destination_AS = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM UNNEST(raw.revtr_hops) AS hop
    WHERE hop.hop_type = 12
  )
  AND NOT EXISTS (
    SELECT 1 FROM UNNEST(raw.revtr_hops) AS outer_hop
    WHERE EXISTS (
      SELECT 1 FROM UNNEST(raw.revtr_hops) AS inner_hop
      WHERE outer_hop.geolocation_ipinfo.city = inner_hop.geolocation_ipinfo.city
        AND outer_hop.hop_number < inner_hop.hop_number - 1
        AND (outer_hop.hop_type = 4 OR inner_hop.hop_type = 4)
    )
  )
```

**Query 2 — Failure breakdown by reason:**

<!-- sqltest -->
```sql
-- Failure breakdown by reason
SELECT DATE(date) AS day, raw.fail_reason, COUNT(*) AS count
FROM `measurement-lab.revtr_raw.revtr1`
WHERE date BETWEEN '2024-06-01' AND '2024-06-07'
GROUP BY day, raw.fail_reason
ORDER BY day, count DESC
```

**Query 3 — Join forward and reverse paths for a given measurement:**

<!-- sqltest -->
```sql
-- Join forward and reverse paths
SELECT t1.raw AS revtr_data, t2.raw AS trace_data
FROM `measurement-lab.revtr_raw.revtr1` AS t1
CROSS JOIN UNNEST(t1.raw.revtr_hops) AS hop
JOIN `measurement-lab.revtr_raw.trace1` AS t2
  ON hop.measurement_id = t2.raw.revtr_measurement_id
WHERE t1.date = '2024-06-01' AND t2.date = '2024-06-01'
```

## Linking Reverse Traceroute to NDT Tests

Each reverse traceroute row contains `raw.uuid`, which is the M-Lab NDT test UUID. This allows you to join RevTr measurements with the corresponding NDT speed test result in `measurement-lab.ndt.ndt7_union` using the `id` field.

<!-- FIXME: Create article with worked example joining NDT + RevTr data for end-to-end path + performance analysis. -->

## How People Use Reverse Traceroute Data

**Network routing research** — RevTr provides visibility into asymmetric routing, which is a fundamental property of Internet paths that standard tools cannot observe.

**ISP performance diagnosis** — combining NDT performance results with bidirectional path information can help attribute poor performance to specific network segments or interconnects.

**Topology and atlas studies** — the atlas tables (traceatlas1, rankedspoofers1) are useful for researchers studying Internet topology and the structure of available measurement vantage points.

**Validation of forward-path measurements** — pairing forward traceroutes with reverse traceroutes allows researchers to assess how often measurements taken from one direction are representative of the full path.

## Citing Reverse Traceroute Data

> The M-Lab Reverse Traceroute Data Set, \<date range used\>. https://measurementlab.net/tests/reverse_traceroute

## Further Reading

- [RevTr 1.0 paper (NSDI '10)](https://www.measurementlab.net/publications/reverse-traceroute.pdf)
- [RevTr 2.0 paper (IMC '22)](https://dl.acm.org/doi/10.1145/3517745.3561422)
- [Setting Up Free BigQuery Access](/kb/getting-started-bigquery)
- [Traceroute (forward path)](/kb/core-service-traceroute)
- [NDT — the speed test paired with RevTr](/kb/test-ndt)
