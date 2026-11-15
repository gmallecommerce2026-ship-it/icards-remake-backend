// Bảo đảm bảng/cột của mẫu thiệp và phong bì khớp với code (dashboard admin dùng các cột này).
// Chỉ THÊM phần còn thiếu, không xoá hay sửa dữ liệu. Chạy nhiều lần vẫn an toàn.
//
//   node --env-file-if-exists=.env scripts/migrations/ensure-template-schema.mjs
//
// Sau khi chạy xong, nếu danh mục nhóm (template_category_nodes) vừa được tạo mới, nạp lại dữ liệu:
//   npm run seed -- --repair
import mysql from 'mysql2/promise';

const env = (k, d) => process.env[k] ?? d;
const conn = await mysql.createConnection({
  host: env('DB_HOST', '127.0.0.1'),
  port: Number(env('DB_PORT', 3306)),
  user: must('DB_USER'),
  password: must('DB_PASSWORD'),
  database: must('DB_NAME'),
  charset: 'utf8mb4',
  timezone: 'Z',
});

function must(k) {
  const v = process.env[k];
  if (!v) {
    console.error(`Thiếu biến môi trường ${k}`);
    process.exit(1);
  }
  return v;
}

const [[{ db }]] = await conn.query('SELECT DATABASE() AS db');

async function tableExists(name) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
    [db, name],
  );
  return rows.length > 0;
}

async function columnExists(table, column) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
    [db, table, column],
  );
  return rows.length > 0;
}

/** Kiểm tra theo cột: đã có index trên cột đó (dù tên khác) thì không thêm trùng. */
async function indexOnColumn(table, column) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND column_name = ?',
    [db, table, column],
  );
  return rows.length > 0;
}

async function fkExists(table, name) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.table_constraints WHERE table_schema = ? AND table_name = ? AND constraint_name = ?',
    [db, table, name],
  );
  return rows.length > 0;
}

const done = [];
const skipped = [];

async function step(label, check, sql) {
  if (await check()) {
    skipped.push(label);
    return;
  }
  await conn.query(sql);
  done.push(label);
}

// 1. Bảng cây danh mục (migration 2026-11-template-categories)
await step(
  'bảng template_category_nodes',
  () => tableExists('template_category_nodes'),
  `CREATE TABLE template_category_nodes (
     _id char(24) NOT NULL,
     createdAt datetime(6) NOT NULL DEFAULT current_timestamp(6),
     updatedAt datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
     slug varchar(100) NOT NULL,
     label varchar(200) NOT NULL,
     parentId char(24) DEFAULT NULL,
     keyPath varchar(500) NOT NULL,
     sortOrder int(11) NOT NULL DEFAULT 0,
     PRIMARY KEY (_id),
     UNIQUE KEY IDX_4bd4377f4da8c84f307857b522 (slug),
     KEY IDX_6f3cb57c3a4e10e6164621993c (parentId),
     KEY IDX_b5d6750880242752129fa51406 (keyPath)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
);

// 2. Cột kiểu thiệp / kiểu dáng / bố cục (migration 2026-11-template-card)
const T = 'invitation_templates';
await step(
  'cột format',
  () => columnExists(T, 'format'),
  `ALTER TABLE ${T} ADD COLUMN format ENUM('folding','card') NOT NULL DEFAULT 'folding' AFTER isPublished`,
);
await step(
  'index format',
  () => indexOnColumn(T, 'format'),
  `ALTER TABLE ${T} ADD INDEX IDX_invitation_templates_format (format)`,
);
await step(
  'cột orientation',
  () => columnExists(T, 'orientation'),
  `ALTER TABLE ${T} ADD COLUMN orientation ENUM('landscape','square','portrait') NOT NULL DEFAULT 'portrait' AFTER format`,
);
await step(
  'index orientation',
  () => indexOnColumn(T, 'orientation'),
  `ALTER TABLE ${T} ADD INDEX IDX_invitation_templates_orientation (orientation)`,
);
await step('cột layout', () => columnExists(T, 'layout'), `ALTER TABLE ${T} ADD COLUMN layout JSON NULL AFTER orientation`);

// 3. Cột nhóm danh mục (migration 2026-11-template-categories)
await step(
  'cột categoryId',
  () => columnExists(T, 'categoryId'),
  `ALTER TABLE ${T} ADD COLUMN categoryId char(24) DEFAULT NULL AFTER slug`,
);
await step(
  'index categoryId',
  () => indexOnColumn(T, 'categoryId'),
  `ALTER TABLE ${T} ADD KEY IDX_540f32a7581647b372355d11a1 (categoryId)`,
);
await step(
  'khóa ngoại categoryId',
  () => fkExists(T, 'FK_540f32a7581647b372355d11a1f'),
  `ALTER TABLE ${T} ADD CONSTRAINT FK_540f32a7581647b372355d11a1f FOREIGN KEY (categoryId) REFERENCES template_category_nodes (_id) ON DELETE SET NULL ON UPDATE NO ACTION`,
);

// 4. Cột thiết kế canvas (migration 2026-11-template-design)
await step('cột design', () => columnExists(T, 'design'), `ALTER TABLE ${T} ADD COLUMN design JSON NULL AFTER categoryId`);

// Kiểm tra cuối: các truy vấn của dashboard admin phải chạy được
const [rows] = await conn.query(`SELECT _id, categoryId, design, layout, format, orientation FROM ${T} LIMIT 1`);
void rows;
await conn.query('SELECT _id FROM template_category_nodes LIMIT 1');

console.log(`Đã thêm: ${done.length ? done.join(', ') : 'không có'}`);
console.log(`Đã có sẵn: ${skipped.length} mục`);
const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM template_category_nodes');
if (n === 0) console.log('Lưu ý: danh mục nhóm đang trống. Chạy: npm run seed -- --repair');
await conn.end();
