/* ============================================================
   RELYC CONTRACTOR — Contact page flow
   One page, one inquiry purpose, relevant questions in short
   steps. Field rules live in contact-model.js and the directory
   in contact-config.js. A submission only reports success after
   the server answers with a 2xx. With data-api set, submissions
   go to the backend, which adds uploads, saved drafts and
   reference numbers. Without it they go to the webhook.
   ============================================================ */
(function () {
  'use strict';

  var D = document;
  var W = window;
  var root = D.querySelector('[data-contact-flow]');
  if (!root) return;

  var cfg = W.RELYC_FORM_CONFIG;
  var M = W.RelycContactModel;
  var endpoint = root.dataset.endpoint || '';
  var apiBase = (root.dataset.api || '').replace(/\/$/, '');
  var purpose = root.querySelector('#cf-purpose');
  var panel = root.querySelector('[data-cf-panel]');
  var live = root.querySelector('[data-cf-live]');
  var phone = root.dataset.phone || '';

  var route = '';
  var shared = {};                // contact details carried across every path
  var drafts = {};                // a separate draft for each path
  var pending = false;
  var search = '';
  var category = '';

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function draft(id) {
    var key = id || route;
    if (!drafts[key]) drafts[key] = { data: {}, trades: [], capabilities: [], confirmed: false, step: 0, submissionId: '', files: [], draftToken: '', revision: 0 };
    return drafts[key];
  }

  function get(key) {
    return M.SHARED_KEYS.indexOf(key) !== -1 ? shared[key] : draft().data[key];
  }

  function set(key, value) {
    if (M.SHARED_KEYS.indexOf(key) !== -1) shared[key] = value;
    else draft().data[key] = value;
    changed();
  }

  // Changed answers are a new submission; an unchanged retry keeps its id.
  function changed() { draft().submissionId = ''; }

  function state() {
    var d = draft(), data = {}, k;
    for (k in d.data) data[k] = d.data[k];
    for (k in shared) data[k] = shared[k];
    return { route: route, data: data, trades: d.trades, capabilities: d.capabilities, confirmed: d.confirmed };
  }

  function steps() { return cfg.routes[route].steps; }
  function currentStep() { return steps()[draft().step]; }

  function say(msg) { if (live) live.textContent = msg; }

  function submissionId() {
    var d = draft();
    if (!d.submissionId) {
      d.submissionId = (W.crypto && W.crypto.randomUUID) ? W.crypto.randomUUID()
        : 'rc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    }
    return d.submissionId;
  }

  function scrollToPanel() {
    if (W.RELYC && W.RELYC.scrollTo) W.RELYC.scrollTo(root, { offset: -110 });
  }

  /* ----------------------------------------------------------
     FIELDS
     ---------------------------------------------------------- */
  function star(field, st) {
    return '<span class="req" data-cf-req="' + field.key + '"' + (M.isRequired(field, st) ? '' : ' hidden') + '> *</span>';
  }

  function controlHtml(field, id, value, described) {
    var common = ' id="' + id + '" data-cf-key="' + field.key + '"' + described;
    if (field.type === 'textarea') {
      return '<textarea' + common + (field.max ? ' maxlength="' + field.max + '"' : '') + ' rows="4">' + esc(value) + '</textarea>';
    }
    if (field.type === 'select') {
      return '<select' + common + '><option value="">Select an option</option>' + field.options.map(function (o) {
        return '<option' + (value === o ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('') + '</select>';
    }
    return '<input' + common + ' type="' + field.type + '" value="' + esc(value) + '"' +
      (field.max ? ' maxlength="' + field.max + '"' : '') +
      (field.autocomplete ? ' autocomplete="' + field.autocomplete + '"' : '') +
      (field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : '') + '>';
  }

  function fieldHtml(field, st) {
    var id = 'cf-' + field.key, err = id + '-err';
    var hidden = M.isActive(field, st) ? '' : ' hidden';
    var value = get(field.key);

    if (field.type === 'check') {
      return '<div class="field--full" data-cf-field="' + field.key + '"' + hidden + '><label class="cf-check"><input type="checkbox" id="' + id + '" data-cf-flag="' + field.key + '"' + (value ? ' checked' : '') + '><span>' + esc(field.label) + '</span></label></div>';
    }
    if (field.type === 'checks') {
      var picked = value || [];
      return '<fieldset class="cf-group field field--full" id="' + id + '" data-cf-field="' + field.key + '"' + hidden + ' aria-describedby="' + err + '">' +
        '<legend>' + esc(field.label) + star(field, st) + '</legend><div class="cf-options">' +
        field.options.map(function (o) {
          return '<label class="cf-check"><input type="checkbox" data-cf-array="' + field.key + '" value="' + esc(o) + '"' + (picked.indexOf(o) !== -1 ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
        }).join('') + '</div><span class="field__err" id="' + err + '"></span></fieldset>';
    }
    var wide = field.full || field.type === 'textarea';
    var hintId = field.hint ? ' aria-describedby="' + id + '-hint"' : '';
    return '<div class="field' + (wide ? ' field--full' : '') + '" data-cf-field="' + field.key + '"' + hidden + '>' +
      '<label for="' + id + '">' + esc(field.label) + star(field, st) + '</label>' +
      controlHtml(field, id, value == null ? '' : value, hintId) +
      (field.hint ? '<span class="field__hint" id="' + id + '-hint">' + esc(field.hint) + '</span>' : '') +
      '<span class="field__err" id="' + err + '"></span></div>';
  }

  /* ----------------------------------------------------------
     TRADE PICKER
     ---------------------------------------------------------- */
  function allTrades() {
    return cfg.tradeCatalog.reduce(function (out, g) {
      return out.concat(g.trades.map(function (t) { return { id: t.id, label: t.label, group: g.id, capabilities: t.capabilities }; }));
    }, []);
  }

  function tradeById(id) {
    return allTrades().filter(function (t) { return t.id === id; })[0];
  }

  function pickerHtml() {
    return '<fieldset class="cf-group cf-picker field field--full" id="cf-trades" aria-describedby="cf-trades-err">' +
      '<legend>Trade(s)<span class="req"> *</span></legend>' +
      '<p class="field__hint">Select every trade your company performs, across any category. Your company registers once.</p>' +
      '<div class="cf-tags" data-cf-tags></div>' +
      '<div class="cf-picker__bar">' +
        '<input type="search" id="cf-trade-search" aria-label="Search trades" placeholder="Search trades" value="' + esc(search) + '" autocomplete="off">' +
        '<select id="cf-trade-category" aria-label="Filter trades by category"><option value="">All trades</option>' +
        cfg.tradeCatalog.map(function (g) {
          return '<option value="' + g.id + '"' + (category === g.id ? ' selected' : '') + '>' + esc(g.label) + '</option>';
        }).join('') + '</select>' +
      '</div>' +
      '<div class="cf-options cf-options--scroll" data-cf-trade-options></div>' +
      '<span class="field__err" id="cf-trades-err"></span>' +
      '</fieldset><div class="field--full" data-cf-caps></div>';
  }

  function renderTags() {
    var box = panel.querySelector('[data-cf-tags]');
    if (!box) return;
    var ids = draft().trades;
    box.innerHTML = ids.length ? ids.map(function (id) {
      var t = tradeById(id);
      return '<span class="cf-tag">' + esc(t.label) + '<button type="button" data-cf-remove-trade="' + id + '" aria-label="Remove ' + esc(t.label) + '">&times;</button></span>';
    }).join('') : '<span class="field__hint">No trades selected yet.</span>';
  }

  // Search and category only change what is listed; selections are never touched.
  function renderTradeOptions() {
    var box = panel.querySelector('[data-cf-trade-options]');
    if (!box) return;
    var needle = search.trim().toLowerCase(), ids = draft().trades;
    var list = allTrades().filter(function (t) {
      return (!category || t.group === category) && (!needle || t.label.toLowerCase().indexOf(needle) !== -1);
    });
    box.innerHTML = list.length ? list.map(function (t) {
      return '<label class="cf-check"><input type="checkbox" data-cf-trade="' + t.id + '"' + (ids.indexOf(t.id) !== -1 ? ' checked' : '') + '><span>' + esc(t.label) + '</span></label>';
    }).join('') : '<p class="field__hint">No matching trades. Choose Other Specialty Trade and describe your work below.</p>';
  }

  function renderCapabilities() {
    var box = panel.querySelector('[data-cf-caps]');
    if (!box) return;
    var d = draft();
    if (!d.trades.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<p class="cf-subhead">Specific capabilities</p>' + d.trades.map(function (id) {
      var t = tradeById(id);
      if (M.isSpecialtyTrade(id)) {
        return '<section class="cf-capgroup"><h3>' + esc(t.label) + '</h3><p class="field__hint">Describe this work under Other scopes or specialties below.</p></section>';
      }
      return '<section class="cf-capgroup"><h3>' + esc(t.label) + '</h3><div class="cf-options">' + t.capabilities.map(function (c) {
        return '<label class="cf-check"><input type="checkbox" data-cf-cap="' + c.id + '"' + (d.capabilities.indexOf(c.id) !== -1 ? ' checked' : '') + '><span>' + esc(c.label) + '</span></label>';
      }).join('') + '</div></section>';
    }).join('');
  }

  function removeTrade(id) {
    var d = draft(), t = tradeById(id);
    var own = t.capabilities.map(function (c) { return c.id; });
    var dropped = d.capabilities.filter(function (c) { return own.indexOf(c) !== -1; }).length;
    d.trades = d.trades.filter(function (x) { return x !== id; });
    d.capabilities = d.capabilities.filter(function (c) { return own.indexOf(c) === -1; });
    say(t.label + ' removed' + (dropped ? ', along with ' + dropped + ' selected ' + (dropped === 1 ? 'capability' : 'capabilities') : '') + '.');
  }

  function renderPicker() {
    renderTags();
    renderTradeOptions();
    renderCapabilities();
    refreshConditional();
  }

  /* ----------------------------------------------------------
     DOCUMENTS
     ---------------------------------------------------------- */
  function uploadStep() {
    var keys = steps().map(function (s) { return s.key; });
    return route === 'trade' ? 'qualifications' : (keys.indexOf('details') !== -1 ? 'details' : 'contact');
  }

  function uploadsHtml() {
    return '<div class="cf-uploads field--full">' + M.buckets(route).map(function (b) {
      var id = 'cf-file-' + b.id;
      var accept = b.accept.map(function (x) { return '.' + x; }).join(',');
      return '<section class="cf-upload" data-cf-drop="' + b.id + '"><div class="field">' +
        '<label for="' + id + '">' + esc(b.title) + '</label>' +
        '<input type="file" id="' + id + '" multiple accept="' + accept + '" data-cf-files="' + b.id + '" aria-describedby="' + id + '-hint">' +
        '<span class="field__hint" id="' + id + '-hint">' + esc(b.desc) + ' Choose files or drag them here, up to 10 MB each.</span></div>' +
        '<div data-cf-file-list="' + b.id + '"></div><p class="cf-upload__err" data-cf-file-err="' + b.id + '" role="alert"></p></section>';
    }).join('') + '</div>';
  }

  function renderFiles() {
    M.buckets(route).forEach(function (b) {
      var box = panel.querySelector('[data-cf-file-list="' + b.id + '"]');
      if (!box) return;
      box.innerHTML = draft().files.filter(function (f) { return f.category === b.id; }).map(function (f) {
        var status = f.status === 'done' ? 'Uploaded' : f.status === 'failed' ? esc(f.error) : 'Uploading ' + f.pct + '%';
        return '<div class="cf-file' + (f.status === 'failed' ? ' is-failed' : '') + '"><span class="cf-file__name">' + esc(f.name) + '</span>' +
          '<span class="cf-file__meta">' + (f.size / 1048576).toFixed(1) + ' MB · ' + status + '</span>' +
          (f.status === 'failed' && f.file ? '<button type="button" data-cf-file-retry="' + f.id + '">Retry</button>' : '') +
          '<button type="button" data-cf-file-remove="' + f.id + '" aria-label="Remove ' + esc(f.name) + '">Remove</button></div>';
      }).join('');
    });
  }

  function send(entry, owner) {
    var xhr = new XMLHttpRequest();
    var q = new URLSearchParams({ route: route, category: entry.category, name: entry.name });
    entry.status = 'uploading';
    entry.pct = 0;
    xhr.open('POST', apiBase + '/api/contact/uploads?' + q.toString());
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) { entry.pct = Math.round(e.loaded / e.total * 100); if (owner === draft()) renderFiles(); }
    };
    xhr.onload = function () {
      var data = {};
      try { data = JSON.parse(xhr.responseText); } catch (e) { /* message below */ }
      if (xhr.status === 201) { entry.status = 'done'; entry.token = data.uploadToken; entry.file = null; say(entry.name + ' uploaded.'); }
      else { entry.status = 'failed'; entry.error = data.message || 'Upload failed. Try again.'; say(entry.name + ': ' + entry.error); }
      if (owner === draft()) renderFiles();
    };
    xhr.onerror = xhr.onabort = function () {
      entry.status = 'failed';
      entry.error = 'Upload was interrupted.';
      say(entry.name + ': upload was interrupted.');
      if (owner === draft()) renderFiles();
    };
    xhr.send(entry.file);
    renderFiles();
  }

  // A rejected file is reported on its own and never affects the other attachments.
  function addFiles(bucketId, list) {
    var d = draft(), problems = [];
    var bucket = M.buckets(route).filter(function (b) { return b.id === bucketId; })[0];
    Array.prototype.forEach.call(list, function (file) {
      var errors = M.checkFile({ name: file.name, size: file.size }, d.files, bucket);
      if (errors.length) { problems.push(file.name + ': ' + errors[0]); return; }
      var entry = { id: String(Date.now()) + Math.random().toString(36).slice(2, 8), name: file.name, size: file.size, category: bucketId, status: 'uploading', pct: 0, file: file, token: '' };
      d.files.push(entry);
      changed();
      send(entry, d);
    });
    var box = panel.querySelector('[data-cf-file-err="' + bucketId + '"]');
    if (box) box.textContent = problems.join(' ');
  }

  function removeFile(id) {
    var d = draft(), entry = d.files.filter(function (f) { return f.id === id; })[0];
    if (!entry) return;
    d.files = d.files.filter(function (f) { return f !== entry; });
    changed();
    if (entry.token) fetch(apiBase + '/api/contact/uploads/' + encodeURIComponent(entry.token), { method: 'DELETE' }).catch(function () {});
    say(entry.name + ' removed.');
    renderFiles();
  }

  function fileTokens() {
    return draft().files.filter(function (f) { return f.token; }).map(function (f) { return f.token; });
  }

  /* ----------------------------------------------------------
     STEP RENDERING
     ---------------------------------------------------------- */
  function stepNav() {
    var active = draft().step;
    return '<ol class="cf-steps">' + steps().map(function (s, i) {
      return '<li><button type="button" class="cf-step' + (i < active ? ' is-done' : '') + '" data-cf-goto="' + i + '"' +
        (i === active ? ' aria-current="step"' : '') + (i > active ? ' disabled' : '') + '><span class="cf-step__n">' + (i + 1) + '</span>' +
        '<span class="cf-step__t">' + esc(s.title) + '</span></button></li>';
    }).join('') + '</ol>';
  }

  function reviewHtml() {
    var d = draft();
    var partner = cfg.partnerTypes.indexOf(route) !== -1;
    var attached = d.files.length ? '<section class="cf-review"><div class="cf-review__head"><h3>Attachments</h3></div><dl>' + d.files.map(function (f) {
      return '<div><dt>' + esc(f.name) + '</dt><dd>' + (f.status === 'done' ? 'Uploaded' : f.status === 'failed' ? 'Failed' : 'Uploading') + '</dd></div>';
    }).join('') + '</dl></section>' : '';
    return M.reviewSections(state(), cfg).map(function (section) {
      var index = steps().map(function (s) { return s.key; }).indexOf(section.step);
      return '<section class="cf-review"><div class="cf-review__head"><h3>' + esc(section.title) + '</h3>' +
        '<button type="button" class="cf-edit" data-cf-goto="' + index + '" aria-label="Edit ' + esc(section.title) + '">Edit</button></div>' +
        '<dl>' + section.rows.map(function (r) {
          return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        }).join('') + '</dl></section>';
    }).join('') + attached +
      (partner ? '<p class="cf-note">Your submission is received for review. It is an expression of interest, not an approval, appointment or award, and it does not guarantee bid invitations.</p>' : '') +
      '<div class="field field--full" data-cf-field="confirmed"><label class="cf-check" for="cf-confirmed"><input type="checkbox" id="cf-confirmed" aria-describedby="cf-confirmed-err"' + (d.confirmed ? ' checked' : '') + '>' +
      '<span>I confirm the information provided is accurate to the best of my knowledge.<span class="req"> *</span></span></label>' +
      '<span class="field__err" id="cf-confirmed-err"></span></div>';
  }

  function noteHtml(key) {
    if (apiBase) {
      return key === 'qualifications'
        ? '<p class="cf-note">Upload what you have now. We can request anything missing after our initial review.</p>' : '';
    }
    if (key === 'qualifications') {
      return '<p class="cf-note">Online document upload is not available yet. If we need licenses, insurance or other documents, we will request them after our initial review.</p>';
    }
    if (key === 'details') {
      return '<p class="cf-note">Have drawings, a line card or other documents? Online upload is not available yet, so we will request them after we review your inquiry.</p>';
    }
    return '';
  }

  function render(focus) {
    if (!route) { panel.hidden = true; panel.innerHTML = ''; return; }
    var d = draft(), step = currentStep(), st = state(), last = d.step === steps().length - 1;
    var body = step.key === 'review' ? reviewHtml()
      : (step.key === 'trades' ? pickerHtml() : '') + M.fieldsFor(route, step.key, cfg).map(function (field) { return fieldHtml(field, st); }).join('');

    panel.hidden = false;
    panel.innerHTML = '<form class="form" data-cf-form novalidate>' +
      '<div class="hp" aria-hidden="true"><label>Company website<input type="text" name="_company_website" tabindex="-1" autocomplete="off"></label></div>' +
      stepNav() +
      '<div class="cf-head"><p class="cf-count">' + esc(cfg.routes[route].label) + ' · Step ' + (d.step + 1) + ' of ' + steps().length + '</p>' +
      '<h2 tabindex="-1" data-cf-title>' + esc(step.title) + '</h2><p>' + esc(step.desc) + '</p></div>' +
      '<div class="form-status" data-cf-summary></div>' +
      '<div class="form__grid">' + body + (apiBase && step.key === uploadStep() ? uploadsHtml() : '') + '</div>' + noteHtml(step.key) +
      '<div class="cf-actions">' +
        (d.step ? '<button type="button" class="btn btn--ghost" data-cf-back>Back</button>' : '') +
        (apiBase ? '<button type="button" class="btn btn--ghost" data-cf-save>Save and finish later</button>' : '') +
        '<button type="submit" class="btn btn--primary" data-cf-next>' + (last ? (route === 'trade' ? 'Submit company profile' : 'Send inquiry') : 'Continue') + ARROW + '</button>' +
      '</div>' +
      '<p class="form__note">Your details are used only to respond to this inquiry. See our <a href="privacy.html">Privacy Policy</a>.' +
      (phone ? ' Prefer to talk? <a href="tel:' + esc(root.dataset.tel) + '">Call ' + esc(phone) + '</a>.' : '') + '</p>' +
      '</form>';

    if (step.key === 'trades') renderPicker();
    renderFiles();
    if (focus) {
      var title = panel.querySelector('[data-cf-title]');
      title.focus({ preventScroll: true });
      scrollToPanel();
    }
  }

  // Shows, hides and marks the fields that depend on another answer.
  function refreshConditional() {
    var st = state();
    M.fieldsFor(route, currentStep().key, cfg).forEach(function (field) {
      var el = panel.querySelector('[data-cf-field="' + field.key + '"]');
      if (el) el.hidden = !M.isActive(field, st);
      var req = panel.querySelector('[data-cf-req="' + field.key + '"]');
      if (req) req.hidden = !M.isRequired(field, st);
    });
  }

  /* ----------------------------------------------------------
     ERRORS
     ---------------------------------------------------------- */
  function controlFor(key) {
    if (key === 'trades') return panel.querySelector('#cf-trade-search');
    if (key === 'confirmed') return panel.querySelector('#cf-confirmed');
    var el = panel.querySelector('#cf-' + key);
    return el && el.tagName === 'FIELDSET' ? el.querySelector('input') : el;
  }

  function clearField(key) {
    var err = panel.querySelector('#cf-' + key + '-err');
    if (!err) return;
    err.textContent = '';
    var wrap = err.closest('.field');
    if (wrap) wrap.classList.remove('has-error');
    var control = controlFor(key);
    if (control) {
      control.removeAttribute('aria-invalid');
      if (control.getAttribute('aria-describedby') === err.id) control.removeAttribute('aria-describedby');
    }
    if (!panel.querySelector('.has-error')) hideSummary();
  }

  function hideSummary() {
    var box = panel.querySelector('[data-cf-summary]');
    if (box) { box.className = 'form-status'; box.removeAttribute('role'); box.innerHTML = ''; }
  }

  function showSummary(html) {
    var box = panel.querySelector('[data-cf-summary]');
    box.className = 'form-status is-err';
    box.setAttribute('role', 'alert');
    box.innerHTML = html;
  }

  function showSaved(text) {
    var box = panel.querySelector('[data-cf-summary]');
    box.className = 'form-status is-ok';
    box.setAttribute('role', 'status');
    box.textContent = text;
  }

  function showErrors(errors) {
    var unique = {};
    errors.forEach(function (e) {
      if (unique[e.key]) return;
      unique[e.key] = true;
      var err = panel.querySelector('#cf-' + e.key + '-err');
      if (!err) return;
      err.textContent = e.message;
      var wrap = err.closest('.field');
      if (wrap) wrap.classList.add('has-error');
      var control = controlFor(e.key);
      if (control) {
        control.setAttribute('aria-invalid', 'true');
        if (!control.getAttribute('aria-describedby')) control.setAttribute('aria-describedby', err.id);
      }
    });
    showSummary('<p>Please correct the following:</p><ul>' + errors.map(function (e) {
      return '<li><button type="button" data-cf-jump="' + e.key + '">' + esc(e.message) + '</button></li>';
    }).join('') + '</ul>');
    var first = controlFor(errors[0].key);
    if (first) first.focus();
  }

  /* ----------------------------------------------------------
     ACTIONS
     ---------------------------------------------------------- */
  function goTo(index) {
    draft().step = index;
    render(true);
  }

  function onNext() {
    if (pending) return;
    var d = draft(), step = currentStep();
    var errors = M.validate(state(), cfg);

    if (step.key !== 'review') {
      var here = errors.filter(function (e) { return e.step === step.key; });
      if (here.length) { showErrors(here); return; }
      goTo(d.step + 1);
      return;
    }

    // Final submit re-checks the whole path, whatever was skipped.
    if (errors.length) {
      var target = steps().map(function (s) { return s.key; }).indexOf(errors[0].step);
      if (target !== d.step) goTo(target);
      showErrors(errors.filter(function (e) { return e.step === errors[0].step; }));
      return;
    }
    if (draft().files.some(function (f) { return f.status === 'uploading'; })) {
      showSummary('<p>Your files are still uploading. Send this once they finish.</p>');
      return;
    }
    if (draft().files.some(function (f) { return f.status === 'failed'; })) {
      showSummary('<p>One of your files did not upload. Go back to retry or remove it.</p>');
      return;
    }
    submit();
  }

  function setBusy(busy) {
    var btn = panel.querySelector('[data-cf-next]');
    if (!btn) return;
    btn.disabled = busy;
    btn.style.opacity = busy ? '.6' : '';
    if (busy) { btn.dataset.html = btn.innerHTML; btn.textContent = 'Sending…'; }
    else if (btn.dataset.html) btn.innerHTML = btn.dataset.html;
  }

  function failed(message) {
    pending = false;
    setBusy(false);
    showSummary('<p>' + (message ? esc(message) + ' ' : 'We could not send that. ') + 'Your answers are still here, so you can try again' +
      (phone ? ', or call <a href="tel:' + esc(root.dataset.tel) + '">' + esc(phone) + '</a>' : '') + '.</p>');
    panel.querySelector('[data-cf-summary]').scrollIntoView({ block: 'center' });
  }

  function succeeded(reference) {
    var partner = cfg.partnerTypes.indexOf(route) !== -1;
    pending = false;
    drafts[route] = null;
    panel.innerHTML = '<div class="cf-done"><h2 tabindex="-1" data-cf-title>' + (route === 'trade' ? 'Company profile received.' : 'Inquiry received.') + '</h2>' +
      '<p>' + (partner
        ? 'Thank you. We will review your submission and contact you if we need more information. This does not mean approval, and it does not guarantee bid invitations.'
        : 'Thank you. We will review your inquiry and follow up using the contact details you provided.') + '</p>' +
      (reference ? '<p class="cf-ref">Your reference: <strong>' + esc(reference) + '</strong></p>' : '') +
      '<button type="button" class="btn btn--ghost" data-cf-restart>Send another inquiry</button></div>';
    panel.querySelector('[data-cf-title]').focus({ preventScroll: true });
    scrollToPanel();
  }

  function submit() {
    var honeypot = panel.querySelector('[name=_company_website]');
    if (honeypot && honeypot.value) { succeeded(); return; }   // bots get the same result, nothing is sent
    if (apiBase) { submitToApi(); return; }
    if (!endpoint) { failed(); return; }

    pending = true;
    setBusy(true);
    var controller = W.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : 0;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(M.webhookBody(state(), cfg, {
        pageUrl: location.href,
        submittedAt: new Date().toISOString(),
        submissionId: submissionId()   // unchanged on retry, so duplicates can be spotted
      })),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('bad status');
      succeeded();
    }).catch(function () {
      clearTimeout(timer);
      failed();
    });
  }

  function jsonOf(r) { return r.json().catch(function () { return {}; }); }

  function submitToApi() {
    var d = draft();
    pending = true;
    setBusy(true);
    var controller = W.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 30000) : 0;

    fetch(apiBase + '/api/contact/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submissionId() },
      body: JSON.stringify({ state: state(), uploadTokens: fileTokens(), draftToken: d.draftToken }),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      return jsonOf(r).then(function (data) {
        if (r.ok) { succeeded(data.reference); return; }
        if (r.status === 422 && data.errors && data.errors.length) {
          pending = false;
          setBusy(false);
          var keys = steps().map(function (s) { return s.key; });
          var at = keys.indexOf(data.errors[0].step);
          if (at !== -1 && at !== d.step) goTo(at);
          showErrors(data.errors.filter(function (e) { return e.step === data.errors[0].step; }));
          return;
        }
        failed(data.message);
      });
    }).catch(function () {
      clearTimeout(timer);
      failed();
    });
  }

  function save() {
    if (pending) return;
    var d = draft();
    var bad = M.validate(state(), cfg).filter(function (e) { return e.key === 'email'; });
    if (bad.length) {
      if (d.step) goTo(0);
      showErrors(bad);
      return;
    }
    fetch(apiBase + '/api/contact/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: state(), uploadTokens: fileTokens(), draftToken: d.draftToken, revision: d.revision })
    }).then(function (r) {
      return jsonOf(r).then(function (data) {
        if (!r.ok) { showSummary('<p>' + esc(data.message || 'We could not save your form.') + '</p>'); return; }
        d.draftToken = data.draftToken;
        d.revision = data.revision;
        showSaved('Saved. We emailed a private link to ' + shared.email + ' so you can finish later.');
      });
    }).catch(function () {
      showSummary('<p>We could not save your form. Check your connection and try again.</p>');
    });
  }

  function restore(out) {
    var s = out.state, id = s.route;
    var d = drafts[id] = { data: {}, trades: s.trades, capabilities: s.capabilities, confirmed: false, step: 0, submissionId: '', files: [], draftToken: out.draftToken, revision: out.revision };
    Object.keys(s.data).forEach(function (k) {
      if (M.SHARED_KEYS.indexOf(k) !== -1) shared[k] = s.data[k];
      else d.data[k] = s.data[k];
    });
    d.files = out.files.map(function (f, i) {
      return { id: 'saved' + i, name: f.name, size: f.size, category: f.category, status: 'done', pct: 100, file: null, token: f.uploadToken };
    });
    choose(id);
    showSaved('Welcome back. Your saved form is restored.');
  }

  function linkExpired(message) {
    panel.hidden = false;
    panel.innerHTML = '<form class="form" data-cf-resend novalidate><div class="form-status is-err" data-cf-summary role="alert">' + esc(message) + '</div>' +
      '<div class="field"><label for="cf-resend-email">Your email</label><input id="cf-resend-email" type="email" autocomplete="email"></div>' +
      '<button type="submit" class="btn btn--primary">Send a new link</button></form>';
  }

  function resume(token) {
    var url = new URL(location.href);
    url.searchParams.delete('resume');
    W.history.replaceState(null, '', url.href);
    fetch(apiBase + '/api/contact/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token })
    }).then(function (r) {
      return jsonOf(r).then(function (data) {
        if (r.ok) restore(data);
        else linkExpired(data.message || 'This link has expired. Request a new one with your email.');
      });
    }).catch(function () {
      linkExpired('We could not open your saved form. Check your connection and try again.');
    });
  }

  function choose(next) {
    if (pending) return;
    route = cfg.routes[next] ? next : '';
    purpose.value = route;
    if (W.history && W.history.replaceState) {
      var url = new URL(location.href);
      if (route) url.searchParams.set('type', route);
      else url.searchParams.delete('type');
      W.history.replaceState(null, '', url.href);
    }
    render(false);
  }

  /* ----------------------------------------------------------
     EVENTS
     ---------------------------------------------------------- */
  purpose.addEventListener('change', function () { choose(purpose.value); });

  panel.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'cf-trade-search') { search = el.value; renderTradeOptions(); return; }
    if (el.dataset.cfKey) { set(el.dataset.cfKey, el.value); clearField(el.dataset.cfKey); }
  });

  panel.addEventListener('change', function (e) {
    var el = e.target, d = draft();
    if (el.id === 'cf-trade-category') { category = el.value; renderTradeOptions(); return; }
    if (el.id === 'cf-confirmed') { d.confirmed = el.checked; if (el.checked) clearField('confirmed'); return; }
    if (el.dataset.cfKey) { refreshConditional(); return; }
    if (el.dataset.cfFlag) {
      set(el.dataset.cfFlag, el.checked);
      refreshConditional();
      ['bidTime', 'bidTimezone'].forEach(clearField);
      return;
    }
    if (el.dataset.cfFiles) {
      addFiles(el.dataset.cfFiles, el.files);
      el.value = '';
      return;
    }
    if (el.dataset.cfArray) {
      var key = el.dataset.cfArray, values = (get(key) || []).slice(), at = values.indexOf(el.value);
      if (el.checked && at === -1) values.push(el.value);
      if (!el.checked && at !== -1) values.splice(at, 1);
      set(key, values);
      clearField(key);
      if (key === 'requestedDocuments') clearField('requirements');
      return;
    }
    if (el.dataset.cfTrade) {
      if (el.checked) {
        d.trades.push(el.dataset.cfTrade);
        say(tradeById(el.dataset.cfTrade).label + ' added.');
        clearField('trades');
      } else {
        removeTrade(el.dataset.cfTrade);
      }
      changed();
      renderTags();
      renderCapabilities();
      refreshConditional();
      return;
    }
    if (el.dataset.cfCap) {
      if (el.checked) d.capabilities.push(el.dataset.cfCap);
      else d.capabilities = d.capabilities.filter(function (c) { return c !== el.dataset.cfCap; });
      changed();
    }
  });

  panel.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.cfGoto !== undefined) { goTo(Number(b.dataset.cfGoto)); return; }
    if (b.hasAttribute('data-cf-back')) { goTo(draft().step - 1); return; }
    if (b.dataset.cfRemoveTrade) { removeTrade(b.dataset.cfRemoveTrade); changed(); renderPicker(); return; }
    if (b.dataset.cfFileRemove) { removeFile(b.dataset.cfFileRemove); return; }
    if (b.dataset.cfFileRetry) {
      var d = draft();
      send(d.files.filter(function (f) { return f.id === b.dataset.cfFileRetry; })[0], d);
      return;
    }
    if (b.hasAttribute('data-cf-save')) { save(); return; }
    if (b.dataset.cfJump) { var c = controlFor(b.dataset.cfJump); if (c) c.focus(); return; }
    if (b.hasAttribute('data-cf-restart')) { choose(''); purpose.focus(); }
  });

  panel.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!e.target.hasAttribute('data-cf-resend')) { onNext(); return; }
    var email = e.target.querySelector('#cf-resend-email').value;
    fetch(apiBase + '/api/contact/resume/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).then(jsonOf).then(function (data) {
      panel.innerHTML = '<div class="form-status is-ok" role="status">' + esc(data.message || 'Request received.') + '</div>';
    }).catch(function () {
      panel.querySelector('[data-cf-summary]').textContent = 'We could not send that. Check your connection and try again.';
    });
  });

  panel.addEventListener('dragover', function (e) {
    var box = e.target.closest('[data-cf-drop]');
    if (box) { e.preventDefault(); box.classList.add('is-over'); }
  });
  panel.addEventListener('dragleave', function (e) {
    var box = e.target.closest('[data-cf-drop]');
    if (box) box.classList.remove('is-over');
  });
  panel.addEventListener('drop', function (e) {
    var box = e.target.closest('[data-cf-drop]');
    if (!box) return;
    e.preventDefault();
    box.classList.remove('is-over');
    addFiles(box.dataset.cfDrop, e.dataTransfer.files);
  });

  // Direct links: contact.html?type=trade, ?type=documents, ...
  var params = new URLSearchParams(location.search);
  if (apiBase && params.get('resume')) resume(params.get('resume'));
  else choose(params.get('type') || '');
})();
