# UI smoke test (needs: pip install playwright && playwright install chromium). Run: python3 tests/ui_smoke.py
import asyncio,pathlib
from playwright.async_api import async_playwright
URL=pathlib.Path(__file__).resolve().parent.parent.joinpath('index.html').as_uri()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':900})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto(URL)
        assert 'Pairadox' in await pg.title()
        assert 'Kindred' not in await pg.content()
        await pg.screenshot(path='/tmp/shot1.png')
        dis=await pg.eval_on_selector_all('#stepper button','b=>b.map(x=>x.disabled)'); assert dis==[False,False,False,False],dis
        await pg.click('#stepper li:nth-child(2) button'); await pg.wait_for_selector('text=Profile analysis')
        await pg.click('[data-a=confirm]'); await pg.wait_for_selector('[data-a=run]')
        await pg.select_option('#speed','instant'); await pg.click('[data-a=run]')
        await pg.wait_for_selector('[data-a=goto][data-v="4"]:not([disabled])',timeout=30000)
        await pg.screenshot(path='/tmp/shot3.png')
        await pg.click('.btn.primary[data-v="4"]'); await pg.wait_for_selector('text=Match rankings')
        await pg.screenshot(path='/tmp/shot4.png')
        await pg.click('#stepper li:nth-child(2) button')
        n=await pg.locator('.chip .x').count()
        if n: await pg.locator('.chip .x').first.click()
        dis=await pg.eval_on_selector_all('#stepper button','b=>b.map(x=>x.disabled)'); assert dis==[False,False,False,False],('not invalidated',dis)
        await pg.click('#stepper li:nth-child(2) button'); await pg.click('[data-a=confirm]'); await pg.select_option('#speed','instant'); await pg.click('[data-a=run]')
        await pg.wait_for_selector('.btn.primary[data-v="4"]:not([disabled])',timeout=30000); await pg.click('.btn.primary[data-v="4"]'); await pg.wait_for_selector('.rcard')
        total=await pg.locator('.rcard').count(); assert total==5,total
        await pg.click('[data-a=rankFilter][data-v=strong]'); n=await pg.locator('.rcard').count(); assert 0<n<total,n
        await pg.click('[data-a=rankFilter][data-v=all]')
        assert await pg.locator('text=Profile basis').count()>=1
        await pg.click('#stepper li:nth-child(1) button'); await pg.click('[data-a=toggleForm]')
        await pg.fill('#f-name','Test'); await pg.fill('#f-li','https://www.linkedin.com/in/t'); await pg.fill('#f-ig','https://www.instagram.com/t')
        await pg.click('[data-a=addP]'); await pg.wait_for_selector('[role=alert]'); assert 'Consent' in await pg.inner_text('[role=alert]')
        await pg.set_viewport_size({'width':390,'height':800}); ov=await pg.evaluate('document.documentElement.scrollWidth-innerWidth'); print('mobile overflow px:',ov)
        print('errors:',errs); print('SMOKE OK')
        await b.close()
asyncio.run(main())
