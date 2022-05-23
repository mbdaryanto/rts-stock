from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .routers import item, market_place, purchase
# from .settings import get_settings


app = FastAPI()

app.include_router(item.router)
app.include_router(market_place.router)
app.include_router(purchase.router)

static_files_dir = Path(__file__).parent / 'assets'
if not static_files_dir.exists():
    static_files_dir = Path(__file__).parent.parent / 'public'

app.mount('/assets', StaticFiles(directory=static_files_dir), name='assets')


@app.get('/')
def get_index():
    index_html = static_files_dir / 'index.html'
    if not index_html.exists():
        return "Welcome to Stock"
    return FileResponse(index_html)


@app.get("/hello")
async def get_hello():
    return "Hello World"


# @app.get('/dbs')
# def get_dbs():
#     return get_settings().get_db_url().render_as_string()
