import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto(Path(__file__).resolve().parents[1].joinpath("index.html").as_uri())
        await page.wait_for_selector("#app")
        assert "Pairadox" in await page.title()
        assert await page.locator("#stepper").count() == 1
        assert await page.locator("#app").inner_text()
        assert not errors, "page script errors: " + "; ".join(errors)
        print("PASS: Pairadox loads, app and stage navigation render without page errors.")
        await browser.close()

asyncio.run(main())
