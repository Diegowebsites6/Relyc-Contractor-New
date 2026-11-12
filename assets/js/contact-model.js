/* ============================================================
   RELYC CONTRACTOR — Contact page data rules
   Field definitions, validation and the outgoing request. Holds
   no DOM or network code, so build/tools/contact-model.test.mjs
   can run it. Everything here runs in the visitor's browser:
   it is not a substitute for server validation.
   ============================================================ */
(function () {
  'use strict';

  var PROJECT_TYPES = ['New Construction', 'Renovation / Tenant Improvements', 'Repair & Maintenance', 'Roofing / Envelope', 'Sitework / Structural', 'Other'];
  var SHARED_KEYS = ['company', 'name', 'email', 'phone', 'city', 'website'];
  var SPECIALTY_TRADES = ['trade_other_specialty_trade', 'trade_other_support', 'trade_other_finishes', 'trade_other_life_safety'];
  var LICENSE_PROVIDED = 'License(s) provided';
  var LICENSE_NONE = 'Some scopes do not require a license';
  var PICTURES = ['pdf', 'jpg', 'jpeg', 'png'];
  var DOCUMENTS = PICTURES.concat(['doc', 'docx']);
  var SHEETS = DOCUMENTS.concat(['xls', 'xlsx']);
  var UPLOAD_RULES = { maxFileBytes: 10485760, maxFilesPerInquiry: 20, maxTotalBytes: 52428800 };
  var BUCKETS = {
    trade: [
      { id: 'licenses', title: 'Licenses & certifications', desc: 'Applicable licenses, certifications or registrations.', accept: PICTURES },
      { id: 'insurance', title: 'Insurance documents', desc: 'Current certificate of insurance or supporting coverage documents.', accept: PICTURES },
      { id: 'capability', title: 'Capabilities & references', desc: 'Company profile, project list or references.', accept: DOCUMENTS },
      { id: 'additional', title: 'Additional documents', desc: 'Any other material you would like us to review.', accept: SHEETS }
    ],
    design: [{ id: 'profile', title: 'Firm profile & portfolio', desc: 'Company qualifications, project examples or professional credentials.', accept: DOCUMENTS }],
    supplier: [{ id: 'linecard', title: 'Line cards & catalogs', desc: 'Product information, manufacturer lines or company capabilities.', accept: SHEETS }],
    equipment: [{ id: 'equipment', title: 'Equipment list & company profile', desc: 'Available equipment, specifications or service information.', accept: SHEETS }]
  };
  var SUPPORTING = [{ id: 'supporting', title: 'Supporting documents', desc: 'Drawings, scope documents, photos or related requirements.', accept: SHEETS }];

  function f(key, label, type, opts) {
    var o = opts || {};
    o.key = key; o.label = label; o.type = type;
    return o;
  }

  function contactFields(route, config) {
    var partner = config.partnerTypes.indexOf(route) !== -1;
    var list = [
      f('company', route === 'design' ? 'Firm name' : 'Company / organization', 'text', { max: 200, required: partner, autocomplete: 'organization', full: true, message: 'Enter your company or firm name.' }),
      f('name', 'Your name', 'text', { max: 120, required: true, autocomplete: 'name', message: 'Enter your name.' }),
      f('email', 'Email address', 'email', { max: 254, required: true, autocomplete: 'email', message: 'Enter a valid email address.' }),
      f('phone', 'Phone', 'tel', { max: 40, autocomplete: 'tel' }),
      f('city', 'Company city / state', 'text', { max: 160, autocomplete: 'address-level2' })
    ];
    if (partner) list.push(f('website', 'Website', 'url', { max: 2048, full: true, autocomplete: 'url', placeholder: 'https://', message: 'Enter a valid http or https link.' }));
    return list;
  }

  var ROUTE_FIELDS = {
    project: {
      details: [
        f('projectName', 'Project name / short description', 'text', { max: 200, required: true, full: true, message: 'Enter a project name or short description.' }),
        f('location', 'Project location', 'text', { max: 300, required: true, placeholder: 'City / county or address', message: 'Enter the project location.' }),
        f('projectType', 'Project type', 'select', { options: PROJECT_TYPES }),
        f('scope', 'Scope / details', 'textarea', { max: 5000, required: true, message: 'Describe the scope.' }),
        f('targetTimeline', 'Target timeline', 'text', { max: 200, placeholder: 'Or not yet established' }),
        f('estimatedBudget', 'Estimated budget', 'text', { max: 120, placeholder: 'Range or not yet established' })
      ]
    },
    bid: {
      details: [
        f('projectName', 'Project / solicitation name', 'text', { max: 200, required: true, full: true, message: 'Enter the project or solicitation name.' }),
        f('location', 'Project location', 'text', { max: 300, required: true, message: 'Enter the project location.' }),
        f('projectType', 'Project type', 'select', { options: PROJECT_TYPES }),
        f('scope', 'Scope to price', 'textarea', { max: 5000, required: true, message: 'Describe the scope to price.' }),
        f('bidDeadline', 'Bid due date', 'date', { required: true, full: true, message: 'Enter a valid bid due date.' }),
        f('bidTime', 'Bid due time', 'time', { unlessKey: 'bidTimeUnknown', required: true, message: 'Enter the due time, or mark it as not known.' }),
        f('bidTimezone', 'Time zone', 'select', { options: ['Eastern Time', 'Central Time'], unlessKey: 'bidTimeUnknown', required: true, message: 'Choose the time zone.' }),
        f('bidTimeUnknown', 'The due time is not known yet', 'check', {}),
        f('planRoomUrl', 'Plan-room / document link', 'url', { max: 2048, full: true, placeholder: 'https://', message: 'Enter a valid http or https link.' })
      ]
    },
    trade: {
      trades: [
        f('additionalScope', 'Other scopes or specialties', 'textarea', { max: 5000, requiredIf: hasSpecialty, message: 'Describe your Other / Specialty scope.' }),
        f('relevantExperience', 'Relevant experience', 'textarea', { max: 5000 }),
        f('references', 'Project references', 'textarea', { max: 5000, hint: 'Include third-party contact details only with their permission.' }),
        f('serviceArea', 'Service area', 'text', { max: 1000, required: true, full: true, placeholder: 'Counties, cities or regions', message: 'Enter your service area.' }),
        f('typicalProjectSize', 'Typical subcontract value', 'select', { options: ['Under $25,000', '$25,000–$100,000', '$100,000–$500,000', '$500,000–$1 million', 'Over $1 million', 'Varies by scope'] }),
        f('availability', 'Availability', 'select', { options: ['Available now', 'Within 30 days', 'Within 60–90 days', 'Depends on project'] })
      ],
      qualifications: [
        f('licensingStatus', 'Licensing for selected scopes', 'select', { full: true, options: [LICENSE_PROVIDED, LICENSE_NONE, 'Need to confirm / discuss'] }),
        f('licenseNumber', 'License number(s)', 'text', { max: 300, showIf: licenseProvided, required: true, message: 'Enter your license number.' }),
        f('licenseExpiration', 'Expiration date', 'date', { showIf: licenseProvided, message: 'Enter a valid date.' }),
        f('licensingExplanation', 'Licensing explanation', 'textarea', { max: 5000, showIf: licenseNone, required: true, message: 'Explain the scopes without an applicable license.' })
      ]
    },
    design: {
      details: [
        f('disciplines', 'Professional disciplines', 'checks', { required: true, options: ['Architecture', 'Civil Engineering', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Plumbing Engineering', 'Other Consulting'], message: 'Choose at least one discipline.' }),
        f('serviceArea', 'Service area', 'text', { max: 1000, full: true }),
        f('relevantExperience', 'Relevant experience / firm specialties', 'textarea', { max: 5000 })
      ]
    },
    supplier: {
      details: [
        f('products', 'Products / materials', 'textarea', { max: 5000, required: true, message: 'Describe the products you supply.' }),
        f('manufacturers', 'Manufacturers / brands represented', 'text', { max: 1000, full: true }),
        f('deliveryArea', 'Delivery / service area', 'text', { max: 1000, full: true }),
        f('leadTimeNotes', 'Lead times / supply capabilities', 'textarea', { max: 5000 })
      ]
    },
    equipment: {
      details: [
        f('services', 'Services offered', 'checks', { options: ['Equipment Rental', 'Equipment Sales', 'Repair & Service', 'Operator-Included Services', 'Delivery & Pickup', 'Other'] }),
        f('equipmentCategories', 'Equipment categories / capacity', 'textarea', { max: 5000, required: true, message: 'Describe the equipment you provide.' }),
        f('serviceArea', 'Service / delivery area', 'text', { max: 1000, full: true }),
        f('availabilityNotes', 'Availability / support', 'textarea', { max: 5000 })
      ]
    },
    documents: {
      contact: [
        f('requestedDocuments', 'Documents needed', 'checks', { options: ['Capability Statement', 'Insurance Information', 'License Information', 'Safety / Quality Information', 'Prequalification / Compliance Information', 'Other'] }),
        f('relatedProject', 'Related project', 'text', { max: 200, full: true }),
        f('requirements', 'Specific requirements', 'textarea', { max: 5000, message: 'Choose documents or describe the request.' })
      ]
    },
    general: {
      contact: [
        f('subject', 'Subject', 'text', { max: 200, full: true }),
        f('message', 'Message', 'textarea', { max: 5000, required: true, message: 'Enter a message.' })
      ]
    }
  };

  function text(v) { return String(v == null ? '' : v).trim(); }
  function list(v) { return Array.isArray(v) ? v.map(text).filter(Boolean) : []; }
  function isSpecialtyTrade(id) { return SPECIALTY_TRADES.indexOf(id) !== -1; }
  function hasSpecialty(state) { return (state.trades || []).some(isSpecialtyTrade); }
  function licenseProvided(state) { return (state.data || {}).licensingStatus === LICENSE_PROVIDED; }
  function licenseNone(state) { return (state.data || {}).licensingStatus === LICENSE_NONE; }

  function fieldsFor(route, stepKey, config) {
    var own = (ROUTE_FIELDS[route] && ROUTE_FIELDS[route][stepKey]) || [];
    return stepKey === 'contact' ? contactFields(route, config).concat(own) : own;
  }

  function allFields(route, config) {
    return config.routes[route].steps.reduce(function (out, step) {
      return out.concat(fieldsFor(route, step.key, config).map(function (field) { return { field: field, step: step.key }; }));
    }, []);
  }

  function isActive(field, state) {
    if (field.showIf && !field.showIf(state)) return false;
    return !(field.unlessKey && (state.data || {})[field.unlessKey]);
  }

  function isRequired(field, state) {
    if (!isActive(field, state)) return false;
    return !!(field.required || (field.requiredIf && field.requiredIf(state)));
  }

  // Only http/https links survive; a bare domain is treated as https.
  function normalizeUrl(value) {
    var v = text(value);
    if (!v) return '';
    if (v.indexOf('://') === -1) {
      if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(v)) return null;
      v = 'https://' + v;
    }
    try {
      var u = new URL(v);
      if ((u.protocol !== 'http:' && u.protocol !== 'https:') || u.hostname.indexOf('.') === -1) return null;
      return u.href;
    } catch (e) { return null; }
  }

  function validDate(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    var d = new Date(v + 'T00:00:00Z');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }

  function fieldError(field, state) {
    var raw = (state.data || {})[field.key];
    if (field.type === 'check') return '';
    if (field.type === 'checks') return isRequired(field, state) && !list(raw).length ? field.message : '';
    var v = text(raw);
    if (!v) return isRequired(field, state) ? (field.message || 'Complete this field.') : '';
    if (field.max && v.length > field.max) return field.label + ' must be ' + field.max + ' characters or fewer.';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return field.message;
    if (field.type === 'url' && normalizeUrl(v) === null) return field.message;
    if (field.type === 'date' && !validDate(v)) return field.message;
    if (field.type === 'time' && !/^\d{2}:\d{2}$/.test(v)) return field.message;
    if (field.type === 'select' && field.options.indexOf(v) === -1) return 'Choose an option from the list.';
    return '';
  }

  function validateTradeSelections(selected, catalog) {
    var trades = {}, seen = {}, errors = [];
    catalog.forEach(function (g) { g.trades.forEach(function (t) { trades[t.id] = t; }); });
    (selected || []).forEach(function (item) {
      if (seen[item.tradeId]) errors.push('Duplicate trade: ' + item.tradeId);
      seen[item.tradeId] = true;
      var trade = trades[item.tradeId];
      if (!trade) { errors.push('Unknown trade: ' + item.tradeId); return; }
      var allowed = trade.capabilities.map(function (c) { return c.id; });
      (item.capabilityIds || []).forEach(function (id) {
        if (allowed.indexOf(id) === -1) errors.push('Capability does not belong to selected trade: ' + id);
      });
    });
    return errors;
  }

  function selections(state, config) {
    var picked = state.trades || [], caps = state.capabilities || [], out = [];
    config.tradeCatalog.forEach(function (g) {
      g.trades.forEach(function (t) {
        if (picked.indexOf(t.id) === -1) return;
        var own = t.capabilities.map(function (c) { return c.id; });
        out.push({ tradeId: t.id, capabilityIds: caps.filter(function (id) { return own.indexOf(id) !== -1; }) });
      });
    });
    // Ids missing from the catalog are kept so validation can reject them.
    picked.forEach(function (id) {
      if (!out.some(function (s) { return s.tradeId === id; })) out.push({ tradeId: id, capabilityIds: [] });
    });
    return out;
  }

  // One rule set for every step and for the final submit, so they cannot disagree.
  function validate(state, config) {
    var route = state.route, data = state.data || {}, errors = [];
    if (!config.routes[route]) return [{ key: 'purpose', step: 'contact', message: 'Choose an inquiry type.' }];

    allFields(route, config).forEach(function (entry) {
      if (!isActive(entry.field, state)) return;
      var message = fieldError(entry.field, state);
      if (message) errors.push({ key: entry.field.key, step: entry.step, message: message });
    });

    if (route === 'trade') {
      if (!(state.trades || []).length) errors.unshift({ key: 'trades', step: 'trades', message: 'Choose at least one trade.' });
      validateTradeSelections(selections(state, config), config.tradeCatalog).forEach(function (message) {
        errors.push({ key: 'trades', step: 'trades', message: message });
      });
    }
    if (route === 'documents' && !list(data.requestedDocuments).length && !text(data.requirements)) {
      errors.push({ key: 'requirements', step: 'contact', message: 'Choose documents or describe the request.' });
    }
    if (!state.confirmed) errors.push({ key: 'confirmed', step: 'review', message: 'Confirm your information is accurate.' });
    return errors;
  }

  // Reads only the active path's fields, so answers from another path cannot leak in.
  function makePayload(state, config) {
    var route = state.route, data = state.data || {}, details = {}, shared = {};
    if (!config.routes[route]) throw new Error('Unknown inquiry type.');
    allFields(route, config).forEach(function (entry) {
      var field = entry.field, active = isActive(field, state), value;
      if (field.type === 'checks') value = active ? list(data[field.key]) : [];
      else if (field.type === 'check') value = !!data[field.key];
      else if (field.type === 'url') value = active ? (normalizeUrl(data[field.key]) || '') : '';
      else value = active ? text(data[field.key]) : '';
      if (SHARED_KEYS.indexOf(field.key) !== -1) shared[field.key] = value;
      else details[field.key] = value;
    });
    return {
      schemaVersion: config.schemaVersion,
      inquiryType: route,
      company: shared.company ? { name: shared.company, website: shared.website || '', cityState: shared.city } : null,
      contact: { fullName: shared.name, email: shared.email.toLowerCase(), phone: shared.phone, cityState: shared.city },
      details: details,
      tradeSelections: route === 'trade' ? selections(state, config) : [],
      confirmation: { informationAccurate: !!state.confirmed }
    };
  }

  function tradeLabels(payload, config) {
    var trades = {}, caps = {};
    config.tradeCatalog.forEach(function (g) {
      g.trades.forEach(function (t) {
        trades[t.id] = t.label;
        t.capabilities.forEach(function (c) { caps[c.id] = c.label; });
      });
    });
    return payload.tradeSelections.map(function (s) {
      return { trade: trades[s.tradeId] || s.tradeId, capabilities: s.capabilityIds.map(function (id) { return caps[id] || id; }) };
    });
  }

  // Sections for the review step; unanswered optional fields are left out.
  function reviewSections(state, config) {
    var payload = makePayload(state, config);
    return config.routes[state.route].steps.filter(function (s) { return s.key !== 'review'; }).map(function (step) {
      var rows = [];
      if (step.key === 'trades') {
        tradeLabels(payload, config).forEach(function (t) {
          rows.push([t.trade, t.capabilities.join(', ') || 'No specific capabilities selected']);
        });
      }
      fieldsFor(state.route, step.key, config).forEach(function (field) {
        if (!isActive(field, state)) return;
        var value = SHARED_KEYS.indexOf(field.key) !== -1 ? text((state.data || {})[field.key]) : payload.details[field.key];
        if (field.type === 'check') value = value ? 'Yes' : '';
        if (Array.isArray(value)) value = value.join(', ');
        if (value) rows.push([field.label, value]);
      });
      return { step: step.key, title: step.title, rows: rows };
    });
  }

  function buckets(route) { return BUCKETS[route] || SUPPORTING; }

  // Metadata checks only. The server repeats them and inspects the real file content.
  function checkFile(file, existing, bucket) {
    var errors = [], name = text(file.name), ext = name.indexOf('.') === -1 ? '' : name.split('.').pop().toLowerCase();
    var total = existing.reduce(function (sum, item) { return sum + (Number(item.size) || 0); }, 0);
    if (bucket.accept.indexOf(ext) === -1) errors.push('This file type is not accepted here.');
    if (!(file.size > 0)) errors.push('This file is empty.');
    if (file.size > UPLOAD_RULES.maxFileBytes) errors.push('Files can be up to 10 MB each.');
    if (existing.length >= UPLOAD_RULES.maxFilesPerInquiry) errors.push('You can attach up to 20 files.');
    if (total + file.size > UPLOAD_RULES.maxTotalBytes) errors.push('Attachments can total up to 50 MB.');
    if (existing.some(function (item) { return item.name === name && item.size === file.size; })) {
      errors.push('This file is already attached. Remove it first to replace it.');
    }
    return errors;
  }

  function snake(key) { return key.replace(/[A-Z]/g, function (c) { return '_' + c.toLowerCase(); }); }

  // Flat keys are easy to map in GoHighLevel; `request` keeps the full structured record.
  function webhookBody(state, config, meta) {
    var payload = makePayload(state, config);
    var names = payload.contact.fullName.split(/\s+/);
    var label = config.routes[state.route].label;
    var body = {
      form_name: label,
      inquiry_type: state.route,
      source: 'relyc.co website',
      page_url: meta.pageUrl,
      submitted_at: meta.submittedAt,
      submission_id: meta.submissionId,
      schema_version: config.schemaVersion,
      name: payload.contact.fullName,
      first_name: names[0],
      last_name: names.slice(1).join(' '),
      email: payload.contact.email,
      phone: payload.contact.phone,
      company: payload.company ? payload.company.name : '',
      website: payload.company ? payload.company.website : '',
      city_state: payload.contact.cityState
    };
    Object.keys(payload.details).forEach(function (key) {
      var value = payload.details[key];
      body[snake(key)] = Array.isArray(value) ? value.join(', ') : value;
    });
    if (state.route === 'trade') {
      var labels = tradeLabels(payload, config);
      body.trades = labels.map(function (t) { return t.trade; }).join(', ');
      body.capabilities = labels.map(function (t) { return t.trade + ': ' + (t.capabilities.join(', ') || 'none selected'); }).join('; ');
    }
    body.summary = label + '\n\n' + reviewSections(state, config).map(function (section) {
      return section.title + '\n' + section.rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
    }).join('\n\n');
    body.request = payload;
    return body;
  }

  window.RelycContactModel = {
    SHARED_KEYS: SHARED_KEYS,
    UPLOAD_RULES: UPLOAD_RULES,
    buckets: buckets,
    checkFile: checkFile,
    fieldsFor: fieldsFor,
    isActive: isActive,
    isRequired: isRequired,
    isSpecialtyTrade: isSpecialtyTrade,
    normalizeUrl: normalizeUrl,
    validate: validate,
    validateTradeSelections: validateTradeSelections,
    makePayload: makePayload,
    reviewSections: reviewSections,
    webhookBody: webhookBody
  };
})();
