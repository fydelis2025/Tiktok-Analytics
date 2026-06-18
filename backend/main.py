# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import dashboard, hashtags, auth
from database import init_db  # Importa a função de criação automática
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# ✅ CRIA O BANCO E TABELAS AUTOMATICAMENTE AO INICIAR
init_db()

app = FastAPI(title="TikTok Analytics API", version="1.0.0")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(hashtags.router, prefix="/api")

# Rota de saúde
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "TikTok Analytics", "version": "1.0.0"}

# Iniciar servidor
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)