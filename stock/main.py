from os.path import join, dirname, abspath, exists
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from .routers import item


app = FastAPI()

app.include_router(item.router)

STATIC_FILES_DIR = join(dirname(abspath(__file__)), "static")
if not exists(STATIC_FILES_DIR):
    STATIC_FILES_DIR = join(dirname(dirname(abspath(__file__))), "public")

app.mount("/static", StaticFiles(directory=STATIC_FILES_DIR), name="static")

@app.get('/', response_class=HTMLResponse)
def get_index():
    filename = join(dirname(abspath(__file__)), 'static', 'index.html')
    if not exists(filename):
        filename = join(dirname(dirname(abspath(__file__))), 'public', 'index.html')
    with open(filename) as f:
        return HTMLResponse(f.read())

@app.get("/hello", response_class=HTMLResponse)
async def get_hello():
    return "Hello World"
