# Persetujuan Role dan Tautan Akun

Pendaftaran publik BintangAi tidak langsung mengaktifkan role guru/orang tua, kode kelas, atau hubungan orang tua-anak. Trigger pendaftaran menyimpan:

- `requested_role`: peran yang diminta pada formulir.
- `requested_class_code`: kode kelas yang diminta/dibuat pada formulir.
- `requested_linked_student_id`: ID siswa yang diminta untuk ditautkan oleh orang tua.

Role aktif pada akun baru tetap `siswa`. Hanya alamat demo yang telah ditentukan pada `sessionApi.js` yang menjadi pengecualian untuk keperluan presentasi. Data permintaan tidak memberi akses RLS sebelum administrator menyetujuinya.

## Memeriksa permintaan

Jalankan di Supabase SQL Editor dengan akun administrator:

```sql
select id, email, full_name, role, requested_role,
       requested_class_code, requested_linked_student_id,
       slb_name, class_level, subject
from public.profiles
where requested_role <> role
order by created_at asc;
```

## Menyetujui akun guru

Verifikasi identitas dan status guru terlebih dahulu, lalu jalankan untuk UUID akun yang telah disetujui:

```sql
update public.profiles
set role = 'guru',
    class_code = requested_class_code
where id = '<UUID_AKUN_GURU>'
  and requested_role = 'guru';
```

## Menyetujui akun orang tua/wali

Verifikasi hubungan wali dengan siswa melalui sekolah secara terpisah. Jangan menyetujui hanya karena seseorang mengetahui UUID siswa.

```sql
update public.profiles as parent
set role = 'ortu',
    linked_student_id = parent.requested_linked_student_id
where parent.id = '<UUID_AKUN_ORANG_TUA>'
  and parent.requested_role = 'ortu'
  and exists (
    select 1 from public.profiles as student
    where student.id = parent.requested_linked_student_id
      and student.role = 'siswa'
  );
```

## Menyetujui siswa masuk kelas

Setelah memastikan kode kelas milik guru yang benar:

```sql
update public.profiles
set class_code = requested_class_code
where id = '<UUID_AKUN_SISWA>'
  and role = 'siswa';
```

Jangan menjalankan contoh SQL dengan placeholder apa adanya. Selalu ganti UUID dan periksa permintaan secara manual sebelum persetujuan.
