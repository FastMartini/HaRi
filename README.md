# HaRi

## Inspiration
Onboarding new hires is traditionally slow, repetitive, and manual. HR teams, developers, and business owners spend countless hours chasing signatures, setting up payroll, and repeatedly answering the same questions. 
We set out to build an autonomous HR assistant that streamlines these processes in real time, scales to any company size, and delivers a seamless, AI-powered experience for both employers and employees.
Meet **HaRi**.

## What it does
HaRi is your autonomous HR onboarding assistant powered by Google Cloud’s Agent Development Kit (ADK) and the Gemini 2.0 Flash model.

## How we built it
Frontend: React + Vite for a responsive, animated interface with smooth stage transitions between company registration, key creation, agent selection, and dashboards for both employees and employers.

Backend: 
* FastAPI acts as a bridge between the frontend and the ADK, exposing /ask endpoints that relay user queries to Gemini.
* AI/Agents: We created a root ADK agent (model="gemini-2.0-flash") with custom tools—start_onboarding, submit_task, list_tasks, get_nda_template, etc.—allowing Gemini to call Python functions to update onboarding tasks, fetch templates, and track progress.


## Challenges we ran into
* The ADK’s JSON response structure sometimes shifted between queries, which initially caused our FastAPI backend to break when it tried to index fixed locations in the response. We added a conditional check in our /ask endpoint to detect whether it was the first query or a subsequent one and parse accordingly.

        if len(response) > 1:
          return_body = response[2]["content"]["parts"][0]["text"]
        else:
          return_body = response[0]["content"]["parts"][0]["text"]

* As the frontend grew with multiple nested views, managing a plethora of URL paths and view states was tricky and required careful state management and consistent routing.
<img width="145" height="152" alt="Screenshot 2025-09-28 at 9 14 40 AM" src="https://github.com/user-attachments/assets/e86ce058-ada2-4b12-a42b-5e5b2e7ae4b8" />

* Connecting our FastAPI backend to the React + Vite frontend required careful handling of CORS, asynchronous API calls, and maintaining ADK session state. We used FastAPI’s CORSMiddleware to handle cross-origin requests and expose endpoints (/ask, /session) to the frontend. We also integrated the AdkConsole component into the frontend as a dedicated interface for sending and receiving messages from the ADK agent in real time. AdkConsole acted as a live test harness and ensured that the Gemini-powered agent was functioning end-to-end.

## Accomplishments that we're proud of
* Built a full-stack, minimum viable product in a weekend that combines a sleek UI, a FastAPI backend, and a generative AI agent.
* Implemented loop and parallel agent architecture so onboarding tasks can progress autonomously and concurrently.
* Created interactive dashboards for both employers and employees, including progress tracking, communication tools, and an integrated ADK console.

## What we learned
* How to integrate Google Gemini into an application using the Google Cloud ADK and design safe, typed Python tool calls.

* Best practices for agent orchestration, handling unpredictable JSON structures, and building robust React + Vite frontends for multi-stage flows.

* The importance of designing clear state transitions and defensive API handling when working with AI-driven responses.

## What's next for HaRi
* Production Deployment: Secure key management, persistent databases for employees and tasks, and cloud hosting.

* Extended Agents: Add specialized agents for benefits enrollment, I-9/E-Verify, and custom company workflows.

* Advanced Analytics: Employer dashboards with insights on onboarding bottlenecks and employee engagement.

* Multi-tenant SaaS: Allow multiple companies to use HaRi as a scalable HR onboarding platform.
