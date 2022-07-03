Для запуска докера:

sudo docker-compose up -d && sudo docker exec -i postgres_db psql -U postgres pg_db < start.sql