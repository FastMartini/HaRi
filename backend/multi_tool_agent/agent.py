# backend/multi_tool_agent/agent.py
import uuid
from typing import Dict, List, Optional
from google.adk.agents import Agent  # keep as in your boilerplate

# ---- In-memory demo store ---------------------------------------------------
EMPLOYEES: Dict[str, Dict] = {}  # employee_id -> {name,email,tasks,qa}

DEFAULT_TASKS: List[Dict] = [
    # required steps in order
    {"task": "Sign NDA", "status": "pending", "required": True, "prereq": None, "unlocks": ["Complete Payroll Info"]},
    {"task": "Complete Payroll Info", "status": "locked", "required": True, "prereq": "Sign NDA", "unlocks": ["Training Module 1"]},
    # training unlocks only after payroll
    {"task": "Training Module 1", "status": "locked", "required": False, "prereq": "Complete Payroll Info", "unlocks": []},
]

# ---- Helper ----------------------------------------------------------------
def _get_emp(emp_id: str) -> Optional[Dict]:
    return EMPLOYEES.get(emp_id)

def _task_by_name(tasks: List[Dict], name: str) -> Optional[Dict]:
    name = name.lower().strip()
    return next((t for t in tasks if t["task"].lower() == name), None)

def _next_required(tasks: List[Dict]) -> Optional[str]:
    # first required task that is not done and not locked
    for t in tasks:
        if t["required"] and t["status"] not in ("done",) and t["status"] != "locked":
            return t["task"]
    # if required done, allow first pending (e.g., Training Module 1)
    for t in tasks:
        if t["status"] == "pending":
            return t["task"]
    return None

def _unlock(tasks: List[Dict], completed_task_name: str):
    completed = _task_by_name(tasks, completed_task_name)
    if not completed:
        return
    for nxt in completed.get("unlocks", []):
        t = _task_by_name(tasks, nxt)
        if t and t["status"] == "locked":
            t["status"] = "pending"

# ---- Tools -----------------------------------------------------------------
# --- replace start_onboarding(...) with this version ---
def start_onboarding(employee_name: str, email: str) -> dict:
    """Create onboarding record and return next step + NDA template immediately."""
    emp_id = str(uuid.uuid4())[:8]
    EMPLOYEES[emp_id] = {
        "name": employee_name.strip(),
        "email": email.strip(),
        "tasks": [dict(t) for t in DEFAULT_TASKS],
        "qa": [],
    }
    next_step = _next_required(EMPLOYEES[emp_id]["tasks"])

    # generate NDA template right away
    nda = get_nda_template(emp_id)["nda_template"]

    return {
        "status": "success",
        "employee_id": emp_id,
        "next_step": next_step,                 # will be "Sign NDA"
        "nda_template": nda,                    # <-- include NDA now
        "report": (
            f"Onboarding started for {employee_name} ({email}). "
            f"Your Employee ID is {emp_id}. Next: {next_step}. "
            f"The NDA template is included below."
        ),
    }


def list_tasks(employee_id: str) -> dict:
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}
    return {
        "status": "success",
        "tasks": emp["tasks"],
        "next_required": _next_required(emp["tasks"]),
        "report": f"{emp['name']} has {sum(1 for t in emp['tasks'] if t['status']=='done')} completed tasks.",
    }

def submit_task(employee_id: str, task: str, completed: bool = True) -> dict:
    """Enforce prerequisites: NDA → Payroll → Training."""
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}

    t = _task_by_name(emp["tasks"], task)
    if not t:
        return {"status": "error", "error_message": f"Task '{task}' not found."}

    # block if locked or prereq not satisfied
    if t["status"] == "locked":
        prereq = t.get("prereq")
        msg = f"Task '{t['task']}' is locked."
        if prereq:
            msg += f" Complete '{prereq}' first."
        return {"status": "blocked", "error_message": msg}

    if completed:
        t["status"] = "done"
        _unlock(emp["tasks"], t["task"])
    else:
        t["status"] = "pending"

    next_step = _next_required(emp["tasks"])
    return {
        "status": "success",
        "report": f"Task '{t['task']}' updated.",
        "next_step": next_step,
    }

def ask_question(employee_id: str, question: str) -> dict:
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}

    q = question.lower()
    if "vacation" in q or "pto" in q:
        answer = "Full-time employees receive 15 PTO days per year (demo)."
    elif "benefit" in q:
        answer = "Benefits start on day 1; medical enrollment is due within 30 days (demo)."
    elif "payroll" in q or "direct deposit" in q:
        answer = "Please complete the Direct Deposit form; first paycheck posts next cycle (demo)."
    elif "nda" in q or "non-disclosure" in q:
        answer = "You can request the NDA template via the 'get_nda_template' tool."
    else:
        answer = "Thanks for the question! An HR agent will follow up (demo)."

    emp["qa"].append({"q": question, "a": answer})
    return {"status": "success", "answer": answer, "report": "Answer provided."}

def progress(employee_id: str) -> dict:
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}
    total = sum(1 for _ in emp["tasks"] if _["status"] != "locked")
    completed = sum(1 for _ in emp["tasks"] if _["status"] == "done")
    return {
        "status": "success",
        "completed": completed,
        "total": total,
        "report": f"{emp['name']} completed {completed}/{total} steps.",
    }

def get_nda_template(employee_id: Optional[str] = None) -> dict:
    """
    Returns a simple NDA template (string) with placeholders filled if employee known.
    """
    name = email = "________"
    if employee_id and (emp := _get_emp(employee_id)):
        name, email = emp["name"], emp["email"]

    template = f"""
NON-DISCLOSURE AGREEMENT (NDA)

This NDA is entered into between ACME CORP ("Company") and {name} ("Recipient"), email: {email}.

1. Confidential Information. "Confidential Information" means any non-public information disclosed by Company.
2. Obligations. Recipient will (a) use Confidential Information only for employment purposes; (b) not disclose it to third parties; (c) protect it with reasonable care.
3. Exclusions. Information is not confidential if it is public, already known, independently developed, or lawfully obtained.
4. Term. Obligations last for 3 years from disclosure date.
5. Return/Destruction. Upon request, Recipient will return or destroy Confidential Information.
6. Governing Law. State of Florida.

Recipient Signature: ______________________    Date: ____________
Company Representative: ___________________    Date: ____________
"""
    return {"status": "success", "nda_template": template.strip()}

# ---- Root Agent ------------------------------------------------------------
root_agent = Agent(
    name="Hari",
    model="gemini-2.0-flash",
    description="Autonomous HR onboarding & training assistant.",
    instruction=(
        "You help HR onboard new hires. If the user has no employee_id yet, "
        "START by asking for their full name and work email to create a record "
        "using the start_onboarding tool. Always enforce the required order: "
        "1) Sign NDA, 2) Complete Payroll Info, then unlock 3) Training Module 1. "
        "Use list_tasks to show the next required step. If asked for an NDA, call get_nda_template."
    ),
    tools=[start_onboarding, list_tasks, submit_task, ask_question, progress, get_nda_template],
)
