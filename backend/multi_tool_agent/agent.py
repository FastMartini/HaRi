# backend/multi_tool_agent/agent.py
import uuid
from typing import Dict, List, Optional
from google.adk.agents import Agent  # keep as in your boilerplate

# ---- In-memory demo store ---------------------------------------------------
EMPLOYEES: Dict[str, Dict] = {}  # employee_id -> {name,email,tasks,qa,payroll}

DEFAULT_TASKS: List[Dict] = [
    # required steps in order
    {"task": "Sign NDA", "status": "pending", "required": True, "prereq": None, "unlocks": ["Set Up Direct Deposit"]},
    {"task": "Set Up Direct Deposit", "status": "locked", "required": True, "prereq": "Sign NDA", "unlocks": ["Training Module 1"]},
    # training unlocks only after payroll
    {"task": "Training Module 1", "status": "locked", "required": False, "prereq": "Set Up Direct Deposit", "unlocks": []},
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

def _complete_task(emp: Dict, task_name: str):
    t = _task_by_name(emp["tasks"], task_name)
    if t and t["status"] != "done" and t["status"] != "locked":
        t["status"] = "done"
        _unlock(emp["tasks"], task_name)

# ---- Payroll helpers --------------------------------------------------------
def _valid_routing(rn: str) -> bool:
    """ABA routing checksum."""
    if not (rn.isdigit() and len(rn) == 9):
        return False
    d = [int(x) for x in rn]
    checksum = (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10
    return checksum == 0

# ---- Tools -----------------------------------------------------------------
def start_onboarding(employee_name: str, email: str) -> dict:
    """Create onboarding record and return next step + NDA template immediately."""
    emp_id = str(uuid.uuid4())[:8]
    EMPLOYEES[emp_id] = {
        "name": employee_name.strip(),
        "email": email.strip(),
        "tasks": [dict(t) for t in DEFAULT_TASKS],
        "qa": [],
        "payroll": {"routing": None, "acct_last4": None, "acct_type": None, "consent": False},
    }
    next_step = _next_required(EMPLOYEES[emp_id]["tasks"])
    nda = get_nda_template(emp_id)["nda_template"]
    return {
        "status": "success",
        "employee_id": emp_id,
        "next_step": next_step,                 # "Sign NDA"
        "nda_template": nda,                    # NDA included now
        "report": (
            f"Onboarding started for {employee_name} ({email}). "
            f"Your Employee ID is {emp_id}. Next: {next_step}. NDA included below."
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
    """Enforce prerequisites: NDA → Direct Deposit → Training."""
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}

    t = _task_by_name(emp["tasks"], task)
    if not t:
        return {"status": "error", "error_message": f"Task '{task}' not found."}

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
    return {"status": "success", "report": f"Task '{t['task']}' updated.", "next_step": next_step}

def begin_direct_deposit(employee_id: str) -> dict:
    """Returns the fields and form template to complete the Direct Deposit task."""
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}
    t = _task_by_name(emp["tasks"], "Set Up Direct Deposit")
    if not t:
        return {"status": "error", "error_message": "Payroll task not found."}
    if t["status"] == "locked":
        return {"status": "blocked", "error_message": "Complete 'Sign NDA' first."}
    return {
        "status": "success",
        "required_fields": [
            {"name": "routing_number", "type": "string", "format": "ABA-9"},
            {"name": "account_number_last4", "type": "string", "length": 4},
            {"name": "account_type", "type": "enum", "values": ["checking", "savings"]},
            {"name": "consent", "type": "boolean"},
        ],
        "form_template": get_direct_deposit_form(employee_id)["form"],
        "next_step": "Provide the above fields to complete Direct Deposit.",
    }

def submit_direct_deposit(employee_id: str, routing_number: str, account_number_last4: str,
                          account_type: str, consent: bool) -> dict:
    """Validates + stores direct deposit; completes payroll task and unlocks training."""
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}

    if not _valid_routing(routing_number):
        return {"status": "error", "error_message": "Invalid routing number (must be 9 digits with valid checksum)."}
    if not (account_number_last4.isdigit() and len(account_number_last4) == 4):
        return {"status": "error", "error_message": "account_number_last4 must be exactly 4 digits."}
    if account_type.lower() not in {"checking", "savings"}:
        return {"status": "error", "error_message": "account_type must be 'checking' or 'savings'."}
    if not consent:
        return {"status": "error", "error_message": "Consent is required to enable direct deposit."}

    emp["payroll"] = {
        "routing": routing_number,                 # demo only; encrypt in prod
        "acct_last4": account_number_last4,
        "acct_type": account_type.lower(),
        "consent": True,
    }

    _complete_task(emp, "Set Up Direct Deposit")
    next_step = _next_required(emp["tasks"])
    return {"status": "success", "report": "Direct deposit set. Payroll complete.", "next_step": next_step}

def ask_question(employee_id: str, question: str) -> dict:
    emp = _get_emp(employee_id)
    if not emp:
        return {"status": "error", "error_message": "Employee not found."}

    q = question.lower()
    if "vacation" in q or "pto" in q:
        answer = "Full-time employees receive 15 PTO days per year."
    elif "benefit" in q:
        answer = "Benefits start on day 1; medical enrollment must be completed within 30 days."
    elif "payroll" in q or "direct deposit" in q:
        answer = "Start with 'begin_direct_deposit' to view required fields, then 'submit_direct_deposit' to finish."
    elif "nda" in q or "non-disclosure" in q:
        answer = "You can request the NDA template via the 'get_nda_template' tool."
    # ---- New Q/A below ----
    elif "work hours" in q or "schedule" in q:
        answer = "Our standard work hours are 9 AM–5 PM EST, Monday through Friday, with flexible remote options."
    elif "holiday" in q or "office closed" in q:
        answer = "The office observes all federal holidays plus two floating personal holidays each year."
    elif "health insurance" in q:
        answer = "Health, dental, and vision insurance are available through BlueCross starting on your first day."
    elif "401k" in q or "retirement" in q:
        answer = "The company matches 100% of 401(k) contributions up to 4% of your salary."
    elif "equipment" in q or "laptop" in q:
        answer = "A company laptop and accessories will be shipped to your address within the first week of onboarding."
    elif "parking" in q or "commute" in q:
        answer = "Free parking passes are available for on-site employees; request one through the Facilities portal."
    elif "training" in q or "module" in q:
        answer = "Training Module 1 unlocks after you finish direct deposit setup. Additional modules follow in sequence."
    elif "sick leave" in q:
        answer = "Employees receive 10 sick days annually, accrued monthly."
    elif "probation" in q:
        answer = "New hires have a 90-day introductory period with regular feedback check-ins."
    elif "dress code" in q:
        answer = "Our dress code is smart casual; jeans and sneakers are acceptable unless client meetings require formal wear."
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
    return {"status": "success", "completed": completed, "total": total,
            "report": f"{emp['name']} completed {completed}/{total} steps."}

def get_nda_template(employee_id: Optional[str] = None) -> dict:
    """Returns a simple NDA template (string) with placeholders filled if employee known."""
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
""".strip()
    return {"status": "success", "nda_template": template}

def get_direct_deposit_form(employee_id: Optional[str] = None) -> dict:
    name = "________"
    if employee_id and (emp := _get_emp(employee_id)):
        name = emp["name"]
    form = f"""
DIRECT DEPOSIT AUTHORIZATION

Employee: {name}

I authorize ACME CORP to deposit my pay into the account indicated below and, if needed,
to debit entries for any erroneous credits.

Routing Number (9 digits): __________________
Account Number (last 4 only): __ __ __ __
Account Type: ☐ Checking   ☐ Savings
Consent: I agree to electronic deposit and acknowledge responsibility for accurate info.

Signature: _____________________   Date: __________
""".strip()
    return {"status": "success", "form": form}

# ---- Root Agent ------------------------------------------------------------
root_agent = Agent(
    name="Hari",
    model="gemini-2.0-flash",
    description="Autonomous HR onboarding & training assistant.",
    instruction=(
        "If the user has no employee_id, ask for full name and work email, call start_onboarding, "
        "and IMMEDIATELY present the NDA template from the result. "
        "Enforce the order: 1) Sign NDA → 2) Set Up Direct Deposit → 3) Training Module 1. "
        "Use list_tasks to show the next required step. "
        "For payroll, guide the user to call begin_direct_deposit to view required fields and form, "
        "then submit_direct_deposit to complete and unlock Training Module 1. "
        "Keep answers concise."
    ),
    tools=[
        start_onboarding,
        list_tasks,
        submit_task,
        ask_question,
        progress,
        get_nda_template,
        begin_direct_deposit,
        submit_direct_deposit,
        get_direct_deposit_form,
    ],
)
