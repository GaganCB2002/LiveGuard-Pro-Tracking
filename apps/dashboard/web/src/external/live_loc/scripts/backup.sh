#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
docker exec liveguard-postgres pg_dump -U liveguard liveguard > $BACKUP_DIR/database.sql
docker exec liveguard-redis redis-cli BGSAVE
echo "Backup saved to $BACKUP_DIR"
