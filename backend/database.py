# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # Importa as tabelas que definimos
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Pega a URL do banco do .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tiktok_analytics.db")

# Cria a conexão com o banco
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Cria a sessão para usar nas rotas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ FUNÇÃO PRINCIPAL: CRIA TABELAS AUTOMATICAMENTE
def init_db():
    print("🔄 Inicializando banco de dados...")
    # Aqui o SQLAlchemy cria TODAS as tabelas que estão no models.py
    Base.metadata.create_all(bind=engine)
    print("✅ Banco de dados e tabelas criados/verificados com sucesso!")

# Dependência para usar o banco nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()