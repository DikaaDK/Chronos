<?php

return [
    'app' => [
        'name' => 'Chronos',
        'version' => 'Chronos v1.0',
    ],
    'navigation' => [
        'section_title' => 'Navigasi utama',
        'home' => 'Beranda',
        'journal' => 'Jurnal',
        'group' => 'Grup',
        'profile' => 'Profil',
        'cta' => 'Tulis jurnal baru',
    ],
    'bottom_bar' => [
        'home' => 'Home',
        'journal' => 'Journal',
        'group' => 'Group',
        'profile' => 'Profile',
        'add' => 'Tambah jurnal',
    ],
    'home' => [
        'hero' => [
            'welcome_user' => 'Selamat datang, :name 👋',
            'welcome_generic' => 'Selamat datang',
            'subtitle' => 'Catat cerita harianmu dengan tenang',
        ],
        'actions' => [
            'add' => 'Tambah',
            'journal' => 'Jurnal',
            'calendar' => 'Kalender',
        ],
        'sections' => [
            'latest' => [
                'title' => 'Jurnal Terbaru',
                'view_all' => 'Lihat semua',
                'empty' => [
                    'title' => 'Tidak ada jurnal yang tersimpan.',
                    'description' => 'Mulai tulis cerita pertamamu!',
                ],
            ],
        ],
        'accessibility' => [
            'view_journal' => 'Lihat detail jurnal :title',
        ],
        'edit_modal' => [
            'title' => 'Edit Jurnal',
            'submit' => 'Perbarui',
        ],
        'delete_modal' => [
            'title' => 'Hapus jurnal?',
            'description_with_title' => 'Jurnal ":title" akan dihapus permanen.',
            'description' => 'Jurnal ini akan dihapus permanen.',
            'confirm' => 'Hapus',
            'cancel' => 'Batal',
            'error_generic' => 'Gagal menghapus jurnal.',
            'error_network' => 'Terjadi kesalahan jaringan. Coba lagi.',
        ],
        'errors' => [
            'session_expired' => 'Sesi berakhir, silakan login ulang.',
            'load_failed' => 'Gagal memuat jurnal (:status)',
            'generic_load' => 'Tidak dapat memuat jurnal.',
        ],
        'defaults' => [
            'untitled_journal' => 'Jurnal tanpa judul',
        ],
    ],
    'journal' => [
        'header' => [
            'badge' => 'Arsip pribadi',
            'title' => 'Jurnal Harian',
            'description' => 'Jelajahi catatan yang sudah kamu tulis, edit seperlunya, dan pantau progres harianmu.',
        ],
        'stats' => [
            'total_label' => 'Total jurnal',
        ],
        'actions' => [
            'write' => 'Tulis Jurnal',
        ],
        'sidebar' => [
            'last_written_label' => 'Terakhir ditulis',
            'last_written_empty' => 'Belum ada jurnal',
            'tips_title' => 'Tips cepat',
            'tips_description' => 'Gunakan modal detail untuk mengedit atau menghapus jurnal tanpa meninggalkan halaman ini.',
        ],
        'empty_state' => [
            'title' => 'Belum ada jurnal yang tersimpan.',
            'description' => 'Awali cerita pertamamu dengan menekan tombol "Tulis Jurnal".',
            'cta' => 'Tulis Jurnal',
        ],
        'accessibility' => [
            'view_journal' => 'Lihat detail jurnal :title',
        ],
        'card' => [
            'overdue_badge' => 'Lewat batas waktu',
        ],
        'progress' => [
            'completed' => 'Selesai',
            'not_started' => 'Belum dimulai',
            'in_progress' => 'Sedang berlangsung',
        ],
        'create_modal' => [
            'title' => 'Tambah Jurnal',
            'submit' => 'Simpan',
        ],
        'edit_modal' => [
            'title' => 'Edit Jurnal',
            'submit' => 'Perbarui',
        ],
        'delete_modal' => [
            'title' => 'Hapus jurnal?',
            'description_with_title' => 'Jurnal ":title" akan dihapus permanen.',
            'description' => 'Jurnal ini akan dihapus permanen.',
            'confirm' => 'Hapus',
            'cancel' => 'Batal',
            'error_generic' => 'Gagal menghapus jurnal.',
            'error_network' => 'Terjadi kesalahan jaringan. Coba lagi.',
        ],
        'errors' => [
            'load_failed' => 'Gagal memuat data (:status)',
            'generic_load' => 'Tidak dapat memuat jurnal.',
            'user_fetch_failed' => 'Gagal mengambil user',
            'save_failed' => 'Gagal menyimpan jurnal.',
        ],
    ],
    'group' => [
        'header' => [
            'badge' => 'Kolaborasi',
            'title' => 'Kelola Group',
            'description' => 'Bangun tim produktif untuk menulis jurnal bersama. Buat group baru atau masukkan kode undangan untuk bergabung.',
        ],
        'stats' => [
            'total_label' => 'Total group aktif',
            'total_helper' => 'Termasuk group yang kamu kelola dan ikuti.',
        ],
        'forms' => [
            'create' => [
                'title' => 'Buat Group Baru',
                'description' => 'Susun komunitas menulis bersama temanmu.',
                'name_label' => 'Nama Group',
                'name_placeholder' => 'Contoh: Squad Produktif',
                'description_label' => 'Deskripsi',
                'description_placeholder' => 'Tuliskan tujuan group atau aturan singkat.',
                'submit' => 'Buat Group',
            ],
            'join' => [
                'title' => 'Masuk dengan Kode',
                'description' => 'Masukkan kode undangan yang kamu terima.',
                'invite_label' => 'Kode Undangan',
                'invite_placeholder' => 'Masukkan kode',
                'submit' => 'Bergabung',
            ],
        ],
        'list' => [
            'title' => 'Group Kamu',
            'count_label' => ':count group aktif',
            'empty' => 'Belum ada group yang kamu ikuti. Kamu bisa membuat group baru atau masuk dengan kode undangan.',
        ],
        'card' => [
            'no_description' => 'Belum ada deskripsi.',
            'view_detail' => 'Lihat detail group',
        ],
    ],
    'group_detail' => [
        'status' => [
            'none' => '-',
            'done' => 'Selesai',
            'progress' => 'Sedang berlangsung',
            'pending' => 'Pending',
            'unselected' => 'Belum dipilih',
        ],
    ],
    'auth' => [
        'login' => [
            'sidebar' => [
                'brand_title' => 'Chronos Travel',
                'brand_since' => 'Sejak 2022',
                'hero_title' => 'Ruang kerja biru untuk menemani ritme perjalananmu.',
                'hero_subtitle' => 'Kelola itinerary, mood tracker, dan highlight destinasi favorit dalam satu dashboard yang responsif.',
                'writers' => '2.3k penulis perjalanan aktif',
            ],
            'highlights' => [
                'itinerary' => 'Template itinerary adaptif untuk city break, road trip, atau slow travel.',
                'destinations' => 'Simpan highlight destinasi favorit dan tandai mood tiap lokasi.',
                'mood' => 'Mood journaling harian dengan insight perjalanan otomatis tersusun.',
            ],
            'badge' => [
                'left' => 'Chronos Login',
                'right' => 'Terproteksi · 24/7',
            ],
            'hero' => [
                'pretitle' => 'Selamat datang',
                'title' => 'Masuk untuk mulai menulis cerita perjalananmu.',
                'description' => 'Pantau itinerary, catatan mood, dan insight destinasi langsung dari dashboard Chronos.',
            ],
            'form' => [
                'email_label' => 'Email',
                'email_placeholder' => 'Chronos@gmail.com',
                'password_label' => 'Password',
                'password_placeholder' => '••••••••',
                'remember' => 'Ingat saya',
                'forgot' => 'Lupa password?',
                'submit' => 'Masuk sekarang',
                'processing' => 'Memproses...',
                'social_divider' => 'atau lanjutkan dengan',
                'social_facebook' => 'Facebook',
                'social_github' => 'GitHub',
            ],
            'toggle_password' => [
                'show' => 'Tampilkan password',
                'hide' => 'Sembunyikan password',
            ],
            'errors' => [
                'validation' => 'Lengkapi semua form dengan benar.',
                'credentials' => 'Email atau password salah.',
                'server' => 'Terjadi kesalahan server.',
            ],
            'footer' => [
                'question' => 'Belum punya akun?',
                'cta' => 'Daftar gratis sekarang',
            ],
        ],
    ],
    'profile' => [
        'default_name' => 'Pengguna Chronos',
        'default_email' => 'email@chronos.app',
        'email_label' => 'Email',
        'status_label' => 'Status',
        'status_active' => 'Akun aktif',
        'card_cta' => 'Pengaturan',
        'sidebar_subtitle' => 'Kelola preferensi profilmu',
        'cards' => [
            'account' => [
                'title' => 'Pengaturan Akun',
                'description' => 'Kelola preferensi login dan keamanan.',
            ],
            'personal' => [
                'title' => 'Informasi Pribadi',
                'description' => 'Perbarui nama lengkap dan detail lainnya.',
            ],
            'language' => [
                'title' => 'Ubah Bahasa',
                'description' => 'Sesuaikan Chronos dengan bahasa pilihanmu.',
            ],
            'appearance' => [
                'title' => 'Preferensi Tampilan',
                'description' => 'Atur tema serta mode tampilan favorit.',
            ],
        ],
        'language_preference' => [
            'title' => 'Preferensi bahasa',
            'description' => 'Pilih bahasa yang digunakan di aplikasi.',
            'select_label' => 'Bahasa aplikasi',
            'save' => 'Simpan bahasa',
            'success' => 'Bahasa aplikasi diubah ke :language.',
            'error' => 'Gagal memperbarui bahasa, coba lagi.',
            'options' => [
                'id' => 'Bahasa Indonesia',
                'en' => 'English',
                'zh' => 'Mandarin',
            ],
        ],
        'logout' => [
            'button' => 'Keluar',
            'processing' => 'Keluar...',
        ],
    ],
    'modals' => [
        'logout' => [
            'title' => 'Konfirmasi Logout',
            'description' => 'Apakah Anda yakin ingin keluar dari akun Chronos?',
            'confirm' => 'Keluar',
            'cancel' => 'Batal',
        ],
    ],
    'common' => [
        'processing' => 'Memproses...',
    ],
];
