import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {describe, it} from 'node:test';

import {getCurrentFilename} from './helpers/path.js';

const testName = getCurrentFilename(import.meta.url);

describe(testName, () => {
    const DATA = {
        dashboards: {
            dir: 'export',
        },
        check: {
            key: '__inputs',
            value: [
                'name',
                'label',
                'description',
                'type',
                'pluginId',
                'pluginName',
            ],
        },
    };

    let dashboardsFiles, jsonsContent;

    it('should get all dashboard exports dir', async () => {
        dashboardsFiles = await fs.readdir(DATA.dashboards.dir);
    });

    it('should get all dashboard exports json', async () => {
        jsonsContent = await Promise.all(
            dashboardsFiles.map(async file => {
                const content = await fs.readFile(path.join(DATA.dashboards.dir, file), {encoding: 'utf8'});
                return {file, content};
            }),
        );
    });

    it('all jsons should have correct inputs key', () => {
        for (const json of jsonsContent) {
            assert.deepEqual(
                Object.keys(JSON.parse(json.content)[DATA.check.key].pop()),
                DATA.check.value,
                `failed export file: ${json.file}`,
            );
        }
    });
});
