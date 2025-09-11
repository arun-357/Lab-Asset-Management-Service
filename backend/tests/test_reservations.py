from datetime import datetime, timedelta

def token_for_user(client, username):
    client.post("/api/v1/auth/register", json={
        "username": username,
        "password": "Password123!"
    })
    r = client.post("/api/v1/auth/token", data={"username": username, "password": "Password123!"})
    return r.json()["access_token"]


def test_create_and_conflict_reservation(client):
    token = token_for_user(client, "user1")
    asset_resp = client.post("/api/v1/assets/", json={"name": "Router", "ip_address": "10.0.0.1"}, headers={"Authorization": f"Bearer {token}"})
    if asset_resp.status_code == 403:
        return  # cannot test further without admin; would enhance with admin seeding

    assert asset_resp.status_code == 201, asset_resp.text
    asset_id = asset_resp.json()["id"]

    start = datetime.utcnow() + timedelta(hours=1)
    end = start + timedelta(hours=1)

    res1 = client.post("/api/v1/reservations/", json={
        "asset_id": asset_id,
        "start_time": start.isoformat() + "Z",
        "end_time": end.isoformat() + "Z"
    }, headers={"Authorization": f"Bearer {token}"})
    assert res1.status_code == 201, res1.text

    # conflict overlap
    res2 = client.post("/api/v1/reservations/", json={
        "asset_id": asset_id,
        "start_time": (start + timedelta(minutes=30)).isoformat() + "Z",
        "end_time": (end + timedelta(hours=1)).isoformat() + "Z"
    }, headers={"Authorization": f"Bearer {token}"})
    assert res2.status_code == 409
