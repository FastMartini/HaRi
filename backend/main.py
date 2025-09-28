from pydantic import BaseModel
import random, requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# This models handles the request body of the HTTP POST request to http://localhost:7999/ask
# The body of the request must follow the following format
# {
#   "query": "Insert prompt to AI Agent"
# }

class RequestQuery(BaseModel):
    query: str

# This model represent the JSON body the AI Agents will send to the API from http://localhost:7999/ask.
# It contains the response the API recieved from the AI agents
# It will look like this
# {
#   "response": "Insert response from an AI Agent"
# }

# Please treat these responses like dictionaries or hash-maps when you're integrating React with this backend
# If you want more information, please refer to the resources I've sent.

class ResponseQuery(BaseModel):
    response: str

# This is used to parse through the JSON files the API recieves
# Please scroll down to the ask function for more information.
count = 0

# This random number ensurses each time the API starts, it will start a new AI session
# It doesn't matter if the ADK api server has sessions or not; this will ensure that the API will engage in a fresh session

rand = random.randint(0, 1000)

user_id = "u_" + str(rand)
session_id = "session_id_" + str(rand)

# The session_url is used to generate a new session
# Meanwhile, the run_url is used to send queries to the AI agents
session_url = f"http://localhost:8000/apps/multi_tool_agent/users/{user_id}/sessions/{session_id}"
run_url = "http://localhost:8000/run"

# This header ensures that the type of content being recieved and sent is an JSON file

headers = {"Content-Type": "application/json"}

# Generates and grabs the details of the newly generated session.

session_response = requests.post(session_url, headers=headers).json()

# Debugging purposes
# If it prints something along the lines of "Session already created", 
# then be aware that you're using an existing session and I highly suggest restarting the API to generate a new session

print(session_response)

# Starts the API
app = FastAPI()


# Ensures the localhost is running on the 7999 port.
# Additionally, it will keep the connection between the frontend and backend secure.
# I will work on this more tomorrow
origins = [
    "http://localhost:7999",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The meet and potatoes of this entire API program
# This API request is the main function communicating with the API agents.
@app.post("/ask")
async def ask(query: RequestQuery):
    global count

    # HTTP Response body
    # This will be sent to the AI agents.
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

    # Sends the query to the API and saves the response it recieves.
    response = requests.post(run_url, json=body, headers=headers).json()

    # The count variable is used to grab the actual response from the API
    # A huge blocker I've encountered is that the location of the AI-generated text in the JSON file changes after the first query
    # This count variable keeps track of the amount of queries calls made to the AI agent
    # If the program detects that the query is not the first one, it will parse through the JSON differently.
    count += 1

    # As previously stated above, this section extracts the AI-generated response from the JSON file.
    # It uses count to know which method should be run.
    if count > 1:
        return_body = response[2]["content"]["parts"][0]["text"]
    else:
        return_body = response[0]["content"]["parts"][0]["text"]

    # Sends the result of the query back to the user in the form of a JSON request
    # Please review the resources I've sent for more info on how to handle these JSON requests in React.
    return ResponseQuery(response=return_body)

# This is a very simply GET endpoint that returns the current session the user is in.
# Send a GET request to this endpoint to learn more about the current session.
@app.get("/session")
def session():
    response = requests.get(session_url, headers=headers).json()

    return response