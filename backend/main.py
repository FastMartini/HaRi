from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:8000",
]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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

