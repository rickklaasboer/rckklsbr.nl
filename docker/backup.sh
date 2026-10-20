#!/bin/sh
set -eu

while true; do
    dump_file="/backups/rckklsbr-$(date +%Y-%m-%d).sql"
    echo "Dumping database to $dump_file.gz"
    # no pipe: sh has no pipefail, a failed dump must stop the script
    mysqldump -h mysql -uroot -p"$DB_ROOT_PASSWORD" --single-transaction "$DB_DATABASE" > "$dump_file"
    gzip -f "$dump_file"

    find /backups -name '*.sql.gz' -mtime +14 -delete

    sleep 24h
done
