from fastapi import FastAPI

app = FastAPI()


@app.get("/document")
async def documentation():
    return {"message": "Document Response"}

@app.get("/qa")
async def qa():
    return {"message": "QA response"}

@app.get("/training")
async def training():
    return {"message": "Training response"}

@app.get("loop")
async def loop():
    return {"message": "Loop response"}

