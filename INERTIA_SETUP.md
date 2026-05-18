# Setup Inertia + React untuk Wargify Superadmin

## Apa yang sudah dikonfigurasi:

### 1. **Packages yang diinstall:**
   - `inertiajs/inertia-laravel` - Backend Laravel integration
   - `@inertiajs/react` - Frontend React adapter
   - `@vitejs/plugin-react` - Vite React plugin
   - `react` & `react-dom` - React library

### 2. **File yang diupdate:**
   - ✅ `vite.config.js` - Ditambahkan React plugin dan mengubah entry point ke `app.jsx`
   - ✅ `config/inertia.php` - SSR dimatikan untuk development (dapat diaktifkan nanti)
   - ✅ `resources/js/app.jsx` - Entry point React dengan Inertia setup
   - ✅ `resources/views/app.blade.php` - Blade template untuk Inertia
   - ✅ `bootstrap/app.php` - Middleware HandleInertiaRequests didaftarkan
   - ✅ `routes/web.php` - Route dashboard menggunakan Inertia

### 3. **Folder struktur yang dibuat:**
   - `resources/js/Pages/` - Komponen pages/halaman
   - `resources/js/Components/` - Komponen reusable
   - `resources/js/Layouts/` - Layout components
   - ✅ `resources/js/Pages/Dashboard.jsx` - Halaman dashboard example
   - ✅ `resources/js/Layouts/AppLayout.jsx` - Layout utama

### 4. **Middleware:**
   - ✅ `app/Http/Middleware/HandleInertiaRequests.php` - Middleware untuk Inertia

## Cara menggunakan:

### Development:
```bash
cd backend
npm run dev
# Di terminal lain:
php artisan serve
```

### Build untuk Production:
```bash
npm run build
php artisan optimize
```

## File struktur:
```
resources/js/
├── app.jsx                 # Entry point
├── Pages/
│   └── Dashboard.jsx       # Halaman dashboard
├── Components/             # Komponen reusable
└── Layouts/
    └── AppLayout.jsx       # Layout utama
```

## Membuat halaman baru:
1. Buat file di `resources/js/Pages/NamaHalaman.jsx`
2. Di route/controller, gunakan: `Inertia::render('NamaHalaman', ['data' => $data])`

Contoh:
```jsx
// resources/js/Pages/Users.jsx
export default function Users({ users }) {
    return (
        <AppLayout>
            <h1>Users List</h1>
        </AppLayout>
    )
}
```

```php
// routes/web.php
Route::get('/users', function () {
    return Inertia::render('Users', [
        'users' => User::all(),
    ]);
});
```
