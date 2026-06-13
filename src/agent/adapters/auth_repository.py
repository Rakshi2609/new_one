import logging
from typing import Optional
from ..domain.models.auth import User
from .mongo_db import CuraPathDatabaseClient

logger = logging.getLogger(__name__)

class AuthRepository:
    """
    Stores users in MongoDB via CuraPathDatabaseClient.
    """

    def __init__(self) -> None:
        self._db = CuraPathDatabaseClient()

    def get_user_by_email(self, email: str) -> Optional[User]:
        doc = self._db.get_user_by_email(email)
        if not doc:
            return None
        doc = dict(doc)
        doc.pop("_id", None)
        return User(**doc)

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        doc = self._db.get_user_by_id(user_id)
        if not doc:
            return None
        doc = dict(doc)
        doc.pop("_id", None)
        return User(**doc)

    def save_user(self, user: User) -> None:
        user_dict = user.model_dump()
        self._db.save_user(user_dict)
