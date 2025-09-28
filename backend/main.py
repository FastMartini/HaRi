from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random, requests

class RequestQuery(BaseModel):
    query: str

class ResponseQuery(BaseModel):
    response: str

count = 0

rand = random.randint(0, 1000)

user_id = "u_" + str(rand)
session_id = "session_id_" + str(rand)

session_url = f"http://localhost:8000/apps/multi_tool_agent/users/{user_id}/sessions/{session_id}"
run_url = "http://localhost:8000/run"

headers = {"Content-Type": "application/json"}

session_response = requests.post(session_url, headers=headers).json()

print(session_response)
app = FastAPI()

origins = [
    "http://localhost:7999/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask")
async def ask(query: RequestQuery):
    global count

    # HTTP Response
    body = {
        "app_name": "multi_tool_agent",
        "user_id": user_id,
        "session_id": session_id,
        "new_message": {
            "role": "user",
            "parts": [{
                "text": query.query
            }]
        }
    }

    response = requests.post(run_url, json=body, headers=headers).json()

    count += 1

    if count > 1:
        return_body = response[2]["content"]["parts"][0]["text"]
    else:
        return_body = response[0]["content"]["parts"][0]["text"]

    return ResponseQuery(response=return_body)

@app.get("/session")
def session():
    response = requests.get(session_url, headers=headers).json()

    return response




