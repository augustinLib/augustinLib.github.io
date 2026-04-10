window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();

    // Interactive demo logic
    const CSV_URL = 'static/images/demo_results.csv';
    const FALLBACK_ROWS = [
      {"query_id":"Q1","query":"When was Dubai founded?","doc_id":"dubai","title":"Dubai","snippet":"Dubai is the most populous city in the United Arab Emirates (UAE). It has been ruled by the Al Maktoum family since 1833.","path":"Government > Government by Cities > Government of Dubai","relevant":true},
      {"query_id":"Q1","query":"When was Dubai founded?","doc_id":"uae","title":"United Arab Emirates","snippet":"The UAE is a country in Western Asia, known for its modern architecture and luxury shopping.","path":"Geography > Countries > Middle East Countries","relevant":false},
      {"query_id":"Q1","query":"When was Dubai founded?","doc_id":"burj_khalifa","title":"Burj Khalifa","snippet":"Burj Khalifa is a skyscraper in Dubai, standing at 828 meters as the world's tallest building.","path":"History > History of Buildings > Buildings in Dubai","relevant":false},
      {"query_id":"Q2","query":"What are the main economic sectors of Dubai?","doc_id":"dubai","title":"Dubai","snippet":"Its economy relies on revenues from trade, tourism, aviation, real estate, and financial services.","path":"Economy > Economy by Cities > Economy of Dubai","relevant":true},
      {"query_id":"Q2","query":"What are the main economic sectors of Dubai?","doc_id":"dubai_creek","title":"Dubai Creek","snippet":"Dubai Creek is a saltwater creek that divides the city into two main sections: Deira and Bur Dubai.","path":"Economy > Trade History > Maritime Routes","relevant":false},
      {"query_id":"Q2","query":"What are the main economic sectors of Dubai?","doc_id":"palm_jumeirah","title":"Palm Jumeirah","snippet":"Palm Jumeirah is an artificial archipelago created using land reclamation by Nakheel.","path":"Economy > Real Estate > Mega Projects","relevant":false},
      {"query_id":"Q3","query":"Why is Dubai a tourism hub?","doc_id":"burj_khalifa","title":"Burj Khalifa","snippet":"Burj Khalifa draws millions of visitors annually with observation decks, dining, and events.","path":"Tourism > Tourism by Cities > Tourism in Dubai","relevant":true},
      {"query_id":"Q3","query":"Why is Dubai a tourism hub?","doc_id":"dubai","title":"Dubai","snippet":"Dubai is a global city and business hub of the Middle East, governed by the Al Maktoum family.","path":"Economy > Economy by Cities > Economy of Dubai","relevant":false},
      {"query_id":"Q3","query":"Why is Dubai a tourism hub?","doc_id":"jebel_ali","title":"Jebel Ali Port","snippet":"Jebel Ali is the largest port in the Middle East, handling over 15 million containers annually.","path":"Tourism > Transportation > Cruise Ports","relevant":false},
    ];

    function colorForString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      return { h: hue, s: 70, l: 45 };
    }

    function hsl(h, s, l, a) {
      const alpha = (a === undefined) ? 1 : a;
      return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
    }

    function highlightQuery(text, query, colorHsl) {
      if (!text || !query) return text || '';
      const tokens = query.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 3);
      let result = text;
      const bg = hsl(colorHsl.h, 90, 85, 1);
      tokens.forEach(tok => {
        const re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        result = result.replace(re, `<span class="query-highlight" style="background:${bg}">$1</span>`);
      });
      return result;
    }

    function parseCsv(text) {
      const rows = [];
      const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
      if (lines.length === 0) return rows;
      const header = smartSplit(lines[0]);
      for (let i = 1; i < lines.length; i++) {
        const cols = smartSplit(lines[i]);
        if (cols.length !== header.length) continue;
        const obj = {};
        header.forEach((h, idx) => { obj[h.trim()] = cols[idx]; });
        rows.push(obj);
      }
      return rows;
    }

    function smartSplit(line) {
      const out = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
          continue;
        }
        if (ch === ',' && !inQuotes) {
          out.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur.trim());
      // Unquote values that were quoted
      return out.map(v => v.replace(/^"(.*)"$/, '$1'));
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function render(results) {
      const basicEl = document.getElementById('results-basic');
      const pathEl = document.getElementById('results-path');
      if (!basicEl || !pathEl) return;
      basicEl.innerHTML = '';
      pathEl.innerHTML = '';

      results.forEach(row => {
        const qColor = colorForString(row.query);
        const titleHtml = escapeHtml(row.title);
        const snippetHtml = escapeHtml(row.snippet);
        const isRelevant = row.relevant === true || row.relevant === 'true';
        const relevantBadge = isRelevant ? '<span class="relevant-badge"><i class="fas fa-check"></i> Relevant</span>' : '';
        const relevantClass = isRelevant ? ' result-card-relevant' : '';

        // Left: basic
        const basic = document.createElement('div');
        basic.className = 'result-card' + relevantClass;
        basic.innerHTML = `
          <div class="result-title">${titleHtml}${relevantBadge}</div>
          <div class="snippet snippet-clamp">${snippetHtml}</div>
        `;
        basicEl.appendChild(basic);

        // Right: path + title emphasis with document as destination
        const pathCard = document.createElement('div');
        pathCard.className = 'result-card' + relevantClass;
        const segs = (row.path || '').split('>').map(s => s.trim()).filter(Boolean);
        
        // Use colored pills for relevant, muted gray for non-relevant
        const pillBg = isRelevant ? hsl(qColor.h, 70, 88) : '#f1f5f9';
        const pillBorder = isRelevant ? hsl(qColor.h, 70, 65) : '#cbd5e1';
        const arrowColor = isRelevant ? hsl(qColor.h, 70, 45) : '#94a3b8';
        const arrowBorder = isRelevant ? hsl(qColor.h, 70, 80) : '#e2e8f0';
        const labelColor = isRelevant ? hsl(qColor.h, 70, 40) : '#64748b';
        const downArrowBg = isRelevant ? hsl(qColor.h, 70, 50) : '#94a3b8';
        
        const pills = segs.map((s, idx) => {
          const pill = `<span class="path-pill" style="background:${pillBg}; border-color:${pillBorder}">${escapeHtml(s)}</span>`;
          const arrow = idx < segs.length - 1 ? `<span class="path-arrow" style="color:${arrowColor}; border-color:${arrowBorder}">→</span>` : '';
          return pill + arrow;
        }).join('');
        pathCard.innerHTML = `
          <div class="path-label" style="color:${labelColor}">Search Process</div>
          <div class="path-pills">${pills}</div>
          <div class="path-to-doc">
            <span class="path-down-arrow" style="background:${downArrowBg}"><i class="fas fa-arrow-down"></i></span>
          </div>
          <div class="doc-destination">
            <span class="doc-marker"><i class="fas fa-file-alt"></i></span>
            <span class="result-title result-title-accent">${titleHtml}${relevantBadge}</span>
          </div>
          <div class="snippet snippet-clamp" style="margin-top:0.5rem;">${snippetHtml}</div>
        `;
        pathEl.appendChild(pathCard);
      });
    }

    function unique(arr) {
      return Array.from(new Set(arr));
    }

    function setStatus(msg) {
      const el = document.getElementById('queryStatus');
      if (el) el.textContent = msg || '';
    }

    function loadDemo() {
      fetch(CSV_URL)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
        .then(text => {
          const rows = parseCsv(text);
          const hasRows = rows && rows.length;
          const data = hasRows ? rows : FALLBACK_ROWS;
          const used = hasRows ? 'CSV' : 'fallback';
          const queries = unique(data.map(r => r.query).filter(Boolean));
          const filters = document.getElementById('queryFilters');
          let activeQuery = queries[0] || null;
          let getSelected = () => (activeQuery ? [activeQuery] : []);

          const onChange = () => {
            const selected = getSelected();
            const filtered = data.filter(r => selected.includes(r.query));
            render(filtered);
          };

          if (filters) {
            filters.innerHTML = '';
            queries.forEach((q, idx) => {
              const c = colorForString(q);
              const chip = document.createElement('button');
              chip.type = 'button';
              chip.className = 'query-chip';
              chip.dataset.query = q;
              chip.style.background = hsl(c.h, 60, 93);
              chip.style.borderColor = hsl(c.h, 60, 70);
              chip.style.color = '#0f172a';
              chip.innerHTML = q;
              chip.addEventListener('click', () => {
                if (activeQuery === q) return;
                activeQuery = q;
                filters.querySelectorAll('.query-chip').forEach(btn => {
                  btn.classList.toggle('is-active', btn.dataset.query === activeQuery);
                  btn.classList.toggle('is-outlined', btn.dataset.query !== activeQuery);
                });
                onChange();
              });
              filters.appendChild(chip);
              if (idx === 0) {
                chip.classList.add('is-active');
              } else {
                chip.classList.add('is-outlined');
              }
            });
            getSelected = () => (activeQuery ? [activeQuery] : []);
          }

          onChange();
        })
        .catch(() => {
          // If CSV fetch fails (e.g., file:// access), fall back to embedded rows
          const data = FALLBACK_ROWS;
          const queries = unique(data.map(r => r.query).filter(Boolean));
          const filters = document.getElementById('queryFilters');
          let activeQuery = queries[0] || null;
          let getSelected = () => (activeQuery ? [activeQuery] : []);

          const onChange = () => {
            const selected = getSelected();
            const filtered = data.filter(r => selected.includes(r.query));
            render(filtered);
          };

          if (filters) {
            filters.innerHTML = '';
            queries.forEach((q, idx) => {
              const c = colorForString(q);
              const chip = document.createElement('button');
              chip.type = 'button';
              chip.className = 'query-chip';
              chip.dataset.query = q;
              chip.style.background = hsl(c.h, 60, 93);
              chip.style.borderColor = hsl(c.h, 60, 70);
              chip.style.color = '#0f172a';
              chip.innerHTML = q;
              chip.addEventListener('click', () => {
                if (activeQuery === q) return;
                activeQuery = q;
                filters.querySelectorAll('.query-chip').forEach(btn => {
                  btn.classList.toggle('is-active', btn.dataset.query === activeQuery);
                  btn.classList.toggle('is-outlined', btn.dataset.query !== activeQuery);
                });
                onChange();
              });
              filters.appendChild(chip);
              if (idx === 0) {
                chip.classList.add('is-active');
              } else {
                chip.classList.add('is-outlined');
              }
            });
            getSelected = () => (activeQuery ? [activeQuery] : []);
          }

          onChange();
        });
    }

    loadDemo();

})
