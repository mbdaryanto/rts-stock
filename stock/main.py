from fastapi import FastAPI


app = FastAPI()


@app.get("/")
async def get_index():
    return "Hello World"