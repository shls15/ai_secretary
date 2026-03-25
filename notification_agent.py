"""
agent3_notification.py
=======================
Complete Agent 3 — Notification in a single file.

HOW TO RUN:
  1. pip install fastapi uvicorn sqlalchemy asyncpg python-dotenv
  2. Set your env vars below (or create a .env file)
  3. uvicorn agent3_notification:app --reload

TRIGGER:
  PATCH http://localhost:8000/tasks/{id}
  Body: { "status": "completed" }
  → Agent 3 fires automatically in the background
"""

import logging
import os
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

#env file

load_dotenv()
SMTP_HOST    = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT    = int(os.getenv("SMTP_PORT", 465))
SMTP_USER    = os.getenv("SMTP_USER")
SMTP_PASS    = os.getenv("SMTP_PASS")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

#database
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


#orm-model

class Base(DeclarativeBase):
    pass


class Email(Base):
    __tablename__ = "emails"
    id         : Mapped[int]  = mapped_column(Integer, primary_key=True)
    sender     : Mapped[str]  = mapped_column(String(255))
    subject    : Mapped[str]  = mapped_column(String(500), default="")
    body       : Mapped[str]  = mapped_column(Text)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed  : Mapped[bool] = mapped_column(Boolean, default=False)
    tasks      : Mapped[list["Task"]] = relationship("Task", back_populates="email")


class Task(Base):
    __tablename__ = "tasks"
    id                : Mapped[int]           = mapped_column(Integer, primary_key=True)
    email_id          : Mapped[int]           = mapped_column(Integer, ForeignKey("emails.id"))
    title             : Mapped[str]           = mapped_column(String(500))
    description       : Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority          : Mapped[str]           = mapped_column(String(20), default="Medium")   # High | Medium | Low
    status            : Mapped[str]           = mapped_column(String(20), default="pending")  # pending→approved→scheduled→completed|rejected
    estimated_minutes : Mapped[int]           = mapped_column(Integer, default=30)
    action_items      : Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)            # list of strings
    requires_meeting  : Mapped[bool]          = mapped_column(Boolean, default=False)
    created_at        : Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    email             : Mapped["Email"]       = relationship("Email", back_populates="tasks")
    notifications     : Mapped[list["Notification"]] = relationship("Notification", back_populates="task")


class User(Base):
    __tablename__ = "users"
    id              : Mapped[int]  = mapped_column(Integer, primary_key=True)
    name            : Mapped[str]  = mapped_column(String(200))
    email           : Mapped[str]  = mapped_column(String(255), unique=True)
    role            : Mapped[str]  = mapped_column(String(20), default="manager")   # executive | manager
    hashed_password : Mapped[str]  = mapped_column(String(255))
    created_at      : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Schedule(Base):
    __tablename__ = "schedules"
    id            : Mapped[int]      = mapped_column(Integer, primary_key=True)
    task_id       : Mapped[int]      = mapped_column(Integer, ForeignKey("tasks.id"))
    start_time    : Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_time      : Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_rescheduled: Mapped[bool]     = mapped_column(Boolean, default=False)


class Notification(Base):
    __tablename__ = "notifications"
    id              : Mapped[int]           = mapped_column(Integer, primary_key=True)
    task_id         : Mapped[int]           = mapped_column(Integer, ForeignKey("tasks.id"))
    recipient_email : Mapped[str]           = mapped_column(String(255))
    sent_at         : Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    type            : Mapped[str]           = mapped_column(String(50), default="completion")
    success         : Mapped[bool]          = mapped_column(Boolean, default=False)
    task            : Mapped["Task"]        = relationship("Task", back_populates="notifications")


#email-sending

def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email. Returns True on success, False on failure."""
    if not SMTP_USER or not SMTP_PASS:
        logger.error("SMTP_USER or SMTP_PASS not set — skipping send.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = SMTP_USER
    msg["To"]      = to
    msg.attach(MIMEText(body, "plain"))

    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_USER, [to], msg.as_string())
        else:  # 587 STARTTLS
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_USER, [to], msg.as_string())

        logger.info("Email sent to %s", to)
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP auth failed — check SMTP_USER and SMTP_PASS.")
    except smtplib.SMTPRecipientsRefused:
        logger.error("Recipient refused: %s", to)
    except smtplib.SMTPException as e:
        logger.error("SMTP error for %s: %s", to, e)

    return False


#actual agent

async def run_notification_agent(task_id: int, db: AsyncSession) -> None:
    """
    Steps:
      1. Look up original sender via task.email_id → emails table
      2. Find stakeholders (managers) from users table
      3. Render email template
      4. Send via SMTP
      5. Log to notifications table with success flag
    """
    logger.info("[Agent3] Starting for task_id=%s", task_id)

    try:
        # ── Step 1: Load task ────────────────────────────────────────────
        task: Optional[Task] = await db.get(Task, task_id)
        if not task:
            logger.error("[Agent3] task_id=%s not found.", task_id)
            return

        # ── Step 2: Get original sender ──────────────────────────────────
        original_email: Optional[Email] = await db.get(Email, task.email_id)
        if not original_email:
            logger.error("[Agent3] No email found for email_id=%s", task.email_id)
            return

        # ── Step 3: Get stakeholders (managers) ──────────────────────────
        result = await db.execute(select(User).where(User.role == "manager"))
        managers = result.scalars().all()
        stakeholders = [m.email for m in managers]

        # ── Step 4 & 5: Send + log for every recipient ───────────────────
        all_recipients = [original_email.sender] + stakeholders

        for recipient in all_recipients:
            subject, body = _build_email(task, original_email)
            success = send_email(to=recipient, subject=subject, body=body)

            # Log to notifications table
            log = Notification(
                task_id         = task.id,
                recipient_email = recipient,
                sent_at         = datetime.now(timezone.utc),
                type            = "completion",
                success         = success,
            )
            db.add(log)
            try:
                await db.commit()
            except Exception as e:
                logger.error("[Agent3] DB log failed for %s: %s", recipient, e)
                await db.rollback()

            logger.info("[Agent3] %s → %s", recipient, "OK" if success else "FAILED")

    except Exception as e:
        # Never crash the server — catch everything and log it
        logger.exception("[Agent3] Unexpected error for task_id=%s: %s", task_id, e)


def _build_email(task: Task, original_email: Email) -> tuple[str, str]:
    """Build the notification subject and body."""
    subject = f"Completed: {task.title}"

    items = ""
    if task.action_items:
        items = "\nAction items completed:\n" + "\n".join(f"  • {i}" for i in task.action_items) + "\n"

    body = (
        f"Hello,\n\n"
        f"Your request has been completed:\n\n"
        f"  Task     : {task.title}\n"
        f"  Priority : {task.priority}\n"
        f"  Summary  : {task.description}\n"
        f"{items}\n"
        f"Original subject: {original_email.subject}\n\n"
        f"No further action is needed.\n\n"
        f"— Executive Secretary System"
    )
    return subject, body


#fastapi

app = FastAPI(title="Agent 3 — Notification")


# Pydantic schema for PATCH body
class TaskStatusUpdate(BaseModel):
    status: str


# Valid status transitions — prevents illegal jumps
VALID_TRANSITIONS = {
    "pending"  : ["approved", "rejected"],
    "approved" : ["scheduled", "completed", "rejected"], 
    "scheduled": ["completed", "rejected"],
    "completed": [],
    "rejected" : [],
}


@app.patch("/tasks/{task_id}")
async def update_task(
    task_id: int,
    payload: TaskStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if payload.status not in VALID_TRANSITIONS.get(task.status, []):
        raise HTTPException(
            status_code=422,
            detail=f"Cannot go from '{task.status}' to '{payload.status}'. Allowed: {VALID_TRANSITIONS[task.status]}"
        )

    task.status = payload.status
    await db.commit()
    await db.refresh(task)

    # ── Fire Agent 3 when status → completed ────────────────────────────
    if payload.status == "completed":
        background_tasks.add_task(run_notification_agent, task_id, db)
        logger.info("[Route] Agent 3 queued for task_id=%s", task_id)

    return {"id": task.id, "status": task.status}


@app.get("/notifications")
async def list_notifications(db: AsyncSession = Depends(get_db)):
    """View the full notification log — shown in the Notifications tab."""
    result = await db.execute(
        select(Notification).order_by(Notification.sent_at.desc())
    )
    rows = result.scalars().all()
    return [
        {
            "id"             : n.id,
            "task_id"        : n.task_id,
            "recipient_email": n.recipient_email,
            "sent_at"        : n.sent_at,
            "type"           : n.type,
            "success"        : n.success,
        }
        for n in rows
    ]


@app.get("/health")
async def health():
    return {"status": "ok"}