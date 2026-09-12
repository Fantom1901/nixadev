"""rename view_count to views_count

Revision ID: f35438e4704b
Revises: 095fc126507a
Create Date: 2026-09-08 05:24:10.344321

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f35438e4704b'
down_revision: Union[str, Sequence[str], None] = '095fc126507a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('projects', 'view_count', new_column_name='views_count')

def downgrade() -> None:
    op.alter_column('projects', 'views_count', new_column_name='view_count')
