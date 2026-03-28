#!/bin/bash
docker compose up # I need to start the server and the database
docker compose exec api npx prisma migrate deploy # Then I can migrate the database if it hasn't been before
docker compose exec api npx prisma db seed # Then I can seed the database if it hasn't been seeded
docker compose exec api npx prisma studio # Then I can view the database in the studio
docker compose exec api npx prisma migrate dev # Then I can migrate the database if it hasn't been migrated
docker compose exec api npx prisma migrate reset # Then I can reset the database if it hasn't been reset
docker compose exec api npx prisma migrate reset --force # Then I can reset the database if it hasn't been reset
docker compose exec api npx prisma migrate reset --force # Then I can reset the database if it hasn't been reset