import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {describe, it} from 'node:test';

const DATA = {
    dashboards: {
        folders: [
            'export',
            'export/archive',
        ],
        ext: '.json',
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

const dashboards = await Promise.all(DATA.dashboards.folders.map(async folderPath => {
    const ls = await fs.readdir(folderPath);
    const files = ls.filter(elem => elem.endsWith(DATA.dashboards.ext));

    return {folderPath, files};
}));

dashboards.forEach(({folderPath, files}) => {
    describe(folderPath, () => {
        files.forEach(filePath => {
            it(filePath, async () => {
                const content = await fs.readFile(path.join(folderPath, filePath));

                assert.deepEqual(
                    Object.keys(JSON.parse(content)[DATA.check.key].pop()),
                    DATA.check.value,
                    `failed export file: ${filePath}`,
                );
            });
        });
    });
});
