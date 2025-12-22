#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const affectedFiles = [
  '2014_interconnection_report.md',
  'SIGCOMM2022.md',
  'africomm-afrinic.md',
  'assessing_haiyans_impact.md',
  'cloudflare-aimscoredata-announcement.md',
  'communities-driving-broadband-mapping.md',
  'contributing-mlab-infrastructure.md',
  'covid-19-response-dashboards.md',
  'data_duplication_writeup.md',
  'digital-inclusion-at-home.md',
  'exploring-geographic-limits-of-ip-geolocation.md',
  'global-pilot-entry.md',
  'global-pilot-success.md',
  'gsoc_2014.md',
  'imc22-hackathon.md',
  'inspiring-michigan-broadband-summit.md',
  'interconnection_and_measurement_update.md',
  'internet-preformance-igf.md',
  'long-term-schema-support-standard-columns.md',
  'measurement-observations-on-network-performance-during-the-COVID-19-pandemic-in-Northern-Italy.md',
  'michigan-moonshot.md',
  'mlab-20-platform-migration-update.md',
  'mlab-announcement.md',
  'mlab-hiring.md',
  'mlab-public-statement-samknows-experiment.md',
  'mlab-ripe.md',
  'mlab_asb2014.md',
  'modernizing-mlab.md',
  'most-ndt-clients-migrated-to-ndt7.md',
  'ndt-server-bug-fix-js-clients-update.md',
  'ndt7-introduction.md',
  'new-dataviz-site.md',
  'new-ndt-unified-views.md',
  'open-measurement-gathering-1.md',
  'overview-of-mlab-traceroute.md',
  'platform-transition-ndt-dataset-tables-views.md',
  'pt-bug-remediation.md',
  'research_update1.md',
  'retiring-neubot-client.md',
  'ripestat_mlab_widgets.md',
  'run-your-own-ndt-server.md',
  'scamper-data.md',
  'short-ndt.md',
  'speed-tests-accuracy.md',
  'supporting-internet-self-determination-at-the-2019-indigenous-connectivity-summit.md',
  'tcp-and-bbr.md',
  'traceroute-bq-newdata-available.md',
  'traceroute-bq-newdata-temporary-stop.md',
  'traffic-microbursts-and-their-effect-on-internet-measurement.md',
  'underload.md',
  'update_to_mlab_policies.md',
  'virtual-sites-gcp.md',
  'visualization-site-update.md'
];

const results = [];

for (const file of affectedFiles) {
  const filePath = `src/content/blog/${file}`;

  try {
    const diff = execSync(`git diff HEAD -- ${filePath}`, { encoding: 'utf8' });

    const imageSizing = (diff.match(/\{:\s*width=/g) || []).length;
    const layoutStyling = (diff.match(/\{:\.(pull-left|pull-right|center|circle-list|offset-box|inherit-width)/g) || []).length;
    const inlineStyles = (diff.match(/\{:style=/g) || []).length;
    const idSelectors = (diff.match(/\{:#/g) || []).length;

    // Only include if there are non-link-target changes
    if (imageSizing > 0 || layoutStyling > 0 || inlineStyles > 0 || idSelectors > 0) {
      results.push({
        file,
        imageSizing,
        layoutStyling,
        inlineStyles,
        idSelectors
      });
    }
  } catch (error) {
    // File might not have changes
  }
}

// Generate markdown table
console.log('| File | Image Sizing | Layout Styling | Inline Styles | ID Selectors |');
console.log('|------|--------------|----------------|---------------|--------------|');

for (const row of results) {
  console.log(`| ${row.file} | ${row.imageSizing || '-'} | ${row.layoutStyling || '-'} | ${row.inlineStyles || '-'} | ${row.idSelectors || '-'} |`);
}

console.log(`\n**Total files with non-link changes:** ${results.length}`);
