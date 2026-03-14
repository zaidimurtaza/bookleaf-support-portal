"""Simple background task queue using thread pool"""
from typing import Callable
from concurrent.futures import ThreadPoolExecutor
import logging

logger = logging.getLogger(__name__)

# Thread pool with 5 workers (reuses threads, no explosion)
_executor = ThreadPoolExecutor(max_workers=5)


def run_in_background(func: Callable, *args, **kwargs):
    """
    Run a function in background without blocking.
    Uses a thread pool with limited workers (max 5 threads).
    
    Example:
        run_in_background(process_ai, ticket_id, subject)
    """
    def wrapper():
        try:
            func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Background task error: {e}")
    
    # Submit to thread pool (reuses existing threads)
    _executor.submit(wrapper)

