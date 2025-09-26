import os
from authlib.integrations.starlette_client import OAuth
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
from cryptography.fernet import Fernet
import base64
from datetime import datetime

# --- OAuth Configuration ---
GITLAB_URL = os.getenv("GITLAB_URL")
GITLAB_CLIENT_ID = os.getenv("GITLAB_CLIENT_ID")
GITLAB_CLIENT_SECRET = os.getenv("GITLAB_CLIENT_SECRET")

oauth = OAuth()
oauth.register(
    name='gitlab',
    client_id=GITLAB_CLIENT_ID,
    client_secret=GITLAB_CLIENT_SECRET,
    server_metadata_url=f'{GITLAB_URL}/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid read_user profile email read_api'}
)

MODE = os.getenv("MODE", "dev")

# --- JWT Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    if MODE != "dev":
        raise RuntimeError("SECRET_KEY must be set in production")
    # Development fallback
    SECRET_KEY = "dev-secret-key"

# --- Encryption Configuration ---
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    if MODE != "dev":
        raise RuntimeError("ENCRYPTION_KEY must be set in production")
    # Generate a key for development (not logged)
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    print("⚠️  Generated ephemeral ENCRYPTION_KEY for development. Set ENCRYPTION_KEY in .env for production.")

class AuthService:
    def __init__(self):
        self.cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)
    
    def create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def decode_access_token(self, token: str) -> dict:
        """Decode and validate a JWT access token, returning the claims dict."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            # Check if token is expired
            exp = payload.get('exp')
            if exp:
                exp_datetime = datetime.fromtimestamp(exp)
                if exp_datetime < datetime.utcnow():
                    raise JWTError("Token has expired")
            return payload
        except JWTError as e:
            print(f"🔴 Token decode failed: {e}")
            raise e
    
    def encrypt_token(self, token: str) -> str:
        """Encrypt a GitLab token for secure storage"""
        return self.cipher_suite.encrypt(token.encode()).decode()
    
    def decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt a GitLab token for use"""
        return self.cipher_suite.decrypt(encrypted_token.encode()).decode()

    def get_oauth(self):
        return oauth 