---
permalink: mlab-annotations-explained
title: "M-Lab Network Annotations: Geolocation, ASNs, and What They Mean"
chapter: Accessing Data
chapterOrder: 5
order: 3
status: published
description: How M-Lab annotates measurements with geographic and network metadata, the accuracy and limitations of each annotation type, and how to use them correctly in analysis.
tags: [data-access, internet-quality]
difficulty: intermediate
---

Every M-Lab measurement is enriched with metadata about the client's network and location — **annotations**. Understanding what these annotations represent (and where they fall short) is essential for doing rigorous analysis with M-Lab data.

## How Annotations Are Added

Annotations are applied **after** a test completes, during M-Lab's data processing pipeline. The pipeline takes the client's IP address and looks it up against several databases to add:

- **Geographic location** (country, region, city, lat/lon) from MaxMind GeoLite2
- **Autonomous System Number (ASN)** from RouteViews and CAIDA prefix-to-AS data
- **AS name** from IPinfo's ASN database

This means annotations reflect the state of these databases at the time the test is processed, not necessarily at the time of testing.

## Geographic Annotations

### Fields Available

```
client.Geo.CountryCode        — ISO 3166-1 alpha-2 (e.g., "US", "DE", "BR")
client.Geo.CountryName        — Human-readable country name
client.Geo.Region             — ISO 3166-2 subdivision (e.g., "US-CA" for California)
client.Geo.City               — City name (MaxMind estimate)
client.Geo.Latitude           — Latitude (see accuracy notes below)
client.Geo.Longitude          — Longitude (see accuracy notes below)
client.Geo.PostalCode         — Postal code (US only, unreliable)
client.Geo.AccuracyRadiusKm   — Estimated accuracy radius in km
```

### Accuracy and Limitations

**Country-level** IP geolocation is generally suitable for coarse aggregation, especially in major markets, but it should still be treated as an inferred database annotation rather than ground truth.

**City-level** geolocation is much less reliable. Published accuracy numbers can be misleading because they depend on the evaluation dataset, the definition of “city-level,” and the type of IP address being geolocated.

**Coordinates are representative locations, not exact user or server locations.** In M-Lab data, latitude and longitude should not be interpreted as device-level coordinates for clients or as exact physical coordinates for M-Lab servers. Many measurements attributed to the same city may share the same coordinate, often corresponding to a city centroid or another representative database location. This means that both the client-side and server-side coordinates are useful for coarse geographic aggregation, but not for neighborhood-, building-, or infrastructure-level analysis.

**Do not use latitude/longitude for fine-grained spatial analysis** Even when coordinates appear precise, the underlying geolocation may only be accurate at city scale. For sub-national analysis, prefer `client.Geo.Region` over point coordinates when state/province-level aggregation is sufficient.

**Rural, mobile, and less-populated areas require particular caution.** Geolocation quality varies substantially by region, ISP, access technology, and address block. Errors are not uniform, so a single global accuracy number can obscure the cases where geolocation is least reliable. Recent measurement work shows that errors can vary by network type and geography: fixed-network IPs may have relatively small median errors, while mobile and Global South prefixes can have much larger errors and higher failure rates (see, for example, ["Lost in the Prefix: Revisiting IP Geolocation Accuracy Across Networks and Geographies"](https://arxiv.org/pdf/2605.21937)).

### Improving Spatial Precision

If your analysis requires finer geographic resolution:

1. **Filter by accuracy radius** — use `client.Geo.AccuracyRadiusKm`, but treat it as a confidence signal rather than a guarantee.
2. **Use M-Lab server-selection metadata to identify likely errors** — M-Lab uses one geolocation system at test time to select a nearby server and another system to annotate the public dataset. As described in M-Lab blog post [Improving M-Lab Geolocation](https://measurementlab.net/blog/improving-m-lab-geolocation), researchers can compare the server that actually served the test with the nearest server implied by the published client geolocation. Large inconsistencies between the two can flag potentially incorrect client geolocation. 
3. **Avoid overinterpreting city labels** — city-level labels are useful for coarse aggregation, not for neighborhood-, block-, or infrastructure-level claims.
4. **Aggregate spatially** — use larger geographic cells or administrative regions rather than individual latitude/longitude points.
5. **Use `Region` for sub-national analysis** — ISO 3166-2 region codes are generally more appropriate for state/province-level analysis than city centroids.
6. **Validate with supplementary sources when precision matters** — for rural, mobile, infrastructure-specific, or policy-sensitive analyses, M-Lab’s built-in geolocation should be supplemented with additional geolocation sources or ground-truth validation.

M-Lab’s built-in geolocation is appropriate for coarse spatial summaries, but it is not suitable for block-level, household-level, or infrastructure-specific analysis without additional validation.

### Region Codes

M-Lab uses ISO 3166-2 codes for subdivisions such as states and provinces:

<!-- sqltest -->
```sql
-- US state-level analysis
SELECT
  client.Geo.Region AS state_code,
  COUNT(*) AS tests,
  ROUND(AVG(a.MeanThroughputMbps), 2) AS avg_mbps
FROM `measurement-lab.ndt.ndt7`
WHERE client.Geo.CountryCode = 'US'
  AND date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY state_code
ORDER BY tests DESC;
### Improving Spatial Precision
```

## Network Annotations (ASN)

### Fields Available

```
client.Network.ASNumber     — Autonomous System Number (integer)
client.Network.ASName       — AS name from MaxMind (e.g., "Comcast Cable")
client.Network.CIDR         — IP prefix the client address belongs to (e.g., "73.0.0.0/8")
```

### What ASN Annotations Mean

ASN annotations identify the Autonomous System that appears to originate the prefix containing the client IP address in the routing data used by M-Lab’s annotation pipeline. In practice, this makes `ASNumber` a useful way to group measurements by network.

IP-to-AS mappings are derived from routing data and can be affected by route visibility, MOAS prefixes, third-party address use, resellers, VPNs, and stale or coarse-grained prefix mappings. They identify the AS announcing the client prefix, not necessarily the user’s retail ISP. ASN annotations should thus be treated as inferred metadata rather than perfect ground truth. 

The accompanying `ASName` field provides a human-readable name for that ASN. This name is useful for display and interpretation, but it should not be treated as a stable identifier. For ISP comparisons, prefer `ASNumber` over `ASName`. AS names can change due to mergers and rebranding, whereas ASNs are more stable identifiers. Even so, some organizations operate multiple ASNs, and some ASNs contain multiple brands or customer populations. 

<!-- sqltest -->
```sql
-- Top ISPs by test volume in a country
SELECT
  client.Network.ASNumber AS asn,
  MAX(client.Network.ASName) AS isp_name,   -- stable within ASN
  COUNT(*) AS test_count,
  ROUND(APPROX_QUANTILES(a.MeanThroughputMbps, 100)[OFFSET(50)], 2) AS median_mbps
FROM `measurement-lab.ndt.ndt7`
WHERE client.Geo.CountryCode = 'BR'
  AND date BETWEEN '2024-01-01' AND '2024-03-31'
GROUP BY asn
HAVING test_count > 1000
ORDER BY test_count DESC
```

### Corporate vs. Residential Networks

A single ASN may include both corporate and residential customers. Comcast's AS7922, for example, includes business customers who may have very different service tiers than residential subscribers. For research on residential broadband specifically, consider filtering by test source (app/platform embedding) if that metadata is available.

## Geolocation Improvements Over Time

M-Lab has invested in improving geolocation accuracy. Key milestones:

- **2022** — Updated to MaxMind GeoLite2, added ISO 3166-2 region codes
- **2023** — Added metadata tracking geolocation database vintage (which version of MaxMind was used)
- **2025** — Ongoing work to improve accuracy for underrepresented regions

## Matching M-Lab Data to Other Datasets

When joining M-Lab data with external datasets (census, FCC broadband maps, etc.):

| Join level | Reliability | Recommended approach |
|-----------|------------|----------------------|
| Country | High | `CountryCode` |
| State/Province | High/Medium | `Region` (ISO 3166-2) |
| City | Medium | `City` name, but validate with test counts |
| ZIP/Postal | Low | Use sparingly, US only |
| Lat/Lon | Low | Only for coarse (50+ km) spatial analysis |

