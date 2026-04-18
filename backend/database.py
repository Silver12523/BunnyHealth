from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 暂时使用 SQLite 方便本地开发测试，后期可以无缝切换为 PostgreSQL
SQLALCHEMY_DATABASE_URL = "sqlite:///./bunnyhealth.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 数据库依赖项，供 FastAPI 路由使用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
