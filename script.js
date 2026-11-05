document.addEventListener('DOMContentLoaded', () => {
  // 1. DATA MASTER DUMMY
  let dataProduk = [
    { id: 1, nama: 'Nasi Goreng', kategori: 'Makanan', harga: 10000, terjual: 38, tgl: '2026-10-17' },
    { id: 2, nama: 'Mie Ayam', kategori: 'Makanan', harga: 8000, terjual: 23, tgl: '2026-10-18' },
    { id: 3, nama: 'Nasi Uduk', kategori: 'Makanan', harga: 7000, terjual: 23, tgl: '2026-10-19' },
    { id: 4, nama: 'Air Mineral', kategori: 'Minuman', harga: 4000, terjual: 34, tgl: '2026-10-20' },
    { id: 5, nama: 'Es Teh Manis', kategori: 'Minuman', harga: 3000, terjual: 42, tgl: '2026-10-21' },
    { id: 6, nama: 'Jus Alpukat', kategori: 'Minuman', harga: 10000, terjual: 18, tgl: '2026-10-22' },
    { id: 7, nama: 'Kripik Singkong', kategori: 'Snack', harga: 5000, terjual: 30, tgl: '2026-10-23' },
    { id: 8, nama: 'Roti Bakar', kategori: 'Snack', harga: 8000, terjual: 20, tgl: '2026-10-23' },
    { id: 9, nama: 'Pisang Goreng', kategori: 'Snack', harga: 5000, terjual: 15, tgl: '2026-10-22' },
    { id: 10, nama: 'Bata Cokelat', kategori: 'Snack', harga: 6000, terjual: 18, tgl: '2026-10-21' }
  ];

  const dataOmzetHarian = [
    { label: 'Sab, 17', omzet: 220000 },
    { label: 'Min, 18', omzet: 165000 },
    { label: 'Sen, 19', omzet: 200000 },
    { label: 'Sel, 20', omzet: 220000 },
    { label: 'Rab, 21', omzet: 195000 },
    { label: 'Kam, 22', omzet: 155000 },
    { label: 'Jum, 23', omzet: 255000 }
  ];

  const dataPromo = [
    { id: 1, judul: 'Senin Hemat', desc: 'Mie Ayam cuma Rp7.000', badge: 'SENIN', color: 'blue', emoji: '🍜' },
    { id: 2, judul: 'Paket Sarapan', desc: 'Nasi Uduk + Es Teh Rp9.000', badge: 'SETIAP HARI', color: 'yellow', emoji: '🍳' },
    { id: 3, judul: 'Menu Baru', desc: 'Pisang Goreng Coklat', badge: 'MINGGU INI', color: 'teal', emoji: '🍌' },
    { id: 4, judul: 'Jumat Berkah', desc: 'Air mineral gratis tiap beli makanan', badge: 'JUMAT', color: 'red', emoji: '💧' }
  ];

  const formatRupiah = (val) => 'Rp' + Number(val).toLocaleString('id-ID');

  let selectedCategories = ['Makanan', 'Minuman', 'Snack'];
  let dateText = '17 Okt - 23 Okt';

  // 2. LOGIKA TEMA / MODE GELAP
  const btnTheme = document.getElementById('btnTheme');
  const updateThemeUI = (mode) => {
    document.documentElement.setAttribute('data-color-mode', mode);
    btnTheme.querySelector('span').textContent = mode === 'dark' ? 'Mode terang' : 'Mode gelap';
    try { localStorage.setItem('kantin-color-mode', mode); } catch (e) {}
  };
  
  btnTheme.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-color-mode') || 'light';
    const nextMode = current === 'dark' ? 'light' : 'dark';
    updateThemeUI(nextMode);
    renderCharts();
  });
  updateThemeUI(document.documentElement.getAttribute('data-color-mode') || 'light');

  // 3. FLOATING UI TOOLTIP
  const tooltipEl = document.getElementById('tooltip');
  document.querySelectorAll('[data-tip]').forEach(button => {
    button.addEventListener('mouseenter', () => {
      tooltipEl.textContent = button.getAttribute('data-tip');
      tooltipEl.style.opacity = '1';
      FloatingUIDOM.computePosition(button, tooltipEl, {
        placement: 'top',
        middleware: [FloatingUIDOM.offset(6), FloatingUIDOM.shift({ padding: 5 })]
      }).then(({ x, y }) => {
        Object.assign(tooltipEl.style, { left: `${x}px`, top: `${y}px` });
      });
    });
    button.addEventListener('mouseleave', () => {
      tooltipEl.style.opacity = '0';
    });
  });

  // 4. CHART.JS (BAR & DONUT CHART)
  let barChart, donutChart;
  function initCharts() {
    const ctxBar = document.getElementById('cBar').getContext('2d');
    const ctxDn = document.getElementById('cDn').getContext('2d');

    barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: dataOmzetHarian.map(d => d.label),
        datasets: [{
          data: [],
          backgroundColor: '#357DE8',
          borderRadius: 4,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (val) => val >= 1000 ? (val / 1000) + 'rb' : val }
          }
        }
      }
    });

    donutChart = new Chart(ctxDn, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#357DE8', '#82B536', '#BF63F3'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '70%'
      }
    });
  }

  function renderCharts() {
    const filteredProducts = dataProduk.filter(p => selectedCategories.includes(p.kategori));
    const totalItemAll = dataProduk.reduce((s, i) => s + i.terjual, 0) || 1;
    const filteredItem = filteredProducts.reduce((s, i) => s + i.terjual, 0);

    // Dynamic Bar Chart
    const barValues = dataOmzetHarian.map(d => Math.round(d.omzet * (filteredItem / totalItemAll)));
    barChart.data.datasets[0].data = barValues;
    barChart.update();

    // Dynamic Donut Chart
    const catCounts = {};
    selectedCategories.forEach(cat => catCounts[cat] = 0);
    filteredProducts.forEach(p => {
      if (catCounts[p.kategori] !== undefined) {
        catCounts[p.kategori] += p.terjual;
      }
    });

    donutChart.data.labels = Object.keys(catCounts);
    donutChart.data.datasets[0].data = Object.values(catCounts);
    donutChart.update();
  }

  // 5. TABULATOR (TABEL PRODUK)
  let table;
  function initTable() {
    table = new Tabulator('#tProd', {
      data: dataProduk,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      placeholder: 'Tidak ada produk ditemukan',
      columns: [
        { 
          title: 'Produk', field: 'nama', headerFilter: 'input', headerFilterPlaceholder: 'Cari produk...',
          formatter: (cell) => `<b>${cell.getValue()}</b>`
        },
        { 
          title: 'Kategori', field: 'kategori',
          formatter: (cell) => {
            const val = cell.getValue();
            let cls = 'blue';
            if (val === 'Minuman') cls = 'green';
            if (val === 'Snack') cls = 'purple';
            return `<span class="lozenge ${cls}">${val}</span>`;
          }
        },
        { title: 'Terjual', field: 'terjual', hozAlign: 'right', formatter: (c) => `<span class="num">${c.getValue()}</span>` },
        { 
          title: 'Omzet', field: 'omzet', hozAlign: 'right', 
          mutator: (value, data) => data.harga * data.terjual,
          formatter: (c) => `<span class="num">${formatRupiah(c.getValue())}</span>` 
        },
        {
          title: '', field: 'actions', width: 40, hozAlign: 'center', headerSort: false,
          formatter: () => `<button class="icon-btn del" type="button" title="Hapus produk"><svg class="ic" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`,
          cellClick: (e, cell) => {
            const rowData = cell.getRow().getData();
            // SWEETALERT2 MODAL KONFIRMASI
            Swal.fire({
              customClass: { popup: 'ads-modal' },
              title: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg> Hapus Produk?',
              html: `Apakah Anda yakin ingin menghapus produk <b>${rowData.nama}</b> dari daftar?`,
              showCancelButton: true,
              confirmButtonText: 'Hapus',
              cancelButtonText: 'Batal',
              buttonsStyling: false,
              didOpen: (popup) => {
                const confirmBtn = popup.querySelector('.swal2-confirm');
                const cancelBtn = popup.querySelector('.swal2-cancel');
                if (confirmBtn) confirmBtn.className = 'btn danger';
                if (cancelBtn) cancelBtn.className = 'btn subtle';
              }
            }).then((result) => {
              if (result.isConfirmed) {
                dataProduk = dataProduk.filter(item => item.id !== rowData.id);
                cell.getRow().delete();
                updateDashboard();

                // SWEETALERT2 TOAST FLAG NOTIFIKASI
                Swal.fire({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  customClass: { popup: 'ads-flag' },
                  icon: 'success',
                  title: `Produk ${rowData.nama} berhasil dihapus`
                });
              }
            });
          }
        }
      ]
    });
  }

  // 6. RENDER PROMO MINGGU INI
  function renderPromo() {
    const promoUl = document.getElementById('promo');
    promoUl.innerHTML = dataPromo.map(p => `
      <li>
        <div class="p-emoji">${p.emoji}</div>
        <div class="p-body">
          <b>${p.judul}</b>
          <small>${p.desc}</small>
        </div>
        <span class="lozenge ${p.color}">${p.badge}</span>
      </li>
    `).join('');
    document.getElementById('pCount').textContent = `${dataPromo.length} aktif`;
  }

  // 7. PERHITUNGAN KPI & RE-RENDER DASHBOARD
  function updateDashboard() {
    const filtered = dataProduk.filter(p => selectedCategories.includes(p.kategori));

    const totalOmzet = filtered.reduce((sum, item) => sum + (item.harga * item.terjual), 0);
    const totalItem = filtered.reduce((sum, item) => sum + item.terjual, 0);
    const totalTrx = filtered.length ? Math.ceil(totalItem / 12) : 0;

    document.getElementById('kOmzet').textContent = formatRupiah(totalOmzet);
    document.getElementById('cOmzet').textContent = `Rata-rata ${formatRupiah(Math.round(totalOmzet / 7))} per hari`;

    document.getElementById('kItem').textContent = totalItem;
    document.getElementById('cItem').textContent = `Dari ${filtered.length} produk yang laku`;

    document.getElementById('kTrx').textContent = totalTrx;
    document.getElementById('cTrx').textContent = `Dalam 7 hari`;

    document.getElementById('dRange').textContent = `${dateText} · ${selectedCategories.length} kategori · ${filtered.length} produk`;
    document.getElementById('tCount').textContent = `${filtered.length} produk`;

    if (table) {
      table.setFilter((data) => selectedCategories.includes(data.kategori));
    }

    renderCharts();
  }

  // 8. TOM SELECT (FILTER KATEGORI)
  const selKat = document.getElementById('fKat');
  ['Makanan', 'Minuman', 'Snack'].forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    opt.selected = true;
    selKat.appendChild(opt);
  });

  new TomSelect('#fKat', {
    plugins: ['remove_button'],
    create: false,
    placeholder: 'Pilih kategori...',
    onChange: (values) => {
      selectedCategories = values;
      updateDashboard();
    }
  });

  // 9. FLATPICKR (FILTER TANGGAL)
  flatpickr('#fDate', {
    mode: 'range',
    locale: 'id',
    dateFormat: 'd M Y',
    defaultDate: ['2026-10-17', '2026-10-23'],
    onChange: (selectedDates) => {
      if (selectedDates.length === 2) {
        const d1 = selectedDates[0].getDate() + ' ' + selectedDates[0].toLocaleString('id', { month: 'short' });
        const d2 = selectedDates[1].getDate() + ' ' + selectedDates[1].toLocaleString('id', { month: 'short' });
        dateText = `${d1} - ${d2}`;
        updateDashboard();
      }
    }
  });

  // INITIALIZATION
  initCharts();
  initTable();
  renderPromo();
  updateDashboard();
});