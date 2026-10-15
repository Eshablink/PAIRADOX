from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def person(pid, age, gender, seeks, minimum=22, maximum=40):
    return {
        "id": pid,
        "consent": True,
        "eligibility": {
            "opted_in": True,
            "age": age,
            "min_age": minimum,
            "max_age": maximum,
            "gender": gender,
            "seeking_genders": seeks,
        },
    }


def test_health():
    assert client.get("/health").json()["status"] == "ok"


def test_missing_dimensions_are_excluded_and_coverage_is_separate():
    response = client.post("/score", json={
        "dimension_scores": {"interests": 90, "values": 10, "intent": 100},
        "known_dimensions": ["interests", "intent"],
        "weights": {"interests": 0.5, "values": 0.2, "intent": 0.3},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 94
    assert data["evidence_coverage"] == 80
    assert data["excluded_dimensions"] == ["values"]


def test_all_unknown_has_zero_coverage_not_false_confidence():
    response = client.post("/score", json={
        "dimension_scores": {"interests": 50, "values": 50},
        "known_dimensions": [],
        "weights": {"interests": 0.6, "values": 0.4},
    })
    assert response.status_code == 200
    assert response.json()["score"] == 50
    assert response.json()["evidence_coverage"] == 0


def test_invalid_weights_rejected():
    response = client.post("/score", json={
        "dimension_scores": {"interests": 80, "values": 60},
        "known_dimensions": ["interests", "values"],
        "weights": {"interests": 0.8, "values": 0.8},
    })
    assert response.status_code == 422


def test_eligibility_requires_mutual_opt_in_and_preferences():
    good_a = person("a", 28, "woman", ["man"])
    good_b = person("b", 30, "man", ["woman"])
    response = client.post("/eligibility/filter", json={"participants": [good_a, good_b]})
    assert response.status_code == 200
    assert response.json()["eligible_pairs"] == [["a", "b"]]

    bad_b = person("b", 30, "man", ["man"])
    response = client.post("/eligibility/filter", json={"participants": [good_a, bad_b]})
    assert response.status_code == 200
    assert response.json()["eligible_pairs"] == []
    assert "not mutually satisfied" in response.json()["excluded_pairs"][0]["reason"]


def test_missing_preferences_do_not_become_eligible():
    a = person("a", 28, "woman", ["man"])
    b = person("b", 30, "man", [])
    response = client.post("/eligibility/filter", json={"participants": [a, b]})
    assert response.status_code == 200
    assert response.json()["eligible_pairs"] == []
