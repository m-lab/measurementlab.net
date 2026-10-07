---
permalink: byos-overview
title: "Running Your Own M-Lab Node: The BYOS Program"
chapter: Running a Node
chapterOrder: 7
order: 1
status: published
description: "An overview of M-Lab's Bring Your Own Server program — what it is, what's required, and how hosting a node contributes to global internet measurement."
tags: [Node Operations]
difficulty: intermediate
---

# Setting Up a Host-Managed M-Lab Server

---

## Quick Navigation
1. [Registration](#registration)
2. [Requirements](#requirements)
3. [Eligibility](#eligibility)
4. [Software Deployment](#software-deployment)
5. [Operations & Monitoring](#operations--monitoring)

---

## Registration

**Start here:** Complete the [Infrastructure Contribution Form](https://docs.google.com/forms/d/e/1FAIpQLSejtmZJrW8BPuuhjG4FlGm0fFmN3cW6onvLsCxkd3UnECVd9Q/viewform?usp=dialog), which includes agreeing to M-Lab's:
- [Acceptable Use Policy](/aup)
- [Privacy Policy](/privacy)
- Technical Requirements (listed below)

**What happens next:**

| Step | Action |
|------|--------|
| 1 | M-Lab reviews your submission |
| 2 | M-Lab confirms eligibility |
| 3 | M-Lab provides your API key and configuration details |

> **Note:** If you contribute more than 10 servers or are otherwise exceptional, M-Lab may propose a Memorandum of Understanding (MoU).

---

## Requirements

### Server Requirements

#### Hardware
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 × 2 GHz (Intel class) | More is better at busy sites |
| RAM | 4 GB | More is better at busy sites |
| Disk | 50 GB | 100 GB or more |

> **Why the disk recommendation?** Under normal operation, measurement data uploads to M-Lab's archive and is removed locally. If the upload is interrupted, data accumulates until the connection is restored. Typical nodes generate ~4 GB/month; busy nodes can reach 20 GB/month or more.

#### Machine Type
- Physical or virtual machines are both acceptable
- The underlying hardware **must not** carry significant shared workloads

#### Operating System
- A reasonably up-to-date Linux distribution that supports:
  - `tcp_bbr` kernel module
  - Docker
- No known distro restrictions; M-Lab has tested with **Ubuntu** and **Debian**

#### Network
| Requirement | Specification |
|-------------|--------------|
| IPv4 | 1 static address |
| IPv6 | 1 static address *(may be waived in regions where IPv6 is not adequately deployed)* |
| Uplink | 10 Gb/s preferred; minimum = the greater of 1 Gb/s or 2× the fastest locally available consumer-grade connection |

> **Uplink example:** If 1 Gb/s consumer connections are available locally, your server needs at least 2 Gb/s.

#### Firewall — Required Open Ports
| Port | Purpose |
|------|---------|
| 80 | Unencrypted NDT tests |
| 443 | Encrypted NDT tests |
| 9990–9999 | Monitoring |

---

### Operational Requirements

Host organizations must:

- [ ] Keep contact information at M-Lab up to date
- [ ] Monitor email from **host-managed@measurementlab.net**
- [ ] Respond promptly to M-Lab team requests
- [ ] Apply operating system updates as needed
- [ ] Reinstall M-Lab software when requested *(further automation is planned)*
- [ ] Provide their own server health monitors and alerts
- [ ] Monitor traffic volumes and server loads, adjusting serving probability as necessary

---

## Eligibility

M-Lab accepts contributions from **organizations only** — not individuals.

### Eligible Organization Types
- Internet service providers, hosting providers, and network operators
- Universities, research institutions, and public-sector bodies
- Non-profits operating network infrastructure or public internet services
- Other organizations operating publicly documented internet services

### What Your Organization Must Provide

| Requirement | Details |
|-------------|---------|
| Verifiable public presence | A working website, registry entry, or equivalent that confirms the organization exists and that you are authorized to represent it |
| NOC/support email | Must use your organization's own domain — personal addresses (e.g. @gmail.com, @outlook.com, @yahoo.com) are **not** accepted |
| Named point of contact | A designated individual responsible for server health and for responding to messages from host-managed@measurementlab.net |

---

## Software Deployment

### Step 1 — Clone the Repository

Location on the machine does not matter:

```bash
git clone https://github.com/m-lab/autonode
cd autonode
```

Services run in **Docker containers** managed by **Docker Compose**. The configuration file is `docker-compose.yml` in the repository root.

---

### Step 2 — Configure Docker Logging

Docker's default logging driver (`json-file`) does not rotate logs. The containers in this stack generate significant log output, which can fill your disk over time.

**Fix:** Configure Docker to use the `local` logging driver, which rotates logs automatically.

Add the following to `/etc/docker/daemon.json` (create the file if it doesn't exist):

```json
{
  "log-driver": "local"
}
```

Then restart the Docker daemon:

```bash
sudo systemctl restart docker
```

---

### Step 3 — Configure Environment Variables

> **Do not modify** `docker-compose.yml`. All user-configurable settings belong in the `env` file.

#### Environment Variable Reference

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `ORGANIZATION` | Organization name assigned by M-Lab after registration | `myorg` |
| `API_KEY` | API key provided by M-Lab after registration | *(provided by M-Lab)* |
| `IATA` | 3-character IATA code of the nearest airport that exists in the [ip2location IATA/ICAO database](https://github.com/ip2location/ip2location-iata-icao/). M-Lab can assist if needed. | `ORD` |
| `PROBABILITY` | Probability (0.0–1.0) that the Locate Service considers your server as a candidate for each request. Use this to regulate traffic load — see [Test Volume and Probability](#test-volume-and-probability). | `0.5` |
| `INTERFACE_NAME` | Name of the primary network interface | `eth0`, `enp114s0` |
| `UPLINK` | Internet connection speed in Gb/s (integer + "g") | `1g`, `10g` |
| `INTERFACE_MAXRATE` | Bitrate threshold (bits/second) above which the NDT server refuses new connections, preventing uplink saturation and inaccurate measurements. Recommended: 70% of uplink capacity. If set lower, also reduce `PROBABILITY` to avoid unnecessary user errors. | `7000000000` *(for 10 Gb/s × 70%)* |
| `IPV4` | Public IPv4 address of the primary network interface | `203.0.113.10` |
| `IPV6` | Public IPv6 address of the primary network interface | `2001:db8::1` |
| `TYPE` | Machine type | `physical` or `virtual` |

<!-- TODO(robertodauria,bassosimone): the INTERFACE_MAXRATE guidance above says 70% of uplink capacity, but m-lab/autonode `env` recommends 150000000 (15%) for 1G and 7000000000 (70%) for 10G. Which one is right? -->

---

### Step 4 — Start the Services

```bash
# Load the tcp_bbr kernel module now, and configure it to load on every reboot
sudo modprobe tcp_bbr
# Recommended: add "tcp_bbr" to /etc/modules for persistence across reboots

# Verify environment and credentials (press Ctrl-C to stop when done)
docker compose --profile check-config --env-file env up

# Start the NDT service in the background (auto-restarts on reboot)
docker compose --profile ndt --env-file env up -d
```

If no errors appear, your machine should begin receiving production M-Lab tests **within about one minute**.

---

## Operations & Monitoring

### Test Volume and Probability

Your M-Lab node will receive traffic from **many networks**, not just your own. The M-Lab Locate Service directs clients to the geographically closest server — this applies to your own users and users on other networks alike.

> **Important:** M-Lab does **not** use network topology or latency (e.g., RTT) to select servers. Selection is based entirely on geolocation.

Use the `PROBABILITY` variable to control how often the Locate Service sends traffic to your server. Note that this affects your own network's users as well.

**To apply any change to `PROBABILITY` (or any other parameter):**

```bash
docker compose --profile ndt --env-file env down
docker compose --profile ndt --env-file env up -d
```

---

### Server Selection — How It Works

| Factor | Used? |
|--------|-------|
| Geographic distance | ✅ Yes — primary criterion |
| Network topology | ❌ No |
| Latency / RTT | ❌ No |
| Same network/country | ❌ No |

This design is **intentional** — M-Lab specifically tests interconnects. M-Lab acknowledges that in some regions, international interconnection is expensive or impractical, and is considering adding an in-country bias option for those cases.

**Geolocation method:** The Locate Service uses Google App Engine's built-in geolocation, falling back to a Maxmind GeoLite2 database when App Engine cannot geolocate a client.

> **Debugging tip:** Use your browser's developer tools to inspect the `X-LOCATE-CLIENTLATLON` and `X-LOCATE-CLIENTLATLON-METHOD` response headers from the Locate Service.

---

### Automatic DNS Hostname

Once running, your server automatically receives a public DNS name from the Autojoin API:

```
ndt-<IATA><ASN>-<IPv4_HEX>.<ORGANIZATION>.autojoin.measurement-lab.org
```

| Placeholder | Meaning |
|-------------|---------|
| `IATA` | 3-letter IATA code from your configuration |
| `ASN` | AS number of the machine's IPv4 address (determined automatically via CAIDA Routeviews) |
| `IPv4_HEX` | Hexadecimal representation of the machine's IPv4 address |
| `ORGANIZATION` | Your organization name |

**Example:**
```
ndt-oma396982-22486078.mlab.autojoin.measurement-lab.org
```

---

### Prometheus Metrics Endpoints

M-Lab collects metrics from your server but **will not alert you** to problems. Set up your own monitoring and alerting.

| Service | Endpoint |
|---------|----------|
| ndt-server | `http://<hostname/ip>:9990/metrics` |
| jostler | `http://<hostname/ip>:9991/metrics` |
| uuid-annotator | `http://<hostname/ip>:9992/metrics` |
| heartbeat | `http://<hostname/ip>:9993/metrics` |
| traceroute-caller | `http://<hostname/ip>:9994/metrics` |
| node_exporter | `http://<hostname/ip>:9995/metrics` |

**Most useful for host operators:**

- **`ndt-server`** — track test rates using the `ndt7_client_test_results_total` metric
- **`node_exporter`** — monitor CPU, memory, disk, and other system resources

**Example PromQL query** — ndt7 subtests (downloads plus uploads) served per minute:

```promql
60 * sum(rate(ndt7_client_test_results_total{result!="error-without-rate"}[5m]))
```

> Many tutorials are available online for setting up Prometheus scraping and Grafana dashboards.

---

### Calibration

M-Lab monitors server resource consumption and data accuracy. M-Lab may:
- Ask you to make configuration changes or improvements
- Reduce your test volume if results are deemed inaccurate, in order to protect overall data quality

---

## Autojoin — What Happens Automatically

Once your machine is running, the following occur without manual intervention:

<img width="1460" height="923" alt="image" src="https://github.com/user-attachments/assets/8099fa87-dcf2-4398-be23-f917e755493e" />


```
Register with Autojoin API
        ↓
Distribute credentials & metadata to local services
        ↓
Report node health to Locate API
        ↓
Clients run NDT tests targeting this node
        ↓
NDT measurements are archived
        ↓
NDT measurements are published to BigQuery
```
