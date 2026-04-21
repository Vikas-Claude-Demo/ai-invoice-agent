"""Run schema migration against Supabase using the SQL API."""
import httpx
import os
import sys
from dotenv import load_dotenv

load_dotenv(".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

with open("../supabase_schema.sql") as f:
    sql = f.read()

# Split into individual statements for better error reporting
statements = [s.strip() for s in sql.split(";") if s.strip() and not s.strip().startswith("--")]

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

success = 0
errors = []

for i, stmt in enumerate(statements):
    if not stmt:
        continue
    r = httpx.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec",
        headers=headers,
        json={"query": stmt + ";"},
        timeout=30,
    )
    if r.status_code in (200, 201, 204):
        success += 1
        print(f"  ✓ Statement {i+1}")
    else:
        # Many DDL statements succeed even with 4xx (already exists)
        err = r.text[:120]
        if "already exists" in err or "duplicate" in err.lower():
            print(f"  ~ Statement {i+1} (already exists, skipped)")
            success += 1
        else:
            print(f"  ✗ Statement {i+1}: {err}")
            errors.append((i+1, err))

print(f"\n{success} OK, {len(errors)} errors")
if errors:
    sys.exit(1)
