"""merge conflicting heads

Revision ID: 459001e53b0e
Revises: 87b3b2421d7d, cdbad5eed22b
Create Date: 2026-09-15 16:35:50.749532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '459001e53b0e'
down_revision: Union[str, Sequence[str], None] = ('87b3b2421d7d', 'cdbad5eed22b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
