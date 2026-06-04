# Katalog Produk — Hexavara Cost Management System

**Versi Dokumen:** 1.0  
**Tanggal:** Maret 2026  
**Jenis Dokumen:** Katalog Produk Sistem

---

## Daftar Isi

- [BAB 1 — Pendahuluan](#bab-1--pendahuluan)
  - [1.1 Tentang Hexavara Cost Management System](#11-tentang-hexavara-cost-management-system)
  - [1.2 Tujuan Sistem](#12-tujuan-sistem)
  - [1.3 Ikhtisar Modul Sistem](#13-ikhtisar-modul-sistem)
- [BAB 2 — Dashboard & Manajemen Proyek](#bab-2--dashboard--manajemen-proyek)
  - [2.1 Dashboard Proyek Aktif (Ongoing Projects)](#21-dashboard-proyek-aktif-ongoing-projects)
  - [2.2 Proyek Selesai (Completed Projects)](#22-proyek-selesai-completed-projects)
  - [2.3 Pembuatan Proyek Baru](#23-pembuatan-proyek-baru)
  - [2.4 Project Overview (Detail & Pengelolaan Proyek)](#24-project-overview-detail--pengelolaan-proyek)
- [BAB 3 — Cost Breakdown Structure (CBS)](#bab-3--cost-breakdown-structure-cbs)
  - [3.1 Apa itu CBS](#31-apa-itu-cbs)
  - [3.2 Manajemen Kategori CBS (Master Data)](#32-manajemen-kategori-cbs-master-data)
  - [3.3 Pemilihan CBS pada Proyek](#33-pemilihan-cbs-pada-proyek)
- [BAB 4 — Perencanaan (Planning)](#bab-4--perencanaan-planning)
  - [4.1 Work Breakdown Structure (WBS)](#41-work-breakdown-structure-wbs)
  - [4.2 Termin Planning (Alokasi Volume per Termin)](#42-termin-planning-alokasi-volume-per-termin)
- [BAB 5 — Cost In (Pemasukan Proyek)](#bab-5--cost-in-pemasukan-proyek)
  - [5.1 Apa itu Cost In](#51-apa-itu-cost-in)
  - [5.2 Pencatatan Cost In](#52-pencatatan-cost-in)
  - [5.3 Ringkasan & Riwayat Cost In](#53-ringkasan--riwayat-cost-in)
- [BAB 6 — Cost Control (Pengeluaran Proyek)](#bab-6--cost-control-pengeluaran-proyek)
  - [6.1 Apa itu Cost Control](#61-apa-itu-cost-control)
  - [6.2 Pencatatan Pengeluaran (Record Cost Out)](#62-pencatatan-pengeluaran-record-cost-out)
  - [6.3 Alur Persetujuan (Approval Workflow)](#63-alur-persetujuan-approval-workflow)
  - [6.4 Riwayat & Detail Pengeluaran](#64-riwayat--detail-pengeluaran)
- [BAB 7 — Cost Report (Laporan Biaya)](#bab-7--cost-report-laporan-biaya)
  - [7.1 Apa itu Cost Report](#71-apa-itu-cost-report)
  - [7.2 Dashboard Ringkasan Biaya](#72-dashboard-ringkasan-biaya)
  - [7.3 Visualisasi & Grafik](#73-visualisasi--grafik)
  - [7.4 Laporan per CBS](#74-laporan-per-cbs)
  - [7.5 Laporan per WBS (Drilldown)](#75-laporan-per-wbs-drilldown)
- [BAB 8 — Progress Monitoring](#bab-8--progress-monitoring)
  - [8.1 Apa itu Progress Monitoring](#81-apa-itu-progress-monitoring)
  - [8.2 Tabel Progress (Rencana vs Aktual)](#82-tabel-progress-rencana-vs-aktual)
  - [8.3 Ringkasan & Grafik S-Curve](#83-ringkasan--grafik-s-curve)
  - [8.4 Pencatatan Update Progress](#84-pencatatan-update-progress)
  - [8.5 Riwayat & Detail Progress](#85-riwayat--detail-progress)

---

## BAB 1 — Pendahuluan

### 1.1 Tentang Hexavara Cost Management System

Hexavara Cost Management System adalah sistem informasi berbasis web yang dirancang untuk mengelola seluruh aspek keuangan dan progres proyek konstruksi maupun proyek berbasis kontrak. Sistem ini menyediakan satu platform terpadu untuk perencanaan anggaran, pencatatan pemasukan dan pengeluaran, serta pemantauan progres pekerjaan secara real-time.

Dengan pendekatan terstruktur melalui **Cost Breakdown Structure (CBS)** dan **Work Breakdown Structure (WBS)**, sistem ini memungkinkan pengelola proyek untuk memiliki visibilitas penuh terhadap kondisi keuangan proyek — mulai dari tahap perencanaan hingga penyelesaian.

[Gambar 1 — Tampilan utama Hexavara Cost Management System]

### 1.2 Tujuan Sistem

Hexavara Cost Management System dibangun untuk menjawab kebutuhan-kebutuhan berikut:

| No  | Tujuan                               | Deskripsi                                                                                                                         |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Perencanaan Anggaran Terstruktur** | Menyusun rencana anggaran proyek secara hierarkis melalui WBS dengan alokasi biaya per kategori CBS.                              |
| 2   | **Pencatatan Keuangan Terpusat**     | Mencatat seluruh transaksi pemasukan (Cost In) dan pengeluaran (Cost Out) proyek dalam satu sistem.                               |
| 3   | **Kontrol Pengeluaran**              | Menerapkan mekanisme persetujuan (approval) untuk setiap pengajuan pengeluaran guna mencegah pengeluaran yang tidak terotorisasi. |
| 4   | **Pemantauan Progres**               | Memantau progres fisik pekerjaan dan membandingkannya dengan rencana yang telah ditetapkan.                                       |
| 5   | **Pelaporan Keuangan**               | Menyajikan laporan perbandingan antara rencana anggaran (RAP) dengan pengeluaran aktual secara visual dan tabular.                |
| 6   | **Manajemen Termin**                 | Mengelola milestone pembayaran proyek termasuk adendum di luar perencanaan awal.                                                  |

### 1.3 Ikhtisar Modul Sistem

Hexavara Cost Management System terdiri dari modul-modul yang saling terintegrasi. Berikut adalah gambaran umum arsitektur modul sistem:

[Gambar 2 — Diagram arsitektur modul sistem]

| Modul                              | Fungsi Utama                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| **Manajemen Proyek**               | Membuat, mengelola, dan memantau informasi dasar proyek.                         |
| **CBS (Cost Breakdown Structure)** | Mengelola kategori biaya global yang dapat digunakan di seluruh proyek.          |
| **WBS (Work Breakdown Structure)** | Menyusun struktur pekerjaan secara hierarkis beserta alokasi biaya per kategori. |
| **Termin Planning**                | Mengalokasikan volume pekerjaan ke setiap milestone pembayaran.                  |
| **Cost In**                        | Mencatat dan memantau pemasukan proyek per termin.                               |
| **Cost Control**                   | Mengajukan dan memproses persetujuan pengeluaran proyek.                         |
| **Cost Report**                    | Menyajikan laporan perbandingan RAP vs pengeluaran aktual.                       |
| **Progress Monitoring**            | Memantau dan mencatat progres fisik pekerjaan.                                   |

Alur kerja umum sistem mengikuti siklus hidup proyek:

```
Buat Proyek → Pilih CBS → Susun WBS → Alokasi Termin
     ↓
Catat Cost In ← → Ajukan Cost Out → Approval
     ↓                                  ↓
Progress Monitoring ← → Cost Report (RAP vs Aktual)
```

---

## BAB 2 — Dashboard & Manajemen Proyek

### 2.1 Dashboard Proyek Aktif (Ongoing Projects)

Dashboard Proyek Aktif merupakan halaman utama sistem yang menampilkan daftar seluruh proyek yang sedang berjalan. Halaman ini berfungsi sebagai pusat navigasi bagi pengguna untuk mengakses proyek-proyek yang memerlukan perhatian.

[Gambar 3 — Halaman Dashboard Ongoing Projects]

#### Ringkasan Statistik

Di bagian atas halaman, sistem menampilkan empat kartu ringkasan yang memberikan gambaran cepat kondisi portofolio proyek:

| Kartu              | Deskripsi                                                    |
| ------------------ | ------------------------------------------------------------ |
| **Total Projects** | Jumlah seluruh proyek yang terdaftar dalam sistem.           |
| **Total Budget**   | Akumulasi total anggaran dari seluruh proyek (dalam Rupiah). |
| **Ongoing**        | Jumlah proyek yang sedang berjalan aktif.                    |
| **Completed**      | Jumlah proyek yang telah selesai.                            |

#### Tabel Proyek

Daftar proyek ditampilkan dalam bentuk tabel dengan kolom-kolom berikut:

| Kolom            | Keterangan                                                                     |
| ---------------- | ------------------------------------------------------------------------------ |
| **No**           | Nomor urut.                                                                    |
| **Project Name** | Nama proyek beserta deskripsi singkat.                                         |
| **Location**     | Lokasi proyek.                                                                 |
| **Duration**     | Durasi proyek (dalam bulan), dihitung otomatis dari tanggal mulai dan selesai. |
| **Budget**       | Anggaran proyek dalam format mata uang Rupiah.                                 |
| **Status**       | Status proyek saat ini (Ongoing, Maintenance, Hold).                           |
| **Progress**     | Persentase progres ditampilkan dengan progress bar visual.                     |
| **Action**       | Tombol untuk membuka halaman detail proyek.                                    |

Proyek dengan status **Ongoing**, **Maintenance**, dan **Hold** akan ditampilkan pada halaman ini.

### 2.2 Proyek Selesai (Completed Projects)

Halaman Proyek Selesai menampilkan daftar proyek yang telah memasuki fase penyelesaian. Struktur dan tampilan halaman ini identik dengan Dashboard Proyek Aktif, namun memfilter proyek dengan status **Finish**, **Closed**, atau **Canceled**.

[Gambar 4 — Halaman Completed Projects]

Halaman ini berguna untuk keperluan arsip, evaluasi, dan referensi terhadap proyek-proyek yang telah selesai dikerjakan.

### 2.3 Pembuatan Proyek Baru

Fitur Pembuatan Proyek Baru memungkinkan pengguna untuk mendaftarkan proyek baru ke dalam sistem melalui formulir yang terstruktur. Formulir ini terbagi menjadi tiga bagian utama.

[Gambar 5 — Formulir Pembuatan Proyek Baru]

#### A. Informasi Proyek

Bagian ini mencakup data identitas proyek:

| Field            | Keterangan                      |
| ---------------- | ------------------------------- |
| **Project Name** | Nama proyek.                    |
| **Location**     | Lokasi fisik proyek.            |
| **Description**  | Deskripsi umum mengenai proyek. |

#### B. Detail Proyek

Bagian ini mencakup parameter keuangan dan jadwal:

| Field          | Keterangan                            |
| -------------- | ------------------------------------- |
| **Budget**     | Total anggaran proyek (dalam Rupiah). |
| **Start Date** | Tanggal mulai proyek.                 |
| **End Date**   | Tanggal target penyelesaian proyek.   |
| **Status**     | Status awal proyek.                   |

#### C. Informasi Termin (Timeline)

Bagian ini digunakan untuk mendefinisikan milestone pembayaran proyek. Sistem mendukung dua mode termin:

| Mode                   | Deskripsi                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Termin by Progress** | Pencairan termin berdasarkan akumulasi persentase pekerjaan yang telah diselesaikan. Setiap termin memiliki target persentase progress. |
| **Termin by Task**     | Pencairan termin berdasarkan volume pekerjaan yang diselesaikan atau direncanakan pada tahap termin planning.                           |

Setiap entri termin memiliki field berikut:

| Field            | Keterangan                                                 |
| ---------------- | ---------------------------------------------------------- |
| **Termin**       | Nomor urut termin (otomatis).                              |
| **Progress (%)** | Target persentase progress (pada mode Termin by Progress). |
| **Nominal (Rp)** | Nilai nominal pembayaran untuk termin tersebut.            |
| **Description**  | Keterangan termin (misal: "Uang Muka 20%").                |

Sistem melakukan validasi bahwa **total nominal seluruh termin harus sama dengan total budget proyek** sebelum proyek dapat disimpan.

### 2.4 Project Overview (Detail & Pengelolaan Proyek)

Halaman Project Overview adalah pusat informasi untuk sebuah proyek. Halaman ini menampilkan seluruh data proyek dan menyediakan kemampuan untuk mengedit informasi secara inline.

[Gambar 6 — Halaman Project Overview]

#### Header Proyek

Menampilkan nama proyek, badge status, deskripsi, lokasi, rentang tanggal, dan durasi proyek. Seluruh informasi ini dapat diedit secara langsung melalui mode edit.

#### Kartu Ringkasan Proyek

Sistem menampilkan lima kartu ringkasan di bagian atas:

| Kartu              | Deskripsi                                                 |
| ------------------ | --------------------------------------------------------- |
| **Budget**         | Anggaran dasar proyek ditambah nilai adendum (jika ada).  |
| **Total Cost In**  | Total pemasukan yang telah diterima.                      |
| **Total RAP**      | Total Rencana Anggaran Pelaksanaan dari seluruh item WBS. |
| **Total Expenses** | Total pengeluaran aktual yang telah disetujui.            |
| **Progress**       | Persentase progres keseluruhan proyek.                    |

[Gambar 7 — Kartu ringkasan di halaman Project Overview]

#### Bagian Informasi Termin

Menampilkan daftar termin pembayaran proyek dalam bentuk kartu. Setiap kartu menunjukkan nomor termin, persentase progress, nominal, dan deskripsi. Pada mode edit, pengguna dapat menambah, mengubah, atau menghapus termin dengan validasi bahwa total nominal termin harus sesuai dengan budget.

[Gambar 8 — Bagian Informasi Termin]

#### Bagian Adendum

Adendum merupakan milestone pembayaran tambahan untuk pekerjaan di luar perencanaan awal proyek. Strukturnya identik dengan termin reguler, namun dicatat secara terpisah sebagai kategori "Adendum". Fitur ini memungkinkan proyek mengakomodasi perubahan lingkup pekerjaan tanpa mengubah struktur termin asli.

[Gambar 9 — Bagian Informasi Adendum]

#### Bagian Pemilihan CBS

Bagian ini menampilkan kategori CBS yang telah dipilih untuk proyek, serta memungkinkan pengguna untuk menambah atau mengubah pilihan. Kategori CBS yang dipilih di sini akan menjadi kolom biaya pada tabel WBS proyek. Penjelasan lebih lanjut mengenai CBS terdapat pada [BAB 3](#bab-3--cost-breakdown-structure-cbs).

[Gambar 10 — Bagian Pemilihan CBS pada Project Overview]

---

## BAB 3 — Cost Breakdown Structure (CBS)

### 3.1 Apa itu CBS

**Cost Breakdown Structure (CBS)** adalah kerangka klasifikasi biaya yang digunakan untuk mengkategorikan setiap jenis pengeluaran dalam proyek. CBS mendefinisikan "ke mana uang dibelanjakan" dengan mengelompokkan biaya ke dalam kategori-kategori yang bermakna secara operasional.

Dalam konteks Hexavara, CBS berfungsi sebagai **master data global** — artinya kategori CBS yang dibuat akan tersedia untuk dipilih dan digunakan oleh seluruh proyek dalam sistem. Contoh kategori CBS yang umum digunakan:

- **Material** — Biaya pengadaan bahan/material.
- **Upah / Tenaga Kerja** — Biaya jasa pekerja.
- **Sewa Alat** — Biaya penyewaan peralatan.
- **Subkontraktor** — Biaya jasa subkontraktor.
- **Overhead** — Biaya operasional umum.

#### Tipe Perhitungan CBS

Setiap kategori CBS memiliki tipe perhitungan yang menentukan bagaimana total biaya dihitung pada level WBS:

| Tipe         | Formula Perhitungan            | Contoh                                                 |
| ------------ | ------------------------------ | ------------------------------------------------------ |
| **Per Item** | Total = Harga Satuan x Volume  | Material semen: Rp 50.000 x 100 sak = Rp 5.000.000     |
| **Borongan** | Total = Harga Tetap (lump sum) | Jasa pemasangan: Rp 2.000.000 (tidak dikalikan volume) |

Perbedaan tipe ini penting karena mempengaruhi cara sistem menghitung total biaya pada setiap item pekerjaan di WBS.

### 3.2 Manajemen Kategori CBS (Master Data)

Halaman Manajemen CBS adalah halaman global (tidak terikat proyek tertentu) yang digunakan untuk mengelola seluruh kategori CBS dalam sistem.

[Gambar 11 — Halaman Manajemen Kategori CBS]

#### Tabel CBS

Halaman ini menampilkan tabel berisi semua kategori CBS yang telah terdaftar:

| Kolom      | Keterangan                                    |
| ---------- | --------------------------------------------- |
| **Name**   | Nama kategori CBS.                            |
| **Type**   | Tipe perhitungan: "Per Item" atau "Borongan". |
| **Action** | Aksi edit atau hapus kategori.                |

#### Penambahan Kategori Baru

Pengguna dapat menambah kategori CBS baru melalui dialog form yang meminta input:

- **Nama Kategori** — Nama deskriptif untuk kategori biaya.
- **Tipe** — Pilihan antara "Per Item" atau "Borongan".

Kategori yang dibuat di halaman ini akan langsung tersedia untuk dipilih pada seluruh proyek yang ada dalam sistem.

### 3.3 Pemilihan CBS pada Proyek

Setelah kategori CBS dibuat pada level master data, pengguna perlu **memilih kategori CBS mana yang relevan** untuk setiap proyek melalui halaman Project Overview (lihat [Bagian 2.4](#24-project-overview-detail--pengelolaan-proyek)).

Proses pemilihan CBS ini menentukan kolom-kolom biaya yang akan muncul pada tabel WBS proyek tersebut. Setiap proyek dapat memiliki kombinasi kategori CBS yang berbeda sesuai kebutuhan.

Selain memilih dari kategori yang sudah ada, pengguna juga dapat membuat kategori CBS baru secara langsung dari halaman Project Overview tanpa perlu berpindah ke halaman master data CBS.

[Gambar 12 — Proses pemilihan CBS pada proyek]

**Alur CBS secara ringkas:**

```
Master Data CBS → Pilih CBS di Project Overview → CBS menjadi kolom di tabel WBS
```

---

## BAB 4 — Perencanaan (Planning)

### 4.1 Work Breakdown Structure (WBS)

#### Apa itu WBS

**Work Breakdown Structure (WBS)** adalah metode untuk memecah keseluruhan lingkup pekerjaan proyek ke dalam komponen-komponen yang lebih kecil dan terstruktur secara hierarkis. Dalam Hexavara, WBS menjadi dasar utama perencanaan anggaran karena setiap item pekerjaan pada WBS memiliki alokasi biaya per kategori CBS.

WBS menjawab pertanyaan "apa saja pekerjaan yang perlu dilakukan" sekaligus "berapa biaya yang direncanakan untuk setiap pekerjaan".

[Gambar 13 — Halaman WBS]

#### Struktur Hierarki WBS

WBS dalam sistem ini memiliki tiga level hierarki:

| Level       | Nama        | Kode Contoh | Deskripsi                                                                                                                          |
| ----------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Level 1** | Kategori    | `1`         | Kelompok besar pekerjaan (misal: "Pekerjaan Struktur").                                                                            |
| **Level 2** | Subkategori | `1.1`       | Sub-kelompok pekerjaan (misal: "Pondasi").                                                                                         |
| **Level 3** | Pekerjaan   | `1.1.1`     | Item pekerjaan spesifik (misal: "Galian Tanah"). Ini adalah level terendah (leaf) yang memiliki volume, satuan, dan alokasi biaya. |

Kode WBS digenerate secara otomatis berdasarkan posisi dalam hierarki. Hanya item pada **Level 3 (Pekerjaan)** yang dapat memiliki detail volume dan biaya — Level 1 dan Level 2 berfungsi sebagai pengelompokan.

#### Kolom Tabel WBS

| Kolom                   | Keterangan                                                                      |
| ----------------------- | ------------------------------------------------------------------------------- |
| **WBS ID**              | Kode hierarki otomatis.                                                         |
| **Description**         | Deskripsi item pekerjaan.                                                       |
| **Volume**              | Kuantitas pekerjaan (hanya pada level Pekerjaan).                               |
| **Satuan**              | Satuan ukur (m, m2, m3, kg, ton, ls).                                           |
| **[Kolom CBS Dinamis]** | Satu kolom per kategori CBS yang dipilih. Berisi nilai biaya yang dialokasikan. |
| **Cost**                | Total biaya item (penjumlahan seluruh kolom CBS).                               |

#### Kartu Ringkasan WBS

Di bagian atas halaman, tiga kartu ringkasan memberikan visibilitas terhadap kondisi perencanaan:

| Kartu                                        | Deskripsi                                                                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Total Budget Proyek**                      | Anggaran proyek sebagai acuan.                                                                                             |
| **Total Rencana Anggaran Pelaksanaan (RAP)** | Jumlah total biaya dari seluruh item WBS.                                                                                  |
| **Selisih Budget - RAP**                     | Selisih antara budget dan RAP. Ditampilkan hijau jika positif (di bawah budget) atau merah jika negatif (melebihi budget). |

[Gambar 14 — Kartu ringkasan dan tabel WBS]

#### Rencana Anggaran Pelaksanaan (RAP)

**RAP (Rencana Anggaran Pelaksanaan)** adalah istilah yang digunakan dalam sistem untuk merujuk pada total biaya yang direncanakan berdasarkan penyusunan WBS. RAP dihitung sebagai penjumlahan seluruh biaya item pekerjaan (Level 3) pada WBS.

RAP berbeda dengan Budget:

- **Budget** = anggaran yang ditetapkan pada saat proyek dibuat (nilai kontrak).
- **RAP** = rencana pelaksanaan yang disusun berdasarkan detail pekerjaan di WBS.

Idealnya RAP tidak melebihi Budget, namun sistem tetap memungkinkan penyusunan RAP yang melebihi budget dengan indikator peringatan visual.

#### Fitur Pendukung

- **Mode Edit/View** — Pengguna dapat beralih antara mode tampilan dan mode edit untuk menambah, mengubah, atau menghapus item WBS.
- **Pencarian** — Fitur pencarian hierarkis untuk menemukan item WBS tertentu.
- **Footer Total** — Baris total di bagian bawah tabel menampilkan akumulasi RAP dan total per kategori CBS.

### 4.2 Termin Planning (Alokasi Volume per Termin)

#### Apa itu Termin Planning

**Termin Planning** adalah fitur untuk mengalokasikan volume pekerjaan dari setiap item WBS ke masing-masing termin pembayaran. Fitur ini menjawab pertanyaan: "pada setiap tahap termin, berapa volume pekerjaan yang direncanakan untuk dikerjakan?"

Alokasi ini menjadi dasar untuk pemantauan progres — sistem akan membandingkan volume aktual yang dilaporkan dengan volume yang telah direncanakan pada setiap termin.

[Gambar 15 — Halaman Termin Planning]

#### Kartu Ringkasan Alokasi

| Kartu                  | Warna  | Deskripsi                                                            |
| ---------------------- | ------ | -------------------------------------------------------------------- |
| **Allocated Volume**   | Hijau  | Persentase total volume pekerjaan yang telah dialokasikan ke termin. |
| **Unallocated Volume** | Kuning | Persentase volume yang belum dialokasikan.                           |

#### Tabel Alokasi

Tabel alokasi memiliki struktur sebagai berikut:

- **Baris**: Setiap item pekerjaan (Level 3) dari WBS.
- **Kolom tetap**: WBS ID, Description, Volume, Satuan.
- **Kolom dinamis**: Satu kolom per termin (termasuk termin adendum), dengan header menampilkan nomor dan persentase termin.

Setiap sel yang dapat diedit mewakili alokasi volume pekerjaan pada termin tertentu. Sistem memvalidasi bahwa total volume yang dialokasikan tidak melebihi volume total item tersebut.

[Gambar 16 — Detail tabel alokasi termin]

#### Indikator Status Alokasi

| Indikator           | Warna  | Makna                                              |
| ------------------- | ------ | -------------------------------------------------- |
| Completed           | Hijau  | Seluruh volume item telah dialokasikan sepenuhnya. |
| Partially Allocated | Kuning | Volume baru terisi sebagian.                       |
| Editable            | Biru   | Termin yang sedang dalam mode edit.                |

---

## BAB 5 — Cost In (Pemasukan Proyek)

### 5.1 Apa itu Cost In

**Cost In** adalah modul untuk mencatat dan memantau seluruh pemasukan proyek. Dalam konteks proyek berbasis kontrak, Cost In umumnya merupakan pembayaran dari pemilik proyek (owner) kepada pelaksana, yang diterima berdasarkan milestone termin yang telah disepakati.

Setiap pencatatan Cost In dikaitkan dengan termin tertentu, sehingga sistem dapat melacak apakah pembayaran untuk setiap termin sudah diterima secara penuh (lunas) atau masih terdapat kekurangan.

[Gambar 17 — Halaman Cost In Monitoring]

### 5.2 Pencatatan Cost In

Untuk mencatat pemasukan baru, pengguna mengisi formulir dengan field berikut:

| Field              | Keterangan                                                            |
| ------------------ | --------------------------------------------------------------------- |
| **Termin**         | Pilihan termin atau adendum yang terkait dengan pembayaran.           |
| **Date**           | Tanggal penerimaan pembayaran.                                        |
| **Description**    | Keterangan pembayaran (misal: "Uang Muka 20%", "Pelunasan Termin 3"). |
| **Nominal (Rp)**   | Jumlah nominal yang diterima.                                         |
| **Bukti Transfer** | Unggah bukti transfer atau dokumen pembayaran (gambar/PDF).           |

[Gambar 18 — Dialog pencatatan Cost In baru]

Satu termin dapat menerima lebih dari satu pencatatan Cost In (misalnya pembayaran dicicil), dan sistem akan mengakumulasikan seluruh pembayaran per termin.

### 5.3 Ringkasan & Riwayat Cost In

#### Kartu Ringkasan

| Kartu             | Deskripsi                                          |
| ----------------- | -------------------------------------------------- |
| **Budget**        | Total anggaran proyek (termasuk adendum jika ada). |
| **Total Cost In** | Akumulasi seluruh pembayaran yang telah diterima.  |

#### Tab Ringkasan Cost In

Menampilkan tabel ringkasan per termin:

| Kolom              | Keterangan                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Termin**         | Nomor termin atau adendum.                                                                   |
| **Deskripsi**      | Deskripsi termin.                                                                            |
| **Nominal Termin** | Nilai nominal termin yang disepakati.                                                        |
| **Total Diterima** | Total pembayaran yang sudah diterima untuk termin tersebut.                                  |
| **Selisih**        | Perbedaan antara nominal termin dan total yang diterima.                                     |
| **Status**         | **Lunas** (hijau) jika pembayaran sudah penuh, **Belum Lunas** (kuning) jika masih ada sisa. |

#### Tab Riwayat Cost In

Menampilkan daftar seluruh transaksi pemasukan secara kronologis:

| Kolom         | Keterangan                |
| ------------- | ------------------------- |
| **Tanggal**   | Tanggal transaksi.        |
| **Termin**    | Termin terkait.           |
| **Deskripsi** | Keterangan transaksi.     |
| **Nominal**   | Nilai transaksi.          |
| **Aksi**      | Tautan ke halaman detail. |

#### Detail Riwayat Cost In

Halaman detail menampilkan informasi lengkap sebuah catatan Cost In termasuk informasi termin, nominal, deskripsi, tanggal transaksi, pencatat, dan kemampuan untuk melihat bukti transfer yang telah diunggah.

[Gambar 19 — Detail riwayat Cost In]

---

## BAB 6 — Cost Control (Pengeluaran Proyek)

### 6.1 Apa itu Cost Control

**Cost Control** adalah modul untuk mengelola seluruh pengeluaran proyek. Berbeda dengan Cost In yang bersifat pencatatan langsung, Cost Control menerapkan **mekanisme pengajuan dan persetujuan (approval workflow)** untuk setiap pengeluaran.

Setiap pengeluaran harus diajukan terlebih dahulu (Request Cost Out), kemudian menunggu persetujuan sebelum dicatat sebagai pengeluaran resmi. Mekanisme ini menjamin bahwa setiap pengeluaran telah divalidasi dan diotorisasi.

[Gambar 20 — Halaman Cost Control]

### 6.2 Pencatatan Pengeluaran (Record Cost Out)

Formulir pengajuan pengeluaran terbagi menjadi dua bagian:

[Gambar 21 — Formulir Record Cost Out]

#### A. Informasi Umum

| Field                | Keterangan                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **WBS Item**         | Item pekerjaan WBS yang terkait (dipilih melalui pencarian).                                           |
| **Activity Name**    | Nama kegiatan yang membutuhkan pengeluaran.                                                            |
| **Vendor/Supplier**  | Penyedia barang atau jasa. Dapat dipilih dari daftar yang ada atau dibuat baru langsung dari formulir. |
| **Transaction Date** | Tanggal transaksi.                                                                                     |
| **Upload Nota**      | Unggah nota atau bukti pembelian.                                                                      |

#### B. Daftar Item Biaya

Setiap pengajuan dapat memiliki satu atau lebih item biaya. Setiap item memiliki:

| Field              | Keterangan                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Description**    | Deskripsi item biaya. Dapat dipilih dari daftar yang ada atau dibuat baru langsung dari formulir. |
| **CBS Category**   | Kategori CBS tempat biaya ini diklasifikasikan.                                                   |
| **Unit Cost (Rp)** | Harga satuan.                                                                                     |
| **Qty**            | Kuantitas.                                                                                        |
| **Total**          | Dihitung otomatis (Unit Cost x Qty).                                                              |

Sistem menampilkan **Total Cost** akumulatif di bagian bawah formulir sebagai ringkasan sebelum pengajuan dikirim.

### 6.3 Alur Persetujuan (Approval Workflow)

Setiap pengajuan pengeluaran melalui alur persetujuan berikut:

```
Pengajuan (Pending) → Approve / Reject
```

[Gambar 22 — Alur persetujuan pengeluaran]

#### Status Pengajuan

| Status       | Deskripsi                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Pending**  | Pengajuan telah dikirim dan menunggu keputusan.                                             |
| **Approved** | Pengajuan disetujui. Pengeluaran dicatat secara resmi dan masuk ke perhitungan Cost Report. |
| **Rejected** | Pengajuan ditolak. Pengeluaran tidak dicatat.                                               |

#### Proses Persetujuan (Approve)

Saat menyetujui pengajuan, pihak yang berwenang **wajib mengunggah bukti transfer atau bukti pembayaran**. Hal ini memastikan bahwa setiap pengeluaran yang disetujui memiliki dokumentasi pembayaran yang sah.

#### Proses Penolakan (Reject)

Saat menolak pengajuan, pihak yang berwenang **wajib mengisi alasan penolakan**. Alasan ini akan tercatat dan dapat dilihat pada detail pengeluaran sebagai referensi.

### 6.4 Riwayat & Detail Pengeluaran

#### Tab Pending Requests

Menampilkan daftar pengajuan yang menunggu keputusan dalam format kartu. Setiap kartu menunjukkan tanggal, vendor, nama kegiatan, item WBS, daftar item biaya, total, serta tombol aksi Approve dan Reject.

#### Tab Cost Out History

Menampilkan riwayat seluruh pengeluaran (baik yang disetujui maupun ditolak) dalam bentuk tabel:

| Kolom             | Keterangan                |
| ----------------- | ------------------------- |
| **Date**          | Tanggal transaksi.        |
| **Activity Name** | Nama kegiatan.            |
| **WBS Item**      | Item WBS terkait.         |
| **Vendor**        | Nama vendor/supplier.     |
| **Total Amount**  | Total biaya.              |
| **Status**        | Approved atau Rejected.   |
| **Action**        | Tautan ke halaman detail. |

Pengguna dapat memfilter riwayat berdasarkan status (All, Approved, Rejected).

#### Detail Pengeluaran

Halaman detail menampilkan informasi lengkap sebuah catatan pengeluaran termasuk:

- Tabel item biaya beserta kategori CBS, harga satuan, kuantitas, dan total per item.
- Metadata: status, tanggal, item WBS, pengaju, pihak yang menyetujui (beserta waktu), dan alasan penolakan (jika ditolak).
- Kemampuan untuk melihat nota dan bukti transfer yang telah diunggah.
- Fungsi cetak bukti transaksi.

[Gambar 23 — Detail pengeluaran Cost Out]

---

## BAB 7 — Cost Report (Laporan Biaya)

### 7.1 Apa itu Cost Report

**Cost Report** adalah modul pelaporan yang menyajikan perbandingan antara **Rencana Anggaran Pelaksanaan (RAP)** dengan **pengeluaran aktual** proyek. Modul ini memberikan visibilitas terhadap kesehatan keuangan proyek secara real-time, membantu pengelola proyek mengidentifikasi apakah pengeluaran masih berada dalam koridor anggaran atau sudah melampaui batas.

Cost Report mengkonsolidasikan data dari modul WBS (sumber RAP), Cost In (pemasukan), dan Cost Control (pengeluaran aktual) ke dalam satu tampilan terpadu.

[Gambar 24 — Halaman Cost Report]

### 7.2 Dashboard Ringkasan Biaya

Di bagian atas halaman, lima kartu ringkasan menyajikan gambaran utuh kondisi keuangan proyek:

| Kartu              | Deskripsi                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **Budget**         | Total anggaran proyek (termasuk adendum).                                                                |
| **Total Cost In**  | Akumulasi pemasukan yang telah diterima.                                                                 |
| **Total RAP**      | Total Rencana Anggaran Pelaksanaan dari WBS.                                                             |
| **Total Expenses** | Total pengeluaran aktual yang telah disetujui. Ditampilkan dengan indikator merah jika melebihi RAP.     |
| **RAP - Expenses** | Sisa anggaran pelaksanaan. Hijau jika positif (masih ada sisa), merah jika negatif (sudah melebihi RAP). |

[Gambar 25 — Kartu ringkasan Cost Report]

### 7.3 Visualisasi & Grafik

Cost Report menyediakan dua jenis visualisasi:

#### A. Budget Usage Chart (Grafik Donut)

Grafik radial yang menampilkan persentase penggunaan RAP terhadap pengeluaran aktual.

| Kondisi             | Warna  | Keterangan                                              |
| ------------------- | ------ | ------------------------------------------------------- |
| < 80% terpakai      | Hijau  | Kondisi aman, ditampilkan label **"IN Budget"**.        |
| 80% - 100% terpakai | Kuning | Mendekati batas, ditampilkan peringatan.                |
| > 100% terpakai     | Merah  | Melebihi anggaran, ditampilkan label **"OVER Budget"**. |

[Gambar 26 — Budget Usage Chart]

#### B. Comparison per Category (Grafik Batang)

Grafik batang berkelompok yang membandingkan nilai **Planned (RAP)** dan **Actual (Pengeluaran)** untuk setiap kategori CBS. Visualisasi ini membantu mengidentifikasi kategori biaya mana yang memiliki deviasi terbesar.

[Gambar 27 — Grafik perbandingan per kategori CBS]

### 7.4 Laporan per CBS

Tab Summary menampilkan tabel ringkasan biaya per kategori CBS:

| Kolom              | Keterangan                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| **CBS Category**   | Nama kategori beserta tipe perhitungannya.                                    |
| **Total RAP**      | Total rencana biaya untuk kategori tersebut.                                  |
| **Total Expenses** | Total pengeluaran aktual untuk kategori tersebut.                             |
| **Status**         | **Safe** (pengeluaran di bawah RAP) atau **Over** (pengeluaran melebihi RAP). |

### 7.5 Laporan per WBS (Drilldown)

Tab WBS Cost Table menampilkan tabel hierarkis mengikuti struktur WBS:

| Kolom              | Keterangan                          |
| ------------------ | ----------------------------------- |
| **WBS ID**         | Kode hierarki WBS.                  |
| **Description**    | Deskripsi item pekerjaan.           |
| **Total RAP**      | Rencana biaya per item.             |
| **Total Expenses** | Pengeluaran aktual per item.        |
| **Remaining**      | Sisa anggaran per item.             |
| **Status**         | Indikator visual (aman/melebihi).   |
| **Action**         | Tautan ke halaman drilldown detail. |

#### Halaman Drilldown WBS

Untuk setiap item pekerjaan (Level 3), pengguna dapat melihat detail seluruh pengeluaran yang terkait. Halaman ini menampilkan:

- Tiga kartu ringkasan: Total RAP, Total Expenses, dan Remaining.
- Daftar catatan pengeluaran yang telah disetujui dalam format kartu, berisi informasi vendor, nama kegiatan, daftar item biaya per kategori CBS, total, serta metadata pengaju dan pihak yang menyetujui.

[Gambar 28 — Halaman drilldown WBS Cost Detail]

---

## BAB 8 — Progress Monitoring

### 8.1 Apa itu Progress Monitoring

**Progress Monitoring** adalah modul untuk memantau dan mencatat progres fisik pelaksanaan pekerjaan proyek. Modul ini membandingkan **volume pekerjaan yang direncanakan** (dari Termin Planning) dengan **volume aktual yang telah diselesaikan**, sehingga pengelola proyek dapat mengetahui apakah pelaksanaan pekerjaan berjalan sesuai jadwal.

Setiap pembaruan progres didokumentasikan dengan bukti foto, menciptakan jejak audit visual terhadap pelaksanaan pekerjaan di lapangan.

[Gambar 29 — Halaman Progress Monitoring]

### 8.2 Tabel Progress (Rencana vs Aktual)

Tab Progress Table menampilkan matriks perbandingan antara rencana dan realisasi volume pekerjaan:

**Struktur kolom:**

| Kolom Tetap     | Keterangan                |
| --------------- | ------------------------- |
| **WBS ID**      | Kode hierarki WBS.        |
| **Description** | Deskripsi item pekerjaan. |
| **Volume**      | Total volume pekerjaan.   |
| **Satuan**      | Satuan ukur.              |

Untuk setiap termin, terdapat dua sub-kolom:

| Sub-kolom   | Keterangan                                                            |
| ----------- | --------------------------------------------------------------------- |
| **Planned** | Volume yang direncanakan pada termin tersebut (dari Termin Planning). |
| **Actual**  | Volume aktual yang telah dilaporkan selesai.                          |

Kolom tambahan di bagian akhir:

| Kolom             | Keterangan                                             |
| ----------------- | ------------------------------------------------------ |
| **Total Actual**  | Akumulasi seluruh volume aktual yang telah dilaporkan. |
| **Remaining Vol** | Sisa volume yang belum diselesaikan.                   |

Tabel ini mengikuti struktur hierarki WBS sehingga pengguna dapat melihat progres pada setiap level.

[Gambar 30 — Tabel Progress Monitoring]

### 8.3 Ringkasan & Grafik S-Curve

Tab Summary menyajikan dua komponen:

#### Kartu Ringkasan Progress

| Kartu                | Deskripsi                                      |
| -------------------- | ---------------------------------------------- |
| **Total Tasks**      | Jumlah total item pekerjaan (level Pekerjaan). |
| **Completed Tasks**  | Jumlah item pekerjaan yang telah selesai 100%. |
| **Remaining Tasks**  | Jumlah item pekerjaan yang belum selesai.      |
| **Overall Progress** | Persentase progres keseluruhan proyek.         |

#### Grafik S-Curve

Grafik S-Curve adalah visualisasi standar dalam manajemen proyek yang menampilkan kurva kumulatif progres dari waktu ke waktu. Dalam sistem ini, grafik menampilkan dua garis:

| Garis       | Warna | Deskripsi                                                    |
| ----------- | ----- | ------------------------------------------------------------ |
| **Planned** | Biru  | Kurva progres kumulatif yang direncanakan.                   |
| **Actual**  | Hijau | Kurva progres kumulatif aktual berdasarkan laporan lapangan. |

Grafik ini mendukung dua tampilan periode: **Mingguan (Weekly)** dan **Bulanan (Monthly)**.

Dengan membandingkan kedua kurva, pengelola proyek dapat segera mengidentifikasi:

- **Deviasi positif** — progres aktual melampaui rencana (ahead of schedule).
- **Deviasi negatif** — progres aktual tertinggal dari rencana (behind schedule).

[Gambar 31 — Grafik S-Curve Progress Monitoring]

### 8.4 Pencatatan Update Progress

Untuk mencatat pembaruan progres, pengguna mengisi formulir melalui dialog:

| Field                      | Keterangan                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| **WBS Item**               | Item pekerjaan yang akan di-update (dipilih melalui pencarian).   |
| **Termin**                 | Termin atau adendum yang terkait.                                 |
| **Description**            | Keterangan mengenai pekerjaan yang telah dilakukan.               |
| **Total Completed Volume** | Total volume yang telah diselesaikan (kumulatif, bukan tambahan). |
| **Photo**                  | Unggah foto sebagai bukti dokumentasi pelaksanaan pekerjaan.      |

[Gambar 32 — Dialog Update Progress]

Sistem menampilkan informasi kontekstual berupa target volume termin dan total target volume sebagai panduan bagi pengguna saat mengisi data.

> **Catatan penting:** Input volume pada fitur ini bersifat **penggantian total (replacement)**, bukan penambahan. Artinya, nilai yang dimasukkan adalah total volume yang sudah selesai hingga saat ini, bukan volume tambahan sejak update terakhir.

### 8.5 Riwayat & Detail Progress

Tab Progress History menampilkan daftar kronologis seluruh pembaruan progres yang telah dicatat:

| Kolom                | Keterangan                      |
| -------------------- | ------------------------------- |
| **Date**             | Tanggal pencatatan.             |
| **WBS Item**         | Item pekerjaan terkait.         |
| **Termin**           | Termin terkait.                 |
| **Description**      | Keterangan pekerjaan.           |
| **Completed Volume** | Volume yang telah diselesaikan. |
| **Action**           | Tautan ke halaman detail.       |

#### Detail Riwayat Progress

Halaman detail menampilkan informasi lengkap sebuah catatan progress termasuk deskripsi pekerjaan, foto bukti pelaksanaan, tanggal, item WBS, informasi termin, dan volume yang diselesaikan beserta satuannya.

[Gambar 33 — Detail riwayat Progress Monitoring]

---

_Dokumen ini merupakan katalog produk Hexavara Cost Management System versi 1.0. Untuk panduan penggunaan lengkap, silakan merujuk pada dokumen User Manual yang terpisah._
