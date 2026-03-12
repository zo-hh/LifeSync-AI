import asyncio
from app.api.auth import google_sso

async def test():
    res = await google_sso.get_login_redirect()
    print(res.headers.get("location"))

asyncio.run(test())
