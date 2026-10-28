# N1 CAD Cloud (v2)

แปลง DWG **บนเซิร์ฟเวอร์** แล้วส่ง scene เบาไปวาดบนเบราว์เซอร์

แยกจาก [`-cad-n1-viewer`](https://github.com/fabegasfang-maker/-cad-n1-viewer)

## สถานะเฟส

- [x] **เฟส 0** — โครง repo + health
- [x] **เฟส 1** — Drive latest + แปลง DWG บนเซิร์ฟเวอร์ + แคช scene
- [x] **เฟส 2** — เว็บโหลด `/api/scene` แล้ววาด canvas
- [x] **เฟส 3** — มือถือ auto-profile, แบนเนอร์, ดาวน์โหลด DWG, pinch-zoom
- [ ] **เฟส 4** — คิวแปลง / deploy production

## รันทั้งระบบ

### API

```bash
cd apps/api
cp .env.example .env   # GOOGLE_API_KEY=
npm install && npm run dev
```

### Web

```bash
cd apps/web
cp .env.example .env   # VITE_API_BASE=http://localhost:8787
npm install && npm run dev
```

เปิด http://localhost:5173

### มือถือ

- ตรวจจับอัตโนมัติ → ใช้ `profile=mobile`
- แสดงแบนเนอร์: **ดาวน์โหลดไฟล์งาน** หรือ **ดูแบบย่อในเว็บ**
- สองนิ้วซูม / นิ้วเดียวเลื่อน
- เครื่องลูกไม่แปลง DWG (ทำบน API)

## API

| Path | คำอธิบาย |
|------|----------|
| `/api/health` | สถานะ |
| `/api/latest` | metadata ไฟล์ล่าสุด |
| `/api/scene?profile=desktop\|mobile` | scene JSON |
| `/api/download` | ไฟล์ DWG |

Default folder: `1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D`
