# N1 CAD Cloud (v2)

แปลง DWG **บนเซิร์ฟเวอร์** แล้วส่ง scene เบาไปวาดบนเบราว์เซอร์

แยกจาก [`-cad-n1-viewer`](https://github.com/fabegasfang-maker/-cad-n1-viewer)

## สถานะเฟส

- [x] **เฟส 0** — โครง repo + health
- [x] **เฟส 1** — Drive latest + แปลง DWG บนเซิร์ฟเวอร์ + แคช scene
- [x] **เฟส 2** — เว็บโหลด `/api/scene` แล้ววาด canvas (pan/zoom)
- [ ] **เฟส 3** — profile=mobile UX + ปุ่มมือถือ
- [ ] **เฟส 4** — คิวแปลง / deploy production

## รันทั้งระบบ

### 1) API

```bash
cd apps/api
cp .env.example .env   # ใส่ GOOGLE_API_KEY=
npm install
npm run dev
# http://localhost:8787/api/health
```

### 2) Web

```bash
cd apps/web
cp .env.example .env   # VITE_API_BASE=http://localhost:8787
npm install
npm run dev
# http://localhost:5173
```

เปิดเว็บแล้วระบบจะเรียก `GET /api/scene` อัตโนมัติ — ครั้งแรกอาจช้า (แปลงบนเซิร์ฟเวอร์) ครั้งถัดไปใช้แคช

### การใช้บน canvas

- ลากเมาส์ = เลื่อน
- ลูกกลิ้ง = ซูม
- ปุ่ม **โหลดใหม่** / สลับ Desktop–Mobile
- **ดาวน์โหลด DWG** จาก Drive ผ่าน API

## API

| Path | คำอธิบาย |
|------|----------|
| `/api/health` | สถานะ |
| `/api/latest` | metadata ไฟล์ล่าสุด |
| `/api/scene?profile=desktop\|mobile` | scene JSON |
| `/api/download` | ไฟล์ DWG |

Default folder: `1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D`
