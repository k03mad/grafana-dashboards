import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {describe, it} from 'node:test';

interface DashboardV1 {
  __inputs: {
    name: string;
    label: string;
    description: string;
    type: string;
    pluginId: string;
    pluginName: string;
  }[];
}

interface DashboardV2 {
  apiVersion: string;
  kind: string;
  metadata: Record<string, unknown>;
  spec: Record<string, unknown>;
}

const DATA = {
  dashboards: {
    folders: ['export', 'export/archive'],
    ext: '.json',
  },
  check: {
    v1: {
      key: '__inputs',
      value: ['name', 'label', 'description', 'type', 'pluginId', 'pluginName'],
    },
    v2: {
      apiVersion: 'dashboard.grafana.app/v2',
      value: ['apiVersion', 'kind', 'metadata', 'spec'],
    },
  },
} as const;

const dashboards = await Promise.all(
  DATA.dashboards.folders.map(async folderPath => {
    const ls = await fs.readdir(folderPath);
    const files = ls.filter(elem => elem.endsWith(DATA.dashboards.ext));

    return {folderPath, files};
  }),
);

dashboards.forEach(({folderPath, files}) => {
  describe(folderPath, () => {
    files.forEach(filePath => {
      it(filePath, async () => {
        const content = await fs.readFile(path.join(folderPath, filePath));
        const parsed = JSON.parse(content.toString()) as DashboardV1 | DashboardV2;

        if ('apiVersion' in parsed && parsed.apiVersion === DATA.check.v2.apiVersion) {
          assert.deepEqual(
            Object.keys(parsed),
            DATA.check.v2.value,
            `failed export file: ${filePath}`,
          );
        } else {
          const input = (parsed as DashboardV1)[DATA.check.v1.key].pop();

          assert.ok(input, `failed export file: ${filePath}`);

          assert.deepEqual(
            Object.keys(input as NonNullable<typeof input>),
            DATA.check.v1.value,
            `failed export file: ${filePath}`,
          );
        }
      });
    });
  });
});
