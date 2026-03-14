"""APScheduler configuration for background tasks"""

import logging
import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)

PING_URL = "https://bookleaf-support-portal.onrender.com"


def sync_ping_service():
    """Ping the service to keep it alive on Render"""
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(PING_URL)
            if response.status_code == 200:
                logger.info(f"✓ Service ping successful: {PING_URL}")
            else:
                logger.warning(f"⚠ Service ping returned status {response.status_code}")
    except Exception as e:
        logger.error(f"✗ Service ping failed: {e}")


scheduler = BackgroundScheduler()


def start_scheduler():
    """Start the background scheduler"""
    try:
        scheduler.add_job(
            func=sync_ping_service,
            trigger=IntervalTrigger(minutes=1),
            id='ping_service',
            name='Ping service every minute',
            replace_existing=True
        )
        scheduler.start()
        logger.info("✓ Scheduler started successfully")
        logger.info(f"📌 Pinging {PING_URL} every 1 minute")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def shutdown_scheduler():
    """Shutdown the scheduler gracefully"""
    try:
        scheduler.shutdown()
        logger.info("✓ Scheduler shutdown successfully")
    except Exception as e:
        logger.error(f"Error shutting down scheduler: {e}")