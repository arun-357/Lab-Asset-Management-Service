def auth_token(client):
    client.post("/api/v1/auth/register", json={
        "username": "bob",
        "password": "Password123!"
    })

    r = client.post("/api/v1/auth/token", data={"username": "bob", "password": "Password123!"})
    return r.json()["access_token"]


def test_asset_list_requires_auth(client):
    r = client.get("/api/v1/assets/")
    # should be 401 because of missing token
    assert r.status_code in (401, 403)

    token = auth_token(client)
    r2 = client.get("/api/v1/assets/", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
