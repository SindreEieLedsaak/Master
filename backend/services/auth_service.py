import os
from authlib.integrations.starlette_client import OAuth
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
from cryptography.fernet import Fernet
import base64

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

# --- JWT Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_that_should_be_in_env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Encryption Configuration ---
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate a key for development (should be set in production)
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    print(f"⚠️  Generated encryption key: {ENCRYPTION_KEY}")
    print("🔧 Set ENCRYPTION_KEY in your .env file for production!")

class AuthService:
    def __init__(self):
        self.cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)
    
    def create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def decode_access_token(self, token: str) -> dict:
        """Decode and validate a JWT access token, returning the claims dict."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError as e:
            raise e
    
    def encrypt_token(self, token: str) -> str:
        """Encrypt a GitLab token for secure storage"""
        return self.cipher_suite.encrypt(token.encode()).decode()
    
    def decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt a GitLab token for use"""
        return self.cipher_suite.decrypt(encrypted_token.encode()).decode()

    def get_oauth(self):
        return oauth 