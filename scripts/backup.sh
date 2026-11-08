#!/usr/bin/env bash
# Sao lưu toàn bộ DB:  bash scripts/backup.sh
set -e
F=~/backup-$(date +%F-%H%M).sql
sudo mysqldump --all-databases --single-transaction --routines --events > "$F"
chmod 600 "$F"
ls -lh "$F"; echo "CREATE TABLE: $(grep -c 'CREATE TABLE' "$F")  INSERT: $(grep -c '^INSERT INTO' "$F")"; tail -n 1 "$F"
