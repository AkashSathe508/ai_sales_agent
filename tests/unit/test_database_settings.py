from app.config.settings import DatabaseSettings


def test_database_url_safely_escapes_individual_credentials():
    settings = DatabaseSettings(
        POSTGRES_HOST="db.example", POSTGRES_PORT=5433, POSTGRES_DB="sales",
        POSTGRES_USER="sales user", POSTGRES_PASSWORD="p@ss:/word", DATABASE_URL="",
    )
    url = settings.sqlalchemy_url
    assert url.drivername == "postgresql+psycopg"
    assert url.host == "db.example"
    assert url.port == 5433
    assert url.database == "sales"
    assert url.password == "p@ss:/word"
    assert "p@ss:/word" not in url.render_as_string(hide_password=True)


def test_database_url_override_is_normalized_to_psycopg():
    settings = DatabaseSettings(DATABASE_URL="postgresql+asyncpg://user:secret@localhost/sales")
    assert settings.sqlalchemy_url.drivername == "postgresql+psycopg"
    assert settings.sqlalchemy_url.password == "secret"
