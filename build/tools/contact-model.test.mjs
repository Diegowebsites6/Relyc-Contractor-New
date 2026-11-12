/* Data rules for the Contact page, adapted from the 2026-10-29 developer package.
   Usage: npm run test:contact */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import vm from 'node:vm';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const ctx = { URL, Date };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['contact-config.js', 'contact-model.js']) vm.runInContext(readFileSync(join(root, 'assets/js', f), 'utf8'), ctx);
const config = ctx.RELYC_FORM_CONFIG;
const model = ctx.RelycContactModel;
const plain = (v) => JSON.parse(JSON.stringify(v));

const contact = { company: 'Example Company', name: 'Alex Example', email: 'ALEX@example.com' };
const trade = (o = {}) => ({
  route: 'trade', confirmed: true,
  trades: ['trade_electrical'], capabilities: ['cap_electrical__lighting_and_controls'],
  data: { ...contact, serviceArea: 'Broward' }, ...o
});
const keys = (state) => plain(model.validate(state, config)).map((e) => e.key);
const meta = { pageUrl: 'http://x', submittedAt: 't', submissionId: 'id' };

const valid = {
  project: { projectName: 'P', location: 'Hialeah', scope: 'S' },
  bid: { projectName: 'P', location: 'Hialeah', scope: 'S', bidDeadline: '2026-12-01', bidTimeUnknown: true },
  trade: { serviceArea: 'Broward' },
  design: { disciplines: ['Architecture'] },
  supplier: { products: 'Steel' },
  equipment: { equipmentCategories: 'Cranes' },
  documents: { requestedDocuments: ['Capability Statement'] },
  general: { message: 'Hello' }
};

test('taxonomy ids are unique and every trade has capabilities', () => {
  const trades = config.tradeCatalog.flatMap((g) => g.trades);
  const caps = trades.flatMap((t) => t.capabilities);
  assert.equal(trades.length, 25);
  assert.equal(caps.length, 74);
  assert.equal(new Set(trades.map((t) => t.id)).size, trades.length);
  assert.equal(new Set(caps.map((c) => c.id)).size, caps.length);
});

test('all eight routes exist and a valid submission passes each', () => {
  assert.deepEqual(plain(Object.keys(config.routes)), ['project', 'bid', 'trade', 'design', 'supplier', 'equipment', 'documents', 'general']);
  for (const route of Object.keys(config.routes)) {
    assert.deepEqual(keys(trade({ route, data: { ...contact, ...valid[route] } })), [], route);
  }
});

test('step counts match the specification', () => {
  const n = (r) => config.routes[r].steps.length;
  assert.equal(n('trade'), 4);
  for (const r of ['project', 'bid', 'design', 'supplier', 'equipment']) assert.equal(n(r), 3);
  for (const r of ['general', 'documents']) assert.equal(n(r), 2);
});

test('trade payload uses stable ids and normalizes email', () => {
  const p = plain(model.makePayload(trade(), config));
  assert.equal(p.contact.email, 'alex@example.com');
  assert.equal(p.tradeSelections[0].tradeId, 'trade_electrical');
  assert.equal(p.tradeSelections[0].capabilityIds[0], 'cap_electrical__lighting_and_controls');
});

test('a capability from an unselected trade is rejected', () => {
  assert.ok(model.validateTradeSelections([{ tradeId: 'trade_electrical', capabilityIds: ['cap_plumbing__water_heaters'] }], config.tradeCatalog).length);
  assert.ok(keys(trade({ trades: ['trade_nonsense'], capabilities: [] })).includes('trades'));
});

test('capabilities left over from a removed trade are not sent', () => {
  const p = plain(model.makePayload(trade({ capabilities: ['cap_plumbing__water_heaters'] }), config));
  assert.deepEqual(p.tradeSelections[0].capabilityIds, []);
});

test('hidden fields from another path never leak', () => {
  const state = trade({ route: 'general', data: { ...contact, message: 'Question', licenseNumber: 'ABC123', projectName: 'SECRET' } });
  const body = JSON.stringify(plain(model.webhookBody(state, config, meta)));
  assert.equal(body.includes('ABC123'), false);
  assert.equal(body.includes('SECRET'), false);
  assert.equal(plain(model.makePayload(state, config)).tradeSelections.length, 0);
});

test('fields hidden by a licensing answer are not sent', () => {
  const state = trade({ data: { ...contact, serviceArea: 'B', licensingStatus: 'Need to confirm / discuss', licenseNumber: 'OLD' } });
  assert.equal(plain(model.makePayload(state, config)).details.licenseNumber, '');
});

test('Other / Specialty needs an explanation; licensing is conditional', () => {
  assert.ok(keys(trade({ trades: ['trade_other_specialty_trade'], capabilities: [] })).includes('additionalScope'));
  const lic = (s, extra = {}) => keys(trade({ data: { ...contact, serviceArea: 'B', licensingStatus: s, ...extra } }));
  assert.ok(lic('License(s) provided').includes('licenseNumber'));
  assert.ok(lic('Some scopes do not require a license').includes('licensingExplanation'));
  assert.deepEqual(lic('Need to confirm / discuss'), []);
  assert.deepEqual(lic(''), [], 'no license answer is required to contact Relyc');
});

test('company is required for partners only, and no empty company is created', () => {
  assert.ok(keys(trade({ data: { ...contact, company: '', serviceArea: 'B' } })).includes('company'));
  const state = trade({ route: 'general', data: { ...contact, company: '', message: 'Hi' } });
  assert.deepEqual(keys(state), []);
  assert.equal(plain(model.makePayload(state, config)).company, null);
});

test('names are not restricted to ASCII; limits are enforced', () => {
  const data = { ...contact, name: 'José Ñandú 李', message: 'x' };
  assert.deepEqual(keys(trade({ route: 'general', data })), []);
  assert.ok(keys(trade({ route: 'general', data: { ...data, name: 'x'.repeat(121) } })).includes('name'));
  assert.ok(keys(trade({ route: 'general', data: { ...data, message: 'x'.repeat(5001) } })).includes('message'));
});

test('only http and https links are accepted', () => {
  assert.equal(model.normalizeUrl('example.com'), 'https://example.com/');
  assert.equal(model.normalizeUrl('http://example.com/a'), 'http://example.com/a');
  for (const bad of ['javascript:alert(1)', 'ftp://example.com', 'data:text/html,x', 'not a link']) {
    assert.equal(model.normalizeUrl(bad), null, bad);
  }
});

test('bid deadline needs a time and zone, or an explicit unknown', () => {
  const bid = (extra) => keys(trade({ route: 'bid', data: { ...contact, ...valid.bid, bidTimeUnknown: false, ...extra } }));
  assert.ok(bid({}).includes('bidTime'));
  assert.ok(bid({ bidTime: '14:00' }).includes('bidTimezone'));
  assert.deepEqual(bid({ bidTime: '14:00', bidTimezone: 'Eastern Time' }), []);
  assert.deepEqual(bid({ bidTimeUnknown: true, bidTime: '14:00' }), []);
  assert.ok(bid({ bidDeadline: '2026-02-31', bidTimeUnknown: true }).includes('bidDeadline'));
});

test('document request needs a selection or a description', () => {
  assert.ok(keys(trade({ route: 'documents', data: contact })).includes('requirements'));
  assert.deepEqual(keys(trade({ route: 'documents', data: { ...contact, requirements: 'W-9' } })), []);
});

test('final submission requires the accuracy confirmation', () => {
  assert.ok(keys(trade({ confirmed: false })).includes('confirmed'));
});

test('webhook body has flat CRM keys and no client-set approval fields', () => {
  const b = plain(model.webhookBody(trade({ data: { ...contact, name: 'Alex Van Example', serviceArea: 'Broward' } }), config, meta));
  assert.equal(b.first_name, 'Alex');
  assert.equal(b.last_name, 'Van Example');
  assert.equal(b.form_name, 'Trade Partner Registration');
  assert.equal(b.trades, 'Electrical');
  assert.equal(b.capabilities, 'Electrical: Lighting & Controls');
  assert.equal(b.service_area, 'Broward');
  assert.ok(b.summary.includes('Service area: Broward'));
  for (const k of ['approvalStatus', 'reviewer', 'status']) assert.equal(k in b, false);
});
