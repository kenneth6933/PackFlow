
import test from 'node:test';import assert from 'node:assert/strict';import {dateRange,inDateRange} from '../dist/date-range.js';
test('Singapore today crosses UTC midnight',()=>assert.deepEqual(dateRange('today',new Date('2026-10-31T16:00:00Z')),{start:'2026-11-01',end:'2026-11-01'}));
test('Yesterday crosses year boundary',()=>assert.deepEqual(dateRange('yesterday',new Date('2026-01-01T04:00:00Z')),{start:'2025-12-31',end:'2025-12-31'}));
test('Last month handles January',()=>assert.deepEqual(dateRange('lastMonth',new Date('2026-01-10T00:00:00Z')),{start:'2025-12-01',end:'2025-12-31'}));
test('This month handles leap February',()=>assert.deepEqual(dateRange('thisMonth',new Date('2028-02-10T00:00:00Z')),{start:'2028-02-01',end:'2028-02-29'}));
test('Custom inclusive Singapore boundaries',()=>{const r=dateRange('custom',new Date(),'2026-10-01','2026-10-31');assert.ok(inDateRange('2026-09-30T16:00:00Z',r));assert.ok(inDateRange('2026-10-31T15:59:59Z',r));assert.equal(inDateRange('2026-10-31T16:00:00Z',r),false);assert.throws(()=>dateRange('custom',new Date(),'2026-11-01','2026-10-01'));});
