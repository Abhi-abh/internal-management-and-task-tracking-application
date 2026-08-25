from typing import Optional
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app.db.base import SessionLocal
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, decode_access_token, create_access_token

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        email, password = form.get("username"), form.get("password")
        
        with SessionLocal() as db:
            repo = UserRepository(db)
            user = repo.get_by_email(email)
            if not user or not verify_password(password, user.password_hash):
                return False
                
            if user.role != "admin" or not user.is_active:
                return False

            # Create a token and store it in session
            token = create_access_token(data={"sub": str(user.id)})
            request.session.update({"token": token})

        return True

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> Optional[RedirectResponse]:
        token = request.session.get("token")
        if not token:
            return RedirectResponse(request.url_for("admin:login"), status_code=302)
            
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse(request.url_for("admin:login"), status_code=302)
            
        user_id = payload.get("sub")
        if not user_id:
            return RedirectResponse(request.url_for("admin:login"), status_code=302)
            
        with SessionLocal() as db:
            repo = UserRepository(db)
            user = repo.get_by_id(int(user_id))
            if not user or user.role != "admin" or not user.is_active:
                return RedirectResponse(request.url_for("admin:login"), status_code=302)

        return True
