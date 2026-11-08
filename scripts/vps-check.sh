#!/usr/bin/env bash
# Chạy trên VPS:  bash scripts/vps-check.sh
# Chỉ ĐỌC (không sửa gì). Tự che mật khẩu. Dán toàn bộ kết quả lại cho Claude.
cd "$(dirname "$0")/.." || exit 1
mask() { sed -E 's/(PASSWORD|SECRET|PASS|KEY|TOKEN)=.*/\1=***/I'; }
echo "=== .env (che secret) ==="; ls -l --time=birth .env 2>&1; mask < .env 2>&1
echo; echo "=== pm2 ==="; pm2 describe icards-api 2>&1 | grep -E "status|script path|exec cwd|restarts|uptime"
echo; echo "=== ecosystem ==="; cat ecosystem.config.cjs 2>&1 | mask
echo; echo "=== Databases ==="; sudo mysql -e "SHOW DATABASES;" 2>&1
DB=$(grep -E '^DB_NAME=' .env | cut -d= -f2-)
echo; echo "=== Số dòng trong DB '$DB' ==="
sudo mysql "$DB" -e "
SELECT 'invitation_templates' t, COUNT(*) n FROM invitation_templates
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'site_content', COUNT(*) FROM site_content
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'invitations', COUNT(*) FROM invitations;
SELECT \`key\` FROM site_content ORDER BY \`key\`;" 2>&1
echo; echo "=== Dung lượng các DB ==="
sudo mysql -e "SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024,2) MB FROM information_schema.tables GROUP BY table_schema;" 2>&1
echo; echo "=== API local ==="
curl -s -m 5 localhost:3001/api/template-blocks | head -c 300; echo
curl -s -m 5 localhost:3001/api/public/settings | head -c 300; echo
