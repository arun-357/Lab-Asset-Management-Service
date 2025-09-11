from app.core.security import decode_access_token

def test_register_and_login(client):
    # Register
    r = client.post("/api/v1/auth/register", json={
        "username": "alice",
        "password": "Password123!",
        "email": "alice@example.com"
    })
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["username"] == "alice"

    # Duplicate register
    r2 = client.post("/api/v1/auth/register", json={
        "username": "alice",
        "password": "Password123!"
    })
    assert r2.status_code == 400

    # Login
    r3 = client.post("/api/v1/auth/token", data={"username": "alice", "password": "Password123!"})
    assert r3.status_code == 200, r3.text
    token = r3.json()["access_token"]
    payload = decode_access_token(token)
    assert payload["sub"] == "alice"
