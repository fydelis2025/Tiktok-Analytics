from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel
import httpx
import os
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

# ==============================================
# ✅ CONFIGURAÇÕES — COLOQUE SEUS DADOS REAIS AQUI!
# ==============================================
TIKTOK_CLIENT_KEY = os.getenv("TIKTOK_CLIENT_KEY", "COLOQUE_SUA_CHAVE_REAL_AQUI")       # 🔴 TROQUE AQUI
TIKTOK_CLIENT_SECRET = os.getenv("TIKTOK_CLIENT_SECRET", "COLOQUE_SUA_CHAVE_SECRETA_AQUI") # 🔴 TROQUE AQUI
TIKTOK_REDIRECT_URI = os.getenv("TIKTOK_REDIRECT_URI", "http://localhost:3000/login")

JWT_SECRET = os.getenv("JWT_SECRET", "chave_secreta_muito_forte_123456")
JWT_ALGORITHM = "HS256"

# ✅ URLs OFICIAIS CORRETAS (não use mais tiktok-shops.com)
TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
TIKTOK_TOKEN_URL = "https://open-api.tiktok.com/oauth/token/"
TIKTOK_USER_INFO_URL = "https://open-api.tiktok.com/user/info/"

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=TIKTOK_AUTH_URL,
    tokenUrl=TIKTOK_TOKEN_URL
)

# ==============================================
# MODELOS
# ==============================================
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"

class UserSession(BaseModel):
    user_id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None

# ==============================================
# ROTAS
# ==============================================
@router.get("/login")
async def login():
    """Redireciona para o login OAuth do TikTok"""
    if not TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_KEY == "COLOQUE_SUA_CHAVE_REAL_AQUI":
        raise HTTPException(status_code=500, detail="⚠️ Você não configurou sua Client Key do TikTok ainda!")

    auth_url = (
        f"{TIKTOK_AUTH_URL}"
        f"?client_key={TIKTOK_CLIENT_KEY}"
        f"&scope=user.info.basic,video.list"
        f"&response_type=code"
        f"&redirect_uri={TIKTOK_REDIRECT_URI}"
        f"&state=estadoseguro123"
    )
    return {"auth_url": auth_url}


@router.get("/callback")
async def callback(code: str):
    """Callback do OAuth — troca o código por tokens"""
    if not code:
        raise HTTPException(status_code=400, detail="Código de autorização não recebido")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                TIKTOK_TOKEN_URL,
                data={
                    "client_key": TIKTOK_CLIENT_KEY,
                    "client_secret": TIKTOK_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": TIKTOK_REDIRECT_URI
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Erro ao conectar: {str(e)}")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Erro do TikTok: {response.text}")
        
        token_data = response.json()
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Token não recebido")

        # Busca dados do usuário
        try:
            user_info = await get_user_info(token_data["access_token"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao buscar usuário: {str(e)}")

        # Gera seu token JWT
        session_token = jwt.encode(
            {
                "user_id": user_info["user_id"],
                "username": user_info["username"],
                "exp": datetime.utcnow() + timedelta(days=7)
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )

        return {
            "session_token": session_token,
            "tiktok_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "user": user_info
        }


async def get_user_info(access_token: str) -> dict:
    """Obtém informações básicas do usuário"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            TIKTOK_USER_INFO_URL,
            params={"access_token": access_token}
        )
        if response.status_code != 200:
            raise Exception(f"Erro: {response.text}")
        
        data = response.json()
        user = data.get("data", {})
        return {
            "user_id": user.get("open_id"),
            "username": user.get("username"),
            "display_name": user.get("display_name"),
            "avatar_url": user.get("avatar_url")
        }


@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"user_id": payload["user_id"], "username": payload["username"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            TIKTOK_TOKEN_URL,
            data={
                "client_key": TIKTOK_CLIENT_KEY,
                "client_secret": TIKTOK_CLIENT_SECRET,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Falha ao renovar token")
        return response.json()